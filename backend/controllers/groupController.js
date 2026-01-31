const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const simplifyDebts = require('../utils/debtGraph');
const redis = require('../config/redis');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        const group = await Group.create({
            name,
            members: [req.user._id]
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email upiId');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is member
        if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to view this group' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/add-member
// @access  Private
const addMember = async (req, res) => {
    const { email } = req.body;

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to add members' });
        }

        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (group.members.includes(userToAdd._id)) {
            return res.status(400).json({ message: 'User already in group' });
        }

        group.members.push(userToAdd._id);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get simplified balances
// @route   GET /api/groups/:id/balances
// @access  Private
const getGroupBalances = async (req, res) => {
    try {
        const groupId = req.params.id;

        // Check cache
        const cacheKey = `group_balance:${groupId}`;
        const cachedBalances = await redis.get(cacheKey);

        if (cachedBalances) {
            return res.json(JSON.parse(cachedBalances));
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const expenses = await Expense.find({ group: groupId })
            .populate('paid_by', 'name')
            .populate('split_details.user', 'name');

        const simplified = simplifyDebts(group.members, expenses);

        // Cache result
        await redis.set(cacheKey, JSON.stringify(simplified), 'EX', 3600);

        res.json(simplified);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's groups with personal net balance
// @route   GET /api/groups
// @access  Private
const getUserGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id });
        const userId = req.user._id.toString();

        const groupsWithBalance = await Promise.all(groups.map(async (group) => {
            const expenses = await Expense.find({ group: group._id });

            let myPaid = 0;
            let myShare = 0;

            expenses.forEach(exp => {
                // Amount I paid
                if (exp.paid_by.toString() === userId) {
                    myPaid += exp.amount;
                }

                // My share in this expense
                const mySplit = exp.split_details.find(split => split.user.toString() === userId);
                if (mySplit) {
                    myShare += mySplit.amount_owed;
                }
            });

            const myBalance = myPaid - myShare;

            return {
                ...group.toObject(),
                myBalance // Positive = Lent (Green), Negative = Owe (Yellow)
            };
        }));

        res.json(groupsWithBalance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member (or maybe restricted to creator? For now, any member can delete as per prompt "Delete Active Protocol" implying availability)
        // But usually deletion is sensitive. "Allow any user to add transactions" was previous context.
        // Prompt says "Add a Delete Protocol button within each Active Protocol section".
        // I'll allow any member to delete for simplicity unless restricted. 
        // Better to restrict to members.
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }

        // Delete all expenses associated with this group
        await Expense.deleteMany({ group: group._id });

        // Delete the group
        await Group.findByIdAndDelete(req.params.id);

        // Invalidate cache
        const cacheKey = `group_balance:${group._id}`;
        await redis.del(cacheKey);

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGroup,
    getGroupDetails,
    addMember,
    getGroupBalances,
    getUserGroups,
    deleteGroup
};
