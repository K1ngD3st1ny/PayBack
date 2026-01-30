'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
        default: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25",
        outline: "border border-purple-500 text-purple-400 hover:bg-purple-500/10",
        ghost: "text-white/70 hover:text-white hover:bg-white/10",
        secondary: "bg-white/10 text-white hover:bg-white/20",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                clsx(
                    "inline-flexitems-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
