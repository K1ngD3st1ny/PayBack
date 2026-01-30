'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={twMerge(
                clsx(
                    "bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl shadow-purple-500/10",
                    "hover:border-purple-500/50 transition-colors duration-300",
                    className
                )
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export default Card;
