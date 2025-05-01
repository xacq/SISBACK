const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/profileController');

router.post('/:userId/profile', saveProfile);
router.get('/:userId/profile', getProfile);

module.exports = router;