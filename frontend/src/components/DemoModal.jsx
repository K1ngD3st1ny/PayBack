'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Plus, Users, Wallet, PieChart, Check } from 'lucide-react';
import Button from './ui/Button';

export default function DemoModal({ isOpen, onClose }) {
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) setStep(0); // Reset on open
        return () => setMounted(false);
    }, [isOpen]);

    if (!mounted) return null;

    const steps = [
        {
            title: "Add Expenses",
            desc: "Log expenses in seconds. Choose a category, enter the amount, and you're done.",
            icon: <Plus className="text-purple-400" size={32} />,
            color: "from-purple-500 to-pink-500",
            content: (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                    <div className="flex gap-2">
                        <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-white/5 rounded flex items-center px-3 text-gray-400 text-sm font-mono">
                        Dinner @ Sushi Place
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">Food</span>
                        </div>
                        <span className="text-xl font-bold text-white">₹1,200</span>
                    </div>
                </div>
            )
        },
        {
            title: "Split Smartly",
            desc: "Split equally or unequally. Our algorithm handles the math for you.",
            icon: <Users className="text-cyan-400" size={32} />,
            color: "from-cyan-500 to-blue-500",
            content: (
                <div className="space-y-2">
                    {[
                        { name: 'You', share: '₹400', status: 'Paid ₹1200' },
                        { name: 'Alice', share: '₹400', status: 'Owes ₹400' },
                        { name: 'Bob', share: '₹400', status: 'Owes ₹400' },
                    ].map((person, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${i === 0 ? 'from-purple-500 to-pink-500' : 'from-gray-700 to-gray-600'}`} />
                                <span className="text-sm text-gray-300">{person.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">{person.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: "Track Balances",
            desc: "See who owes who instantly. No more awkward spreadsheets.",
            icon: <Wallet className="text-green-400" size={32} />,
            color: "from-green-500 to-emerald-500",
            content: (
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5" />
                    <div className="z-10 text-center w-full">
                        <p className="text-gray-400 text-xs mb-1">TOTAL LENT</p>
                        <p className="text-3xl font-bold text-green-400 font-orbitron">₹800</p>
                        <div className="mt-2 text-xs text-green-300/70 flex items-center justify-center gap-1">
                            <Check size={12} /> You are owed by 2 people
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Analytics",
            desc: "Visualise spending habits with beautiful charts breakdown.",
            icon: <PieChart className="text-orange-400" size={32} />,
            color: "from-orange-500 to-red-500",
            content: (
                <div className="flex items-center justify-center h-32 relative">
                    <div className="w-24 h-24 rounded-full border-4 border-black/50 shadow-xl"
                        style={{ background: 'conic-gradient(#ef4444 0deg 120deg, #3b82f6 120deg 240deg, #22c55e 240deg 360deg)' }} />
                    <div className="absolute ml-32 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-300"><div className="w-2 h-2 bg-red-500 rounded-full" /> Food</div>
                        <div className="flex items-center gap-2 text-xs text-gray-300"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Travel</div>
                        <div className="flex items-center gap-2 text-xs text-gray-300"><div className="w-2 h-2 bg-green-500 rounded-full" /> Rent</div>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.15)] overflow-hidden z-[101]"
                    >
                        {/* Decorative Top Gradient */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${currentStep.color}`} />

                        <div className="p-6 md:p-8">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner`}>
                                        {currentStep.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-orbitron text-white">
                                            {currentStep.title}
                                        </h3>
                                        <div className="flex gap-1 mt-1">
                                            {steps.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Visual */}
                            <div className="bg-black/40 rounded-xl p-6 mb-6 border border-white/5 min-h-[160px] flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full"
                                    >
                                        {currentStep.content}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 mb-8 min-h-[3rem]">
                                {currentStep.desc}
                            </p>

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(s => Math.max(0, s - 1))}
                                    disabled={step === 0}
                                    className={`text-gray-400 ${step === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-white'}`}
                                >
                                    <ChevronLeft size={18} className="mr-1" /> Back
                                </Button>

                                <Button
                                    onClick={() => {
                                        if (step === steps.length - 1) {
                                            onClose();
                                        } else {
                                            setStep(s => s + 1);
                                        }
                                    }}
                                    className="bg-white text-black hover:bg-gray-200 border-none px-6"
                                >
                                    {step === steps.length - 1 ? 'Finish Demo' : 'Next'}
                                    {step !== steps.length - 1 && <ChevronRight size={18} className="ml-1" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modalContent, document.body);
}
