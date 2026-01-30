import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={twMerge(
                clsx(
                    "flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-300",
                    className
                )
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export default Input;
