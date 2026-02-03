'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function FeedbackPopup({ message, type = 'success', isOpen, onClose, duration = 2000 }) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999]"
                >
                    <div className={`
                        flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border
                        ${type === 'success'
                            ? 'bg-green-500/20 border-green-500/50 text-green-200'
                            : 'bg-red-500/20 border-red-500/50 text-red-200'}
                    `}>
                        {type === 'success' ? (
                            <CheckCircle2 size={20} className="text-green-400" />
                        ) : (
                            <XCircle size={20} className="text-red-400" />
                        )}
                        <span className="font-medium text-sm">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
