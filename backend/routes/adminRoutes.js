import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import User from '../models/usersModel.js';
import Club from '../models/Club.js';

const router = Router();

// All admin routes require admin auth
router.use(protect, requireAdmin);

// Get all users (excluding admins)
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user (admin can change basic fields, but not role)
router.put('/users/:id', async (req, res) => {
  try {
    const allowed = ['name', 'q_id', 'course', 'section', 'year'];
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

// Delete user (prevent deleting admins)
router.delete('/users/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
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


