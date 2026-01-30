const express = require('express');
const router = express.Router();
const { createGroup, getGroupDetails, addMember, getGroupBalances, getUserGroups } = require('../controllers/groupController');
const { getGroupExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createGroup);
router.get('/', protect, getUserGroups);
router.get('/:id', protect, getGroupDetails);
router.post('/:id/add-member', protect, addMember);
router.get('/:id/balances', protect, getGroupBalances);
router.get('/:id/expenses', protect, getGroupExpenses);

module.exports = router;
