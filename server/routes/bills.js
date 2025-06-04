import express from 'express';
import Bill from '../models/Bill.js';

const router = express.Router();

// @route   GET /api/bills
// @desc    Get all bills for a user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { isPaid, upcoming, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }
    
    if (upcoming === 'true') {
      const today = new Date();
      filter.dueDate = { $gte: today };
      filter.isPaid = false;
    }
    
    // Get total count for pagination
    const total = await Bill.countDocuments(filter);
    
    // Get bills
    const bills = await Bill.find(filter)
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    res.json({
      bills,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bills
// @desc    Create a new bill
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      name,
      amount,
      dueDate,
      category,
      isRecurring,
      recurringPeriod,
      reminderDate,
      notes
    } = req.body;
    
    const newBill = new Bill({
      user: req.user.id,
      name,
      amount,
      dueDate,
      category,
      isRecurring,
      recurringPeriod,
      reminderDate,
      notes
    });
    
    const bill = await newBill.save();
    res.status(201).json(bill);
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bills/:id
// @desc    Get bill by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bills/:id
// @desc    Update bill
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      amount,
      dueDate,
      category,
      isRecurring,
      recurringPeriod,
      isPaid,
      reminderDate,
      notes
    } = req.body;
    
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Update fields
    if (name) bill.name = name;
    if (amount !== undefined) bill.amount = amount;
    if (dueDate) bill.dueDate = dueDate;
    if (category) bill.category = category;
    if (isRecurring !== undefined) bill.isRecurring = isRecurring;
    if (recurringPeriod) bill.recurringPeriod = recurringPeriod;
    if (isPaid !== undefined) bill.isPaid = isPaid;
    if (reminderDate) bill.reminderDate = reminderDate;
    if (notes !== undefined) bill.notes = notes;
    
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bills/:id
// @desc    Delete bill
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    await bill.deleteOne();
    res.json({ message: 'Bill removed' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bills/upcoming/reminders
// @desc    Get bills that need reminders
// @access  Private
router.get('/upcoming/reminders', async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Find bills due within the next week that aren't paid
    const upcomingBills = await Bill.find({
      user: req.user.id,
      dueDate: { $gte: today, $lte: nextWeek },
      isPaid: false
    }).sort({ dueDate: 1 });
    
    res.json(upcomingBills);
  } catch (error) {
    console.error('Get bill reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bills/:id/pay
// @desc    Mark bill as paid
// @access  Private
router.put('/:id/pay', async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    bill.isPaid = true;
    
    // If bill is recurring, create the next bill
    if (bill.isRecurring) {
      const newDueDate = new Date(bill.dueDate);
      
      // Calculate next due date
      switch (bill.recurringPeriod) {
        case 'Weekly':
          newDueDate.setDate(newDueDate.getDate() + 7);
          break;
        case 'Monthly':
          newDueDate.setMonth(newDueDate.getMonth() + 1);
          break;
        case 'Quarterly':
          newDueDate.setMonth(newDueDate.getMonth() + 3);
          break;
        case 'Annually':
          newDueDate.setFullYear(newDueDate.getFullYear() + 1);
          break;
        default:
          newDueDate.setMonth(newDueDate.getMonth() + 1);
      }
      
      const newReminderDate = new Date(newDueDate);
      newReminderDate.setDate(newReminderDate.getDate() - 3); // 3 days before by default
      
      const newBill = new Bill({
        user: bill.user,
        name: bill.name,
        amount: bill.amount,
        dueDate: newDueDate,
        category: bill.category,
        isRecurring: bill.isRecurring,
        recurringPeriod: bill.recurringPeriod,
        reminderDate: newReminderDate,
        notes: bill.notes
      });
      
      await newBill.save();
    }
    
    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
    console.error('Pay bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;