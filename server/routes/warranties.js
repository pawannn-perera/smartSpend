import express from 'express';
import Warranty from '../models/Warranty.js';

const router = express.Router();

// @route   GET /api/warranties
// @desc    Get all warranties for a user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { category, expired, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (category) {
      filter.category = category;
    }
    
    const today = new Date();
    if (expired === 'true') {
      filter.expirationDate = { $lt: today };
    } else if (expired === 'false') {
      filter.expirationDate = { $gte: today };
    }
    
    // Get total count for pagination
    const total = await Warranty.countDocuments(filter);
    
    // Get warranties
    const warranties = await Warranty.find(filter)
      .sort({ expirationDate: 1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      warranties,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get warranties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/warranties
// @desc    Create a new warranty
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      productName,
      purchaseDate,
      expirationDate,
      retailer,
      purchasePrice,
      category,
      documentUrls,
      notes,
      reminderDate
    } = req.body;
    
    const newWarranty = new Warranty({
      user: req.user.id,
      productName,
      purchaseDate,
      expirationDate,
      retailer,
      purchasePrice,
      category,
      documentUrls,
      notes,
      reminderDate
    });
    
    const warranty = await newWarranty.save();
    res.status(201).json(warranty);
  } catch (error) {
    console.error('Create warranty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/warranties/:id
// @desc    Get warranty by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const warranty = await Warranty.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }
    
    res.json(warranty);
  } catch (error) {
    console.error('Get warranty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/warranties/:id
// @desc    Update warranty
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      productName,
      purchaseDate,
      expirationDate,
      retailer,
      purchasePrice,
      category,
      documentUrls,
      notes,
      reminderDate
    } = req.body;
    
    const warranty = await Warranty.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }
    
    // Update fields
    if (productName) warranty.productName = productName;
    if (purchaseDate) warranty.purchaseDate = purchaseDate;
    if (expirationDate) warranty.expirationDate = expirationDate;
    if (retailer) warranty.retailer = retailer;
    if (purchasePrice !== undefined) warranty.purchasePrice = purchasePrice;
    if (category) warranty.category = category;
    if (documentUrls) warranty.documentUrls = documentUrls;
    if (notes !== undefined) warranty.notes = notes;
    if (reminderDate) warranty.reminderDate = reminderDate;
    
    const updatedWarranty = await warranty.save();
    res.json(updatedWarranty);
  } catch (error) {
    console.error('Update warranty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/warranties/:id
// @desc    Delete warranty
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const warranty = await Warranty.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!warranty) {
      return res.status(404).json({ message: 'Warranty not found' });
    }
    
    await warranty.deleteOne();
    res.json({ message: 'Warranty removed' });
  } catch (error) {
    console.error('Delete warranty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/warranties/expiring/soon
// @desc    Get warranties expiring soon
// @access  Private
router.get('/expiring/soon', async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Find warranties expiring within the next month
    const expiringWarranties = await Warranty.find({
      user: req.user.id,
      expirationDate: { $gte: today, $lte: nextMonth }
    }).sort({ expirationDate: 1 });
    
    res.json(expiringWarranties);
  } catch (error) {
    console.error('Get expiring warranties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;