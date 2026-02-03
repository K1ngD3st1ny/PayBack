'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
        default: "glass-button text-white shadow-lg shadow-purple-500/20 bg-white/10 hover:bg-white/20 border-white/20",
        outline: "border border-white/20 text-white hover:bg-white/10 glass-button",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
        secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        link: "text-purple-300 underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-white/10"
    };

    const sizes = {
        default: "h-11 px-6 py-2", // Taller, more clickable area (Mac-like)
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                clsx(
                    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
                    variants[variant],
                    sizes[size],
                    className
                )
            )}
            ref={ref}
            {...props}
        >
            {children}
        </motion.button>
    );
});
Button.displayName = "Button";

export default Button;
