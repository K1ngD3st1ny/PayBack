const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { name, avatar } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.avatar = avatar || user.avatar;

            const updatedUser = await user.save();

            const userWithStripe = await User.findById(updatedUser._id).select('+stripeAccountId');

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                hasStripeAccount: !!userWithStripe.stripeAccountId,
                token: req.headers.authorization.split(' ')[1] // Return existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Stripe Account ID
// @route   PUT /api/users/profile/stripe-account
// @access  Private
const updateStripeAccountId = async (req, res) => {
    const { stripeAccountId } = req.body;

    // Basic validation for Stripe Account ID format (starts with 'acct_')
    if (stripeAccountId && !stripeAccountId.startsWith('acct_')) {
        return res.status(400).json({ message: 'Invalid Stripe Account ID format' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.stripeAccountId = stripeAccountId;
            const updatedUser = await user.save();

            res.json({
                message: 'Stripe Account ID updated successfully',
                user: {
                    _id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    hasStripeAccount: true
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateProfile,
    updateStripeAccountId
};
