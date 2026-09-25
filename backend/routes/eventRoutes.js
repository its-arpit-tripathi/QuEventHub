// import express from 'express';
// import { getEvents, registerForEvent } from '../controllers/eventController.js';
// import { protect } from '../middleware/authMiddleware.js';

// const router = express.Router();

// router.get('/', protect, getEvents);

// router.post('/register', protect, registerForEvent);
// router.get('/myevents', protect, getMyEvents);

// export default router;


import express from 'express';
import {
  getEvents,
  registerForEvent,
  getMyEvents,
  createClubEvent,
  getClubEvents,
  updateClubEvent,
  deleteClubEvent,
  getClubEventRegistrations,
  markAttendance,
} from '../controllers/eventController.js';
import { protect, requireClub } from '../middleware/authMiddleware.js';
import Event from '../models/Event.js';
import imageUpload from '../middleware/imageUpload.js';

const router = express.Router();

// Public events
router.get('/', getEvents);

// Club-managed events (club auth required)
router.get('/club', protect, requireClub, getClubEvents);
router.post('/club', protect, requireClub, imageUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'paymentQr', maxCount: 1 }]), createClubEvent);
router.put('/club/:id', protect, requireClub, imageUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'paymentQr', maxCount: 1 }]), updateClubEvent);
router.delete('/club/:id', protect, requireClub, deleteClubEvent);
router.get('/club/:id/registrations', protect, requireClub, getClubEventRegistrations);
router.post('/club/:id/attendance/:registrationId', protect, requireClub, markAttendance);

// Single event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student/user registration routes
router.post('/register', protect, registerForEvent);
router.get('/myevents', protect, getMyEvents);

export default router;