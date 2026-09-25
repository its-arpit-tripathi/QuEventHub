import express from 'express';
import {
  createClub,
  deleteClub,
  getClubById,
  getClubs,
  joinClub,
  updateClub,
} from '../controllers/clubController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import imageUpload from '../middleware/imageUpload.js';

const router = express.Router();

router.route('/').get(getClubs).post(protect, requireAdmin, imageUpload.single('image'), createClub);

router
  .route('/:id')
  .get(getClubById)
  .put(protect, requireAdmin, imageUpload.single('image'), updateClub)
  .delete(protect, requireAdmin, deleteClub);

router.post('/:id/join', protect, joinClub);

export default router;
