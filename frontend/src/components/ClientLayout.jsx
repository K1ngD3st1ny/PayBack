'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(false);

    // Blacklist of public routes where Navbar should NEVER appear
    const publicRoutes = ['/login', '/register', '/', '/demo'];

    useEffect(() => {
        // Check authentication status on mount and path change
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const isPublic = publicRoutes.includes(pathname);

            // Authenticated if token exists. 
            // Navbar shows only if authenticated AND not on a public route.
            const authStatus = !!token;
            setIsAuthenticated(authStatus);
            setIsNavbarVisible(authStatus && !isPublic);
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [pathname]);

    // Transition settings for smooth page loads
    const pageTransition = {
        initial: { opacity: 0, y: 15, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    };

    if (publicRoutes.includes(pathname)) {
        return (
            <main className="min-h-screen relative z-10 selection:bg-indigo-500/30">
                {children}
            </main>
        );
    }

    return (
        <>
            {isNavbarVisible && <Navbar />}
            <motion.main
                {...pageTransition}
                className={`${isNavbarVisible ? 'pt-24' : ''} min-h-screen relative z-10 selection:bg-indigo-500/30 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto`}
            >
                {children}
            </motion.main>
        </>
    );
}
