const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const redis = require('../config/redis');
const Stripe = require('stripe');

let razorpay;
let stripe;

// Initialize Razorpay
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn("Razorpay keys missing. Razorpay features will be disabled.");
    }
} catch (err) {
    console.error("Razorpay init failed:", err.message);
}

// Initialize Stripe
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    } else {
        console.warn("Stripe secret key missing. Stripe features will be disabled.");
    }
} catch (err) {
    console.error("Stripe init failed:", err.message);
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
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay Payment and Settle
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

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createStripePaymentIntent = async (req, res) => {
    const { amount, currency = 'inr', payeeId } = req.body;
    console.log('Create Intent Request:', { amount, payeeId, userId: req.user._id });

    if (!stripe) {
        return res.status(503).json({ message: 'Stripe not configured' });
    }

    try {
        // Validate Payee and get Stripe Account ID
        const payee = await User.findById(payeeId).select('+stripeAccountId');
        if (!payee) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        if (!payee.stripeAccountId) {
            return res.status(400).json({
                message: 'Payment failed: Recipient has not added a Stripe account.',
                code: 'MISSING_STRIPE_ACCOUNT'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // amount in smallest currency unit (e.g., paise)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            transfer_data: {
                destination: payee.stripeAccountId,
            },
            metadata: {
                payerId: req.user._id.toString(),
                payeeId: payeeId.toString()
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe Intent Error Full:', error);

        // Handle specific Stripe errors
        if (error.code === 'account_invalid' || error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({
                message: 'Invalid Stripe Account ID. Please verify the recipient\'s Stripe ID.',
                code: 'INVALID_STRIPE_ACCOUNT'
            });
        }

        res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
};

// @desc    Verify Stripe Payment and Settle
// @route   POST /api/payment/verify-stripe
// @access  Private
const verifyStripePayment = async (req, res) => {
    const { paymentIntentId, payeeId, groupId, amount } = req.body;

    if (!stripe) {
        return res.status(503).json({ message: 'Stripe not configured' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Dedup check using paymentIntentId as identifier
            const existingTx = await Transaction.findOne({ razorpay_payment_id: paymentIntentId });

            if (existingTx) {
                return res.json({ status: 'success', transaction: existingTx, message: 'Transaction already recorded' });
            }

            const transaction = await Transaction.create({
                payer: req.user._id,
                payee: payeeId,
                amount: amount,
                group: groupId,
                razorpay_order_id: paymentIntentId, // Reuse field
                razorpay_payment_id: paymentIntentId, // Reuse field
                status: 'success'
            });

            // Invalidate cache
            const cacheKey = `group_balance:${groupId}`;
            await redis.del(cacheKey);

            res.json({ status: 'success', transaction });
        } else {
            res.status(400).json({ message: `Payment not succeeded. Status: ${paymentIntent.status}` });
        }
    } catch (error) {
        console.error('Stripe Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    createStripePaymentIntent,
    verifyStripePayment
};
