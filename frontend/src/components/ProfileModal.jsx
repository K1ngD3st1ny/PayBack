'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, User, Camera, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import api from '../lib/api';
import StripeAccountInput from './profile/StripeAccountInput';

export default function ProfileModal({ isOpen, onClose, user, onUpdate }) {
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("Image size too large. Please use an image under 5MB.");
                return;
            }
            setSelectedFile(file);
            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data.url;
        } catch (error) {
            console.error('Image upload failed', error);
            alert('Failed to upload image');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalAvatarUrl = avatar;

            // If a new file was selected, upload it first
            if (selectedFile) {
                finalAvatarUrl = await uploadImage(selectedFile);
            }

            const res = await api.put('/users/profile', { name, avatar: finalAvatarUrl });
            localStorage.setItem('user', JSON.stringify(res.data));
            onUpdate(res.data);
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            // Alert handled in uploadImage or here
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-black border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden z-[101] max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                    EDIT PROFILE
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 group-hover:border-pink-500 transition-colors bg-white/5 flex items-center justify-center relative">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-400" />
                                            )}

                                            {/* Loading Overlay */}
                                            {(uploading || loading) && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="animate-spin text-pink-500" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <p className="text-xs text-gray-400">Click to change avatar</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Display Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="bg-white/5 border-white/10 focus:border-pink-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <StripeAccountInput
                                        onUpdate={() => {
                                            const updatedUser = { ...user, hasStripeAccount: true };
                                            onUpdate(updatedUser);
                                        }}
                                        hasStripeAccount={user?.hasStripeAccount}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={onClose}
                                        disabled={loading || uploading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                        disabled={loading || uploading}
                                    >
                                        {(loading || uploading) ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="animate-spin" size={16} /> Saving...
                                            </span>
                                        ) : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );

    return createPortal(modalContent, document.body);
}
