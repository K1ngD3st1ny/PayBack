'use client';

import React, { useState } from 'react';
import { CreditCard, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../lib/api';

export default function StripeAccountInput({ initialAccountId, onUpdate, hasStripeAccount }) {
    const [accountId, setAccountId] = useState(initialAccountId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        if (!accountId.startsWith('acct_')) {
            setError('Stripe Account ID must start with "acct_"');
            setLoading(false);
            return;
        }

        try {
            await api.put('/users/profile/stripe-account', { stripeAccountId: accountId });
            setSuccess(true);
            onUpdate(accountId);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save Stripe Account ID');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <CreditCard className="text-purple-400" size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">Stripe Account ID</h3>
                    <p className="text-xs text-gray-400 mt-1">
                        Required to receive payments. Find this in your Stripe Dashboard.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Input
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder="acct_..."
                        className={`bg-black/40 border-white/10 ${error ? 'border-red-500 focus:border-red-500' :
                            success ? 'border-green-500 focus:border-green-500' : ''
                            }`}
                    />
                    {success && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading || accountId === initialAccountId}
                        className={success ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : success ? (
                            'Saved'
                        ) : (
                            hasStripeAccount || success ? 'Update Stripe ID' : 'Save Stripe ID'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
