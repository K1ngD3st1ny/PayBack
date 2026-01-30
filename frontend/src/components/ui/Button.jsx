'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming standard shadcn-like utils or I will create it

const Button = ({ children, className, variant = 'primary', ...props }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-white/10 hover:border-white/30',
        secondary: 'bg-black/40 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]',
        danger: 'bg-red-900/30 text-red-500 border border-red-500/30 hover:bg-red-900/50 hover:border-red-500',
        ghost: 'text-gray-400 hover:text-white hover:bg-white/5'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'px-6 py-3 font-orbitron tracking-wider text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold backdrop-blur-sm',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
