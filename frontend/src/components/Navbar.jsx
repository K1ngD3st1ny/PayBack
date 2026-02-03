'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, PieChart } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import ProfileMenu from './ProfileMenu';
import StatisticsModal from './StatisticsModal';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    // Check if we are in a group details page
    const isGroupPage = pathname?.startsWith('/groups/');
    const groupId = isGroupPage ? pathname.split('/')[2] : null;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl h-16 rounded-2xl glass transition-all duration-300 px-4 flex items-center justify-between",
                    scrolled ? "bg-black/40 border-white/10 shadow-2xl backdrop-blur-xl" : "bg-white/5 border-white/5 shadow-lg backdrop-blur-md"
                )}
            >
                <div className="flex items-center gap-6 pl-2">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-all duration-300 group-hover:scale-105">
                            <CreditCard className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                        </div>
                        <span className="font-orbitron font-bold text-lg tracking-wider text-white/90 group-hover:text-white transition-colors">
                            PAY<span className="text-pink-500">BACK</span>
                        </span>
                    </Link>

                    {/* Statistics Button - Only visible in Group Context */}
                    {user && isGroupPage && groupId && (
                        <>
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <button
                                onClick={() => setShowStats(true)}
                                className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-all text-xs font-medium text-purple-200 hover:text-white flex items-center gap-2 group border border-transparent hover:border-white/10"
                                title="Protocol Analytics"
                            >
                                <PieChart size={14} className="group-hover:rotate-12 transition-transform duration-500" />
                                <span>STATS</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4 pr-1">
                    {user && <ProfileMenu user={user} />}
                </div>
            </motion.nav>

            <StatisticsModal isOpen={showStats} onClose={() => setShowStats(false)} groupId={groupId} />
        </>
    );
}
