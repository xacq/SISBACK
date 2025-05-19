// routes/recommendations.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware'); // Tu middleware de JWT

// GET /api/recommendations - Protegida
router.get('/', authMiddleware, recommendationController.getRecommendations);

// POST /api/recommendations/feedback - Protegida
router.post('/feedback', authMiddleware, recommendationController.postRecommendationFeedback);

module.exports = router;