const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const redis = require('../config/redis');

let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn("Razorpay keys missing. Payment features will be disabled.");
    }
} catch (err) {
    console.error("Razorpay init failed:", err.message);
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
    const { amount, payeeId, groupId } = req.body;

    if (!razorpay) {
        return res.status(503).json({ message: 'Payment gateway not configured' });
    }

    const options = {
        amount: amount * 100, // amount in paisa
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);

        // Temporarily log intention (optional)

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment and Settle
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payeeId, groupId, amount } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment successful
        try {
            const transaction = await Transaction.create({
                payer: req.user._id,
                payee: payeeId,
                amount: amount,
                group: groupId,
                razorpay_order_id,
                razorpay_payment_id,
                status: 'success'
            });

            // Invalidate cache
            const cacheKey = `group_balance:${groupId}`;
            await redis.del(cacheKey);

            res.json({ status: 'success', transaction });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
