import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import Button from './ui/Button';

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, payeeId, groupId, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                setMessage(error.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Verify on backend
                try {
                    await api.post('/payment/verify-stripe', {
                        paymentIntentId: paymentIntent.id,
                        payeeId,
                        groupId,
                        amount
                    });
                    onSuccess();
                    onClose();
                } catch (err) {
                    setMessage('Payment succeeded but verification failed. Support notified.');
                    console.error('Verification failed', err);
                }
                setIsProcessing(false);
            } else {
                setMessage('Payment processing...');
                setIsProcessing(false);
            }
        } catch (err) {
            setMessage('An unexpected error occurred.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <PaymentElement
                    options={{
                        theme: 'night',
                        variables: {
                            colorPrimary: '#a855f7',
                            colorBackground: '#1a1a1a',
                            colorText: '#ffffff',
                            colorDanger: '#ef4444',
                            fontFamily: 'Inter, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '8px',
                        },
                    }}
                />
            </div>

            {message && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/30">
                    {message}
                </div>
            )}

            <Button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full relative overflow-hidden"
            >
                {isProcessing ? (
                    <span className="animate-pulse">PROCESSING SECURELY...</span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Lock size={16} /> PAY ₹{amount}
                    </span>
                )}
            </Button>

            <div className="text-center text-[10px] text-gray-500 flex justify-center items-center gap-1">
                <CreditCard size={10} /> SECURED BY STRIPE
            </div>
        </form>
    );
};

export default function PaymentModal({ isOpen, onClose, amount, payeeId, groupId, onSuccess }) {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (isOpen && amount > 0) {
            // Create PaymentIntent as soon as the modal opens
            api.post('/payment/create-payment-intent', { amount, currency: 'inr' })
                .then(res => setClientSecret(res.data.clientSecret))
                .catch(err => {
                    console.error('Failed to init payment', err);
                    alert("Failed to initialize secure payment gateway.");
                    onClose();
                });
        }
    }, [isOpen, amount]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md bg-black border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/95 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white font-orbitron tracking-wide">SECURE CHECKOUT</h2>
                        <p className="text-xs text-purple-400 font-mono mt-1">ENCRYPTED TRANSACTION CHANNEL</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                            <CheckoutForm
                                amount={amount}
                                payeeId={payeeId}
                                groupId={groupId}
                                onSuccess={onSuccess}
                                onClose={onClose}
                            />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-purple-400 text-xs font-mono animate-pulse">ESTABLISHING UPLINK...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
