const express = require('express');
const router = express.Router();
const { updateProfile, updateStripeAccountId } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.put('/profile/stripe-account', protect, updateStripeAccountId);

module.exports = router;
