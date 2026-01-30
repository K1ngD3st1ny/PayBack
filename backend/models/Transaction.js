const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    razorpay_order_id: {
        type: String
    },
    razorpay_payment_id: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
