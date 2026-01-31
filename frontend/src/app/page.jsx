'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Orbitron } from 'next/font/google';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DemoModal from '@/components/DemoModal';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export default function LandingPage() {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="z-10 max-w-4xl w-full text-center space-y-8">
                <h1 className={`${orbitron.className} text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]`}>
                    PAYBACK
                </h1>

                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light tracking-wide">
                    Split bills. Settle debts. <span className="text-purple-400 font-medium">Stay friends.</span>
                    <br />
                    The future of expense sharing is here.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Link href="/login">
                        <Button size="lg" className="text-lg px-8 bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-400/20">
                            Get Started
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setShowDemo(true)}
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    >
                        Quick Tour
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
                    <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/50">
                        <h3 className={`${orbitron.className} text-xl font-semibold text-purple-400 mb-2`}>Smart Splits</h3>
                        <p className="text-white/60">Algorithm-powered debt simplification to minimize transactions.</p>
                    </Card>
                    <Card className="bg-black/40 border-pink-500/20 hover:border-pink-500/50">
                        <h3 className={`${orbitron.className} text-xl font-semibold text-pink-400 mb-2`}>Real-time</h3>
                        <p className="text-white/60">Instant updates and notifications for all group activities.</p>
                    </Card>
                    <Card className="bg-black/40 border-cyan-500/20 hover:border-cyan-500/50">
                        <h3 className={`${orbitron.className} text-xl font-semibold text-cyan-400 mb-2`}>Analytics</h3>
                        <p className="text-white/60">Visual spending insights and exportable expense reports.</p>
                    </Card>
                </div>
            </div>

            <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
        </div>
    );
}
