'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Initial fetch of user from local storage to pass to ProfileMenu
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between"
        >
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                        <CreditCard className="w-6 h-6 text-pink-500" />
                    </div>
                    <span className="font-orbitron font-bold text-xl tracking-wider text-white">
                        PAY<span className="text-pink-500">BACK</span>
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user && <ProfileMenu user={user} />}
            </div>
        </motion.nav>
    );
}
