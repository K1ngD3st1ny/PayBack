'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { BentoGrid } from '@/components/ui/BentoGrid'; // BentoGridItem not directly used in children, but good to have
import PaymentModal from '@/components/PaymentModal';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Receipt, RefreshCw, AlertCircle, Wallet, Trash2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import FeedbackPopup from '@/components/ui/FeedbackPopup';

export default function GroupDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Forms
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(''); // ID of user who paid
    const [tag, setTag] = useState('Other');
    const [splitWith, setSplitWith] = useState([]); // Array of user IDs
    const [deleteGroupModal, setDeleteGroupModal] = useState(false);

    const TAGS = ['Food', 'Travel', 'Rent', 'Groceries', 'Utilities', 'Entertainment', 'Shopping', 'Medical', 'Other'];

    // Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, expenseId: null });

    // Split Logic
    const [splitType, setSplitType] = useState('EQUAL'); // 'EQUAL' | 'UNEQUAL'
    const [manualSplits, setManualSplits] = useState({}); // { userId: amount }
    const [splitError, setSplitError] = useState('');
    const [feedback, setFeedback] = useState({ isOpen: false, message: '', type: 'success' });

    const [paymentModal, setPaymentModal] = useState({ isOpen: false, amount: 0, payeeId: null });

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setCurrentUser(JSON.parse(u));
        fetchGroupData();
    }, [id]);

    const fetchGroupData = async () => {
        try {
            const [groupRes, expenseRes, balanceRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/groups/${id}/expenses`),
                api.get(`/groups/${id}/balances`)
            ]);
            setGroup(groupRes.data);
            setExpenses(expenseRes.data);
            setBalances(balanceRes.data);

            setBalances(balanceRes.data);

            // Initialize defaults
            const memberIds = groupRes.data.members.map(m => m._id);
            setSplitWith(memberIds);

            // Set default payer to current user if not set
            if (!paidBy && currentUser) {
                setPaidBy(currentUser._id);
            }

            const initialSplits = {};
            groupRes.data.members.forEach(m => initialSplits[m._id] = 0);
            setManualSplits(initialSplits);

        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${id}/add-member`, { email: newMemberEmail });
            setNewMemberEmail('');
            fetchGroupData();
        } catch (error) {
            alert('Failed to add member: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleManualSplitChange = (userId, value) => {
        setManualSplits(prev => ({
            ...prev,
            [userId]: parseFloat(value) || 0
        }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setSplitError('');
        if (!amount || !description) return;

        const totalAmount = parseFloat(amount);
        let splitDetails = [];

        try {
            if (splitType === 'EQUAL') {
                const selectedMembers = group.members.filter(m => splitWith.includes(m._id));
                if (selectedMembers.length === 0) return alert('Select at least one person to split with');

                const splitAmount = totalAmount / selectedMembers.length;
                splitDetails = selectedMembers.map(m => ({
                    user: m._id,
                    amount_owed: splitAmount
                }));
            } else {
                // Validate Unequal Split
                const currentSum = Object.values(manualSplits).reduce((a, b) => a + b, 0);
                if (Math.abs(currentSum - totalAmount) > 0.1) {
                    setSplitError(`Split sum (${currentSum}) must equal Total (${totalAmount})`);
                    return;
                }
                splitDetails = Object.keys(manualSplits).map(userId => ({
                    user: userId,
                    amount_owed: manualSplits[userId]
                }));
            }

            await api.post('/expenses/add', {
                description,
                amount: totalAmount,
                groupId: id,
                splitDetails,
                paidBy: paidBy || currentUser._id,
                tag
            });

            // Reset form
            setDescription('');
            setAmount('');
            setTag('Other');
            setManualSplits(prev => {
                const reset = {};
                group.members.forEach(m => reset[m._id] = 0);
                return reset;
            });
            fetchGroupData();
        } catch (error) {
            alert('Failed to add expense');
        }
    };

    const handleDeleteClick = (expenseId) => {
        setDeleteModal({ isOpen: true, expenseId });
    };

    const confirmDelete = async () => {
        if (!deleteModal.expenseId) return;

        try {
            await api.delete(`/expenses/${deleteModal.expenseId}`);
            fetchGroupData();
            setDeleteModal({ isOpen: false, expenseId: null });
        } catch (error) {
            alert('Failed to delete expense');
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await api.delete(`/groups/${id}`);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete group', error);
            alert('Failed to delete protocol');
        }
    };

    const toggleSplitWith = (userId) => {
        setSplitWith(prev => {
            if (prev.includes(userId)) return prev.filter(id => id !== userId);
            return [...prev, userId];
        });
    };

    const handleSettle = (transaction) => {
        if (!currentUser) return;
        setPaymentModal({
            isOpen: true,
            amount: transaction.amount,
            payeeId: transaction.to
        });
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-cyan-500 font-orbitron">ESTABLISHING UPLINK...</div>;
    if (!group) return <div className="p-8 text-center text-red-500 font-orbitron">SIGNAL LOST (GROUP NOT FOUND)</div>;

    const remainingSplit = parseFloat(amount || 0) - Object.values(manualSplits).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen p-4 md:p-8 relative">

            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end">
                <div>
                    <Button onClick={() => router.push('/dashboard')} variant="ghost" className="mb-4 pl-0 hover:bg-transparent">
                        <ArrowLeft size={16} className="mr-2" /> DASHBOARD
                    </Button>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 neon-text break-words">
                        {group.name}
                    </h1>
                </div>
                <div className="text-right text-sm text-cyan-400/60 font-mono hidden md:block">
                    PROTOCOL ID: {group._id} <br />
                    NODES ACTIVE: {group.members.length} <br />
                    <button
                        onClick={() => setDeleteGroupModal(true)}
                        className="mt-2 text-red-500 hover:text-red-400 underline decoration-red-500/30 hover:decoration-red-400 transition-all cursor-pointer flex items-center justify-end gap-1 ml-auto"
                    >
                        <Trash2 size={12} /> DELETE PROTOCOL
                    </button>
                </div>
            </div>

            <BentoGrid>
                {/* 1. Add Expense Module (Large) */}
                <div className="md:col-span-2 md:row-span-2 glass-card p-6 rounded-3xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 shrink-0">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-white font-orbitron">
                            <Receipt size={20} className="text-pink-500" /> NEW TRANSACTION
                        </h2>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setSplitType('EQUAL')}
                                className={cn("px-4 py-1.5 text-xs rounded-md transition-all font-bold", splitType === 'EQUAL' ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-gray-400 hover:text-white")}
                            >
                                EQUAL
                            </button>
                            <button
                                onClick={() => setSplitType('UNEQUAL')}
                                className={cn("px-4 py-1.5 text-xs rounded-md transition-all font-bold", splitType === 'UNEQUAL' ? "bg-pink-500 text-black shadow-lg shadow-pink-500/20" : "text-gray-400 hover:text-white")}
                            >
                                UNEQUAL
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleAddExpense} className="flex flex-col flex-1 min-h-0 relative">
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-cyan-400 mb-2 block font-mono tracking-wider">PAYMENT FOR...</label>
                                    <Input
                                        placeholder="e.g. Server Upkeep"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                                    />
                                </div>
                                <div className="w-full md:w-1/3">
                                    <label className="text-xs text-pink-400 mb-2 block font-mono tracking-wider">TOTAL AMOUNT</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-pink-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-purple-400 mb-2 block font-mono tracking-wider">PAID BY</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-purple-500 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                                            value={paidBy}
                                            onChange={e => setPaidBy(e.target.value)}
                                        >
                                            {group.members.map(m => (
                                                <option key={m._id} value={m._id} className="bg-gray-900">{m.name} {m._id === currentUser?._id ? '(YOU)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tag Selection */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                                <label className="text-xs text-purple-400 mb-2 block font-mono tracking-wider flex items-center gap-2">
                                    <Tag size={12} /> CATEGORY
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTag(t)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                                                tag === t
                                                    ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                                    : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Split Selection for EQUAL */}
                            {splitType === 'EQUAL' && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                                    <label className="text-xs text-gray-400 mb-2 block font-mono">SPLIT WITH</label>
                                    <div className="flex flex-wrap gap-2">
                                        {group.members.map(member => (
                                            <button
                                                key={member._id}
                                                type="button"
                                                onClick={() => toggleSplitWith(member._id)}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                                                    splitWith.includes(member._id)
                                                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                                                )}
                                            >
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {splitType === 'UNEQUAL' && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                                        <span>MEMBER SPLITS</span>
                                        <span className={remainingSplit !== 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                            REMAINING: {remainingSplit.toFixed(2)}
                                        </span>
                                    </div>
                                    {group.members.map(member => (
                                        <div key={member._id} className="flex justify-between items-center text-sm py-1">
                                            <span className="text-gray-300">{member.name} {member._id === currentUser?._id && <span className="text-cyan-500 text-xs">(YOU)</span>}</span>
                                            <input
                                                type="number"
                                                className="w-24 bg-black/20 border border-white/10 rounded px-2 py-1 text-right focus:border-cyan-500 transition-colors text-white outline-none"
                                                placeholder="0"
                                                value={manualSplits[member._id] || ''}
                                                onChange={(e) => handleManualSplitChange(member._id, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {splitError && (
                                <div className="text-red-500 text-xs flex items-center gap-1 font-mono bg-red-900/10 p-2 rounded border border-red-500/20">
                                    <AlertCircle size={12} /> {splitError}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-auto">
                            <Button type="submit" className="w-full h-12 text-base shadow-xl shadow-purple-900/20" disabled={splitType === 'UNEQUAL' && Math.abs(remainingSplit) > 0.1}>
                                INITIATE TRANSFER
                            </Button>
                        </div>
                    </form>
                </div>

                {/* 2. Debt Matrix (Tall) */}
                <div className="md:row-span-3 glass-card p-6 rounded-3xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                        <h2 className="text-lg font-bold text-white font-orbitron flex items-center gap-2">
                            <Wallet size={20} className="text-cyan-500" /> DEBT MATRIX
                        </h2>
                        <button onClick={fetchGroupData} className="text-gray-500 hover:text-white transition-colors"><RefreshCw size={16} /></button>
                    </div>

                    <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {balances.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 font-mono text-sm opacity-60">ALL LEDGERS BALANCED.</div>
                        ) : (
                            balances.map((t, idx) => {
                                const isMePayer = t.from === currentUser?._id;
                                const isMePayee = t.to === currentUser?._id;
                                const fromName = group.members.find(m => m._id === t.from)?.name || 'Unknown';
                                const toName = group.members.find(m => m._id === t.to)?.name || 'Unknown';

                                return (
                                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/10">
                                        <div className="flex justify-between text-xs mb-1 font-mono">
                                            <span className={cn(isMePayer ? "text-red-400 font-bold" : "text-gray-400")}>{fromName}</span>
                                            <span className="text-gray-600 text-[10px] self-center">OWES</span>
                                            <span className={cn(isMePayee ? "text-green-400 font-bold" : "text-gray-400")}>{toName}</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-orbitron text-xl text-white tracking-wide">₹{t.amount}</span>
                                            {isMePayer && (
                                                <button
                                                    onClick={() => handleSettle(t)}
                                                    className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    SETTLE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. Recent Activity (Wide) */}
                <div className="md:col-span-2 glass-card p-6 rounded-3xl min-h-[12rem] flex flex-col">
                    <h2 className="text-lg font-bold mb-4 text-white font-orbitron border-b border-white/5 pb-2">RECENT TRANSMISSIONS</h2>
                    <div className="space-y-2 overflow-y-auto max-h-48 custom-scrollbar">
                        {expenses.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 font-mono text-sm opacity-60">NO SYSTEM ACTIVITY DETECTED.</div>
                        ) : (
                            expenses.map(exp => (
                                <div key={exp._id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 rounded-lg transition-colors group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                                            {exp.description}
                                            {exp.tag && exp.tag !== 'Other' && (
                                                <span className="ml-2 text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                                                    {exp.tag}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">SOURCE: {exp.paid_by.name}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-orbitron font-bold text-cyan-400">₹{exp.amount}</div>
                                        <button
                                            onClick={() => handleDeleteClick(exp._id)}
                                            className="text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </BentoGrid>

            {/* Floating Add Member */}
            <div className="fixed bottom-8 right-8 z-50">
                <form onSubmit={handleAddMember} className="flex gap-2">
                    <div className="glass-panel p-2 rounded-full flex gap-2 shadow-[0_0_30px_rgba(236,72,153,0.3)] items-center pl-4 border border-pink-500/30">
                        <input
                            className="bg-transparent text-sm focus:outline-none w-32 md:w-48 text-white placeholder-pink-200/50"
                            placeholder="INVITE NEW NODE..."
                            value={newMemberEmail}
                            onChange={e => setNewMemberEmail(e.target.value)}
                        />
                        <button type="submit" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg">
                            <UserPlus size={18} />
                        </button>
                    </div>
                </form>
            </div>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, expenseId: null })}
                onConfirm={confirmDelete}
                title="Delete Transaction?"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={deleteGroupModal}
                onClose={() => setDeleteGroupModal(false)}
                onConfirm={handleDeleteGroup}
                title="Delete Active Protocol?"
                message="Are you sure you want to delete this protocol? All associated expenses will be permanently removed."
                confirmText="Delete Protocol"
                cancelText="Cancel"
            />

            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                amount={paymentModal.amount}
                payeeId={paymentModal.payeeId}
                groupId={id}
                onSuccess={() => {
                    fetchGroupData();
                    setFeedback({ isOpen: true, message: 'Payment successful', type: 'success' });
                }}
            />

            <FeedbackPopup
                isOpen={feedback.isOpen}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
