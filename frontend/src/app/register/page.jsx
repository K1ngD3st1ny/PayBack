'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', upiId: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card>
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#00FF41]">NEW IDENTITY</h2>
                    {error && (
                        <div className="mb-4 p-2 bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C] text-sm">
                            ERROR: {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">CODENAME (NAME)</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">EMAIL</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">PASSWORD</label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">UPI ID (OPTIONAL)</label>
                            <Input
                                value={formData.upiId}
                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'INITIALIZING...' : 'REGISTER'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        EXISTING OPERATIVE? <Link href="/login" className="text-[#00FF41] hover:underline">LOGIN</Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
