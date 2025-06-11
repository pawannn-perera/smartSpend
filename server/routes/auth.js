import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/avatars";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create JWT
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email }],
    });

    if (!user) {
      // Create new user with Google data
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
        // password not required for Google users
      });
      await user.save();
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = payload.sub;
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
      }
      await user.save();
    }

    // Create JWT (same format as regular login)
    const secret = process.env.JWT_SECRET;
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: err.message || "File upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { name, email, preferences } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (preferences)
        user.preferences = { ...user.preferences, ...preferences };

      // Update avatar if uploaded
      if (req.file) {
        try {
          // If user already has an avatar, delete the old one
          if (
            user.avatar &&
            (user.avatar.startsWith("/uploads/") ||
              user.avatar.includes("/uploads/"))
          ) {
            let oldAvatarPath;
            if (user.avatar.includes("http://localhost:5000")) {
              // Handle full URL format
              const urlPath = new URL(user.avatar).pathname;
              oldAvatarPath = path.join(__dirname, "..", urlPath);
            } else {
              // Handle relative path format
              oldAvatarPath = path.join(__dirname, "..", user.avatar);
            }

            console.log(
              "Attempting to delete old avatar at:",
              oldAvatarPath
            );
            if (fs.existsSync(oldAvatarPath)) {
              fs.unlinkSync(oldAvatarPath);
              console.log("Old avatar deleted successfully");
            }
          }

          // Set new avatar path
          const relativePath = req.file.path.replace(/\\/g, "/");
          // Use relative path for better portability
          user.avatar = `/${relativePath}`;
          console.log("New avatar path set to:", user.avatar);
        } catch (error) {
          console.error("Error handling avatar update:", error);
          // Continue even if there's an error with the avatar
        }
      }

      await user.save();

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/auth/profile/avatar
// @desc    Remove user avatar
// @access  Private
router.delete("/profile/avatar", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete avatar file if it exists
    if (
      user.avatar &&
      (user.avatar.startsWith("/uploads/") ||
        user.avatar.includes("/uploads/"))
    ) {
      try {
        let avatarPath;
        if (user.avatar.includes("http://localhost:5000")) {
          // Handle full URL format
          const urlPath = new URL(user.avatar).pathname;
          avatarPath = path.join(__dirname, "..", urlPath);
        } else {
          // Handle relative path format
          avatarPath = path.join(__dirname, "..", user.avatar);
        }

        console.log("Attempting to delete avatar at path:", avatarPath);

        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log("Avatar file deleted successfully");
        } else {
          console.log("Avatar file not found at path:", avatarPath);
        }
      } catch (fileError) {
        console.error("Error deleting avatar file:", fileError);
        // Continue with the process even if file deletion fails
      }
    } else {
      console.log(
        "No avatar to delete or invalid avatar path:",
        user.avatar
      );
    }

    // Remove avatar from user
    user.avatar = undefined;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/currency
// @desc    Update user currency
// @access  Private
router.put("/currency", authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preferences.currency = currency;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Update currency error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/auth/profile
// @desc    Delete current user profile
// @access  Private
router.delete("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's avatar file if it exists
    if (
      user.avatar &&
      (user.avatar.startsWith("/uploads/") ||
        user.avatar.includes("/uploads/"))
    ) {
      try {
        let avatarPath;
        if (user.avatar.includes("http://localhost:5000")) {
          const urlPath = new URL(user.avatar).pathname;
          avatarPath = path.join(__dirname, "..", urlPath);
        } else {
          avatarPath = path.join(__dirname, "..", user.avatar);
        }

        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log("User avatar deleted successfully");
        }
      } catch (fileError) {
        console.error("Error deleting user avatar file:", fileError);
      }
    }

    // Delete the user from database
    await User.findByIdAndDelete(req.user.id);

    // Optionally: Delete related data here (expenses, bills, warranties, etc.)
    // Example:
    // await Expense.deleteMany({ userId: req.user.id });
    // await Bill.deleteMany({ userId: req.user.id });
    // await Warranty.deleteMany({ userId: req.user.id });

    res.json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
