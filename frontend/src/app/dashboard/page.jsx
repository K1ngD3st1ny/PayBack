'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { Plus, LogOut, Users, Zap } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(localStorage.getItem('user')));
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups', { name: newGroupName });
            setGroups([...groups, res.data]);
            setNewGroupName('');
        } catch (error) {
            console.error('Failed to create group', error);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 neon-text">
                        DASHBOARD
                    </h1>
                    <p className="text-purple-300 tracking-widest mt-2 uppercase text-sm">Welcome Back, {user?.name}</p>
                </div>
                <Button variant="danger" onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>
                    <LogOut size={16} /> EXIT
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Group Panel */}
                <div className="lg:col-span-1">
                    <Card className="h-full flex flex-col justify-center items-center text-center p-8 border-purple-500/30">
                        <div className="p-4 bg-purple-900/20 rounded-full mb-4 neon-border text-cyan-400">
                            <Zap size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">INITIATE NETWORK</h2>
                        <p className="text-gray-400 text-sm mb-6">Establish a new transaction node.</p>
                        <form onSubmit={handleCreateGroup} className="w-full space-y-4">
                            <Input
                                placeholder="NODE ALIAS (GROUP NAME)"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="text-center"
                            />
                            <Button type="submit" variant="primary" className="w-full">
                                <Plus size={20} /> DEPLOY
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Group List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="text-pink-500" /> ACTIVE PROTOCOLS
                    </h2>

                    {loading ? (
                        <div className="text-cyan-500 animate-pulse font-mono">ESTABLISHING CONNECTION...</div>
                    ) : groups.length === 0 ? (
                        <div className="text-gray-500 font-mono border border-dashed border-gray-800 p-8 rounded-xl text-center">
                            NO ACTIVE NETWORKS DETECTED.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groups.map((group) => (
                                <Link key={group._id} href={`/groups/${group._id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-white/5 group cursor-pointer h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                    {group.name}
                                                </h3>
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                            </div>
                                            <div className="text-xs font-mono text-gray-500 break-all">
                                                ID: {group._id}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
