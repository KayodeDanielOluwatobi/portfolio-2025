'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TextPressure from '@/components/TextPressure';

export default function AboutHero() {
    const [pressureFontSize, setPressureFontSize] = useState(96 * 2);

    useEffect(() => {
        const handleResize = () => {
            const mobileSize = 100;
            const desktopSize = 160; // Slightly smaller than works page to fit "About Me" if needed, or keep same
            const breakpoint = 520;

            setPressureFontSize(
                window.innerWidth < breakpoint ? mobileSize : desktopSize
            );
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section className="w-full pt-32 pb-20 bg-black">
            <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <TextPressure
                        text="About Me"
                        flex={false}
                        alpha={false}
                        stroke={false}
                        width={true}
                        weight={true}
                        italic={true}
                        textColor="#ffffff"
                        strokeColor="#ff0000"
                        minFontSize={36}
                        fixedFontSize={pressureFontSize}
                    />
                </motion.div>
            </div>
        </section>
    );
}
