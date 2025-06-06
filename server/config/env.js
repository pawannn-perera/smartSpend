import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config({ path: '../.env' });

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("5000"),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "debug"])
    .default("info"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
});

// Validate and transform environment variables
const validateEnv = () => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      LOG_LEVEL: process.env.LOG_LEVEL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
    });
  } catch (error) {
    console.error("Environment validation error:", error.errors);
    process.exit(1);
  }
};

export const env = validateEnv();
