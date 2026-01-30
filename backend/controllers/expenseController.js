const Expense = require('../models/Expense');
const Group = require('../models/Group');
const redis = require('../config/redis');

// @desc    Add new expense
// @route   POST /api/expenses/add
// @access  Private
const addExpense = async (req, res) => {
    const { description, amount, groupId, splitDetails } = req.body;

    if (!description || !amount || !groupId) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const expense = await Expense.create({
            description,
            amount,
            group: groupId,
            paid_by: req.user._id,
            split_details: splitDetails || [] // Expects [{ user: id, amount_owed: num }]
        });

        // Invalidate cache
        const cacheKey = `group_balance:${groupId}`;
        await redis.del(cacheKey);

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get expenses for a group
// @route   GET /api/groups/:id/expenses
// @access  Private
const getGroupExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.id })
            .populate('paid_by', 'name')
            .sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addExpense,
    getGroupExpenses
};
