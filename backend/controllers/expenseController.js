const Expense = require('../models/Expense');
const Group = require('../models/Group');
const redis = require('../config/redis');

// @desc    Add new expense
// @desc    Add new expense
// @route   POST /api/expenses/add
// @access  Private
const addExpense = async (req, res) => {
    const { description, amount, groupId, splitDetails, paidBy, tag } = req.body;

    if (!description || !amount || !groupId) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Validate paidBy if provided
        let payerId = req.user._id;
        if (paidBy) {
            if (!group.members.includes(paidBy)) {
                return res.status(400).json({ message: 'Payer must be a member of the group' });
            }
            payerId = paidBy;
        }

        const expense = await Expense.create({
            description,
            amount,
            tag: tag || 'Other',
            group: groupId,
            paid_by: payerId,
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

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Verify user has permission (must be a member of the group)
        const group = await Group.findById(expense.group);
        if (!group) {
            return res.status(404).json({ message: 'Associated group not found' });
        }

        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this expense' });
        }

        await Expense.findByIdAndDelete(req.params.id);

        // Invalidate cache
        const cacheKey = `group_balance:${expense.group}`;
        await redis.del(cacheKey);

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all expenses involving the user (paid by or involved in split)
// @route   GET /api/expenses/user
// @access  Private
const getUserExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        const expenses = await Expense.find({
            $or: [
                { paid_by: userId },
                { 'split_details.user': userId }
            ]
        }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addExpense,
    getGroupExpenses,
    deleteExpense,
    getUserExpenses
};
