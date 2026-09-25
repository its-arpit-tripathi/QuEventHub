import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/usersModel.js';
import Club from '../models/Club.js';

const router = Router();

// All admin routes require admin auth
router.use(protect, requireAdmin);

// Get all users
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user (admin can change basic fields and role)
router.put('/users/:id', async (req, res) => {
  try {
    const allowed = ['name', 'q_id', 'course', 'section', 'year', 'phone', 'role'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all clubs
router.get('/clubs', async (_req, res) => {
  try {
    const clubs = await Club.find().select('-passwordHash');
    res.json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


