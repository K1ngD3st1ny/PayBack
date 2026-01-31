'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileModal from './ProfileModal';

export default function ProfileMenu({ user: initialUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(initialUser);
    const router = useRouter();

    // Keep local user state in sync when modal updates it
    const handleUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (!user) return null;

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors pr-3 border border-transparent hover:border-white/10"
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-white leading-none">{user.name}</p>

                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-white/10 mb-1">
                                <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>

                            <button
                                onClick={() => { setShowModal(true); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <Settings size={16} /> Edit Profile
                            </button>

                            <div className="h-px bg-white/10 my-1" />

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ProfileModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                user={user}
                onUpdate={handleUpdate}
            />
        </>
    );
}
