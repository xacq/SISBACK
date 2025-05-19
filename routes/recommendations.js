import express from 'express';
import { 
  getRecommendations, 
  postRecommendationFeedback 
} from '../controllers/recommendationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas con JWT
router.get('/', authMiddleware, getRecommendations);
router.post('/feedback', authMiddleware, postRecommendationFeedback);

export default router;