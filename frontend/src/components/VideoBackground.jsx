'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function VideoBackground() {
    const videoRef = useRef(null);
    const { scrollY } = useScroll();
    const [videoError, setVideoError] = useState(false);

    // Parallax effect: The video moves slightly slower than the scroll, creating depth.
    // We also add a slight blur as you scroll down for focus on content.
    const y = useTransform(scrollY, [0, 1000], [0, 200]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0.6]);
    const blur = useTransform(scrollY, [0, 500], ['0px', '4px']);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.8; // Slightly slower for a calmer feel
        }
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a0a0a]">
            {/* 
        Fallback Gradient:
        Matches the provided image's palette (Deep Purple/Blue -> Soft Pink/Lilac) 
        Visible if video fails or while loading
      */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4c1d95,transparent_50%),radial-gradient(circle_at_80%_50%,#3b82f6,transparent_50%),radial-gradient(circle_at_20%_80%,#ec4899,transparent_50%)] opacity-60"
            />

            {/* Mesh/Noise overlay for texture (very subtle) */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

            {!videoError && (
                <motion.div
                    style={{ y, opacity, filter: `blur(${blur})` }}
                    className="absolute inset-0 h-[120%] w-full"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onError={() => setVideoError(true)}
                        className="h-full w-full object-cover object-center"
                    >
                        <source src="/background.mp4" type="video/mp4" />
                    </video>
                </motion.div>
            )}

            {/* 
        Glass Overlay: 
        A subtle darkening layer to ensure text contrast over bright video parts 
      */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        </div>
    );
}
