'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PieChart, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function StatisticsModal({ isOpen, onClose, groupId }) {
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            fetchExpenses();
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const endpoint = groupId ? `/groups/${groupId}/expenses` : '/expenses/user';
            const res = await api.get(endpoint);
            processData(res.data);
        } catch (error) {
            console.error('Failed to fetch statistics', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?._id;
        const tagTotals = {};

        data.forEach(exp => {
            const tag = exp.tag || 'Other';
            let myShare = 0;

            // Find my share in split_details
            const textMatch = exp.split_details.find(sd => sd.user === userId);
            if (textMatch) {
                myShare = textMatch.amount_owed;
            } else if (exp.paid_by === userId || exp.paid_by?._id === userId) {
                // For group view, we might want to see TOTAL expense distribution or just MY share?
                // Prompt: "Based on expenses relevant to the current user (i.e., expenses the user is involved in)"
                // ALSO: "Each protocol should display a different chart based on its own data"
                // "Pie chart must represent: Expense distribution by tag/category... ONLY for the currently selected Active Protocol"

                // If I am browsing a group, should I see ALL expenses in that group by tag?
                // Or only my involvement?
                // Prompt says: "Total expenses grouped by tag... Based on expenses relevant to the current user"
                // This phrasing is tricky. "Based on expenses relevant to" implies filtering.
                // But "Pie chart must represent: Total expenses grouped by tag" implies group total.
                // Given the context of "Protocol Analytics", seeing where the GROUP spends money (e.g. mostly Food) is useful.
                // But sticking to "relevant to current user" is safer based on "Data Representation" section.

                // Let's stick to the existing logic: My Share.
                // If I paid, expense amount is relevant.
                if (!exp.split_details || exp.split_details.length === 0) {
                    myShare = exp.amount;
                } else {
                    // Only count if I paid? Or should we count total?
                    // To be safe and consistent with "Spending Analytics", showing MY spending is best.
                    // But if I want to see "Protocol Stats", maybe I want to see how much the GROUP spent on Food.

                    // Let's check "Pie Chart Requirements" again.
                    // "Total expenses grouped by tag... Based on expenses relevant to the current user"
                    // If I am in a group, and I didn't pay/participate in an expense, is it relevant? No.

                    // However, for fetching, I am getting /groups/:id/expenses which returns ALL expenses.
                    // I should filter for involvement.

                    // Logic:
                    // If I am payer -> Count full amount? Or just my share?
                    // Usually "Spending" means my cost.
                    // If I paid 1000 for Food, and split 500/500. My spending is 500.
                    // The other person's spending is 500.
                    // If I show 1000 under Food, it's "Group Spending".

                    // I will stick to "My Share" logic as implemented in `getUserExpenses` filtering context.
                    // But `getGroupExpenses` (used when groupId is present) returns ALL.

                    // FILTER: Is user involved?
                    const amIPayer = exp.paid_by._id === userId || exp.paid_by === userId;
                    const amIInSplit = exp.split_details.some(sd => sd.user === userId);

                    if (!amIPayer && !amIInSplit) return; // Skip irrelevant expenses

                    // Logic for Value:
                    // If I paid, my cost is Amount - (sum of others owed).
                    // Simplify: My Cost = (My Split Amount if defined) OR (Amount - Received Splits).
                    // Actually, simpler:
                    // Cost = Pay - Receive.
                    // But for "Distribution", we want "Consumption".
                    // If I ate food worth 500, that is my Food expense.
                    // Even if I paid 0 (someone else paid).

                    // So: value = Amount Owed by Me.
                    // If I am Payer, calculate my split portion.
                    // Note: `split_details` lists who OWES. Payer is implicitly carrying the rest?
                    // In my logic `split_details` contains everyone in EQUAL split usually.
                    // But let's check Expense.js schema and Add Logic.
                    // `splitDetails` stores { user, amount_owed }.
                    // In EQUAL split, EVERYONE is in `splitDetails`?
                    // Let's check `handleAddExpense` in `GroupDetails`.
                    // Yes: `splitDetails = selectedMembers.map...`.

                    // So `split_details` should contain ME if I am part of the split.
                    // So `myShare` logic above:
                    // `const textMatch = exp.split_details.find(sd => sd.user === userId);`
                    // If found, that IS my share/consumption.
                    // If NOT found, and I am Payer... maybe I paid for others only? My consumption is 0.
                    // So "myShare" logic holds.
                }
                if (!exp.split_details || exp.split_details.length === 0) {
                    myShare = exp.amount;
                }
            }

            if (myShare > 0) {
                tagTotals[tag] = (tagTotals[tag] || 0) + myShare;
            }
        });

        const total = Object.values(tagTotals).reduce((a, b) => a + b, 0);

        // Sort by value desc
        const sorted = Object.entries(tagTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, value], index) => ({
                tag,
                value,
                percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
                color: getTagColor(tag)
            }));

        setChartData(sorted);
    };

    const getTagColor = (tag) => {
        const colors = {
            'Food': '#ef4444', // Red
            'Travel': '#3b82f6', // Blue
            'Rent': '#a855f7', // Purple
            'Groceries': '#22c55e', // Green
            'Utilities': '#eab308', // Yellow
            'Entertainment': '#ec4899', // Pink
            'Shopping': '#f97316', // Orange
            'Medical': '#14b8a6', // Teal
            'Other': '#6b7280'  // Gray
        };
        return colors[tag] || '#6b7280';
    };

    if (!mounted) return null;

    // Conic Gradient for Pie Chart
    let gradientString = '';
    let currentDeg = 0;
    chartData.forEach(item => {
        const deg = (item.value / chartData.reduce((a, b) => a + b.value, 0)) * 360;
        gradientString += `${item.color} ${currentDeg}deg ${currentDeg + deg}deg, `;
        currentDeg += deg;
    });
    gradientString = gradientString.slice(0, -2); // remove separate comma

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden z-[101] max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-black to-purple-900/10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center gap-3">
                                    <PieChart className="text-cyan-500" /> {groupId ? 'PROTOCOL ANALYTICS' : 'SPENDING ANALYTICS'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center text-cyan-500 gap-4">
                                    <Loader2 className="animate-spin w-12 h-12" />
                                    <span className="font-mono text-sm animate-pulse">CALCULATING METRICS...</span>
                                </div>
                            ) : chartData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-500 font-mono border border-dashed border-white/10 rounded-xl">
                                    NO DATA AVAILABLE
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Pie Chart */}
                                    <div className="relative w-64 h-64 flex-shrink-0">
                                        <div
                                            className="w-full h-full rounded-full border-4 border-black/50 shadow-2xl"
                                            style={{
                                                background: `conic-gradient(${gradientString})`
                                            }}
                                        />
                                        <div className="absolute inset-0 m-auto w-40 h-40 bg-black rounded-full flex items-center justify-center flex-col shadow-inner">
                                            <span className="text-gray-400 text-xs font-mono">TOTAL SHARE</span>
                                            <span className="text-white font-bold text-xl font-orbitron">
                                                ₹{chartData.reduce((a, b) => a + b.value, 0).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex-1 w-full grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-2">
                                        {chartData.map((item) => (
                                            <div key={item.tag} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                                                    <span className="text-white font-medium">{item.tag}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-bold font-mono">₹{item.value.toFixed(0)}</div>
                                                    <div className="text-xs text-gray-400">{item.percentage}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
