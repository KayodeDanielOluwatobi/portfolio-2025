'use client';

import { motion } from 'framer-motion';
import BioCard from './BioCard';
import SpotifyWidget from '@/components/spotify/SpotifyWidget';
import CurrentlyReading from './CurrentlyReading';
import CurrentlyWatching from './CurrentlyWatching';
import DuolingoWidget from './DuolingoWidget';
import PresentSchool from './PresentSchool';

interface AboutContentProps {
    onHoverColor: (fill: string, stroke?: string) => void;
    onLeaveColor: () => void;
}

export default function AboutContent({ onHoverColor, onLeaveColor }: AboutContentProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section className="w-full pb-32 bg-black text-white overflow-hidden">
            <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col gap-12 md:gap-24"
                >
                    {/* Row 1: Bio (Left) */}
                    <motion.div variants={itemVariants} className="w-full md:w-7/12 self-start">
                        {/* Bio stays default, so we force a leave/reset when entering it */}
                        <div onMouseEnter={onLeaveColor}>
                            <BioCard />
                        </div>
                    </motion.div>

                    {/* Row 2: Present School (Right) */}
                    <motion.div variants={itemVariants} className="w-full md:w-6/12 self-end">
                        <PresentSchool onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </motion.div>

                    {/* Row 3: Spotify (Left) */}
                    <motion.div variants={itemVariants} className="w-full md:w-5/12 self-start h-[250px] md:h-[300px]">
                        <SpotifyWidget 
                            pollInterval={60000}
                            onHoverColor={onHoverColor} 
                            onLeaveColor={onLeaveColor}
                        />
                    </motion.div>

                    {/* Row 4: Currently Reading (Right) */}
                    <motion.div variants={itemVariants} className="w-full md:w-5/12 self-end h-full">
                        <CurrentlyReading onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </motion.div>

                    {/* Row 5: Currently Watching (Left) */}
                    <motion.div variants={itemVariants} className="w-full md:w-8/12 self-start h-full">
                        <CurrentlyWatching onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </motion.div>

                    {/* Row 6: Duolingo (Right) */}
                    <motion.div variants={itemVariants} className="w-full md:w-4/12 self-end md:h-full">
                        <DuolingoWidget onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}