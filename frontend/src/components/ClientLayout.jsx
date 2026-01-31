'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Blacklist of public routes where Navbar should NEVER appear
    const publicRoutes = ['/login', '/register', '/', '/demo'];

    useEffect(() => {
        // Check authentication status on mount and path change
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            // Simple check: Token exists AND we are not on a strictly public route (double safety)
            // Actually, requirement says "Only after successful login".
            // So if no token, definitely no navbar.
            // If public route, definitely no navbar.
            const isPublic = publicRoutes.includes(pathname);
            setIsAuthenticated(!!token && !isPublic);
            setIsChecking(false);
        };

        checkAuth();

        // Listen for storage events (login/logout from other tabs or components)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [pathname]);

    const shouldShowNavbar = isAuthenticated && !publicRoutes.includes(pathname);

    // If we are on a public page, just render children without wrapper padding
    if (publicRoutes.includes(pathname)) {
        return (
            <main className="min-h-screen relative z-10 selection:bg-purple-500/30">
                {children}
            </main>
        );
    }

    return (
        <>
            {!isChecking && shouldShowNavbar && <Navbar />}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${shouldShowNavbar ? 'pt-20' : ''} min-h-screen relative z-10 selection:bg-pink-500/30`}
            >
                {children}
            </motion.main>
        </>
    );
}
