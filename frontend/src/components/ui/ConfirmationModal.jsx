
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    cancelText = "Cancel"
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dimmed Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-md bg-black/80 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 overflow-hidden"
                    >
                        {/* Glossy Effect */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                <AlertTriangle className="text-red-500" size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 font-orbitron tracking-wide">
                                {title}
                            </h3>

                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                <Button
                                    onClick={onClose}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>

                        {/* Close Button Top Right */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
