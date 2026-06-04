'use client';

import BioCard from './BioCard';
import SpotifyWidget from '@/components/spotify/SpotifyWidget';
import CurrentlyReading from './CurrentlyReading';
import CurrentlyWatching from './CurrentlyWatching';
import DuolingoWidget from './DuolingoWidget';
import PresentSchool from './PresentSchool';
// 👇 Import the wrapper
import FadeUp from '@/components/animations/FadeUp';

interface AboutContentProps {
    onHoverColor: (fill: string, stroke?: string) => void;
    onLeaveColor: () => void;
}

export default function AboutContent({ onHoverColor, onLeaveColor }: AboutContentProps) {
    return (
        <section className="w-full pb-32 bg-[var(--background)] text-[var(--foreground)] overflow-hidden transition-colors duration-400">
            <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
                
                {/* Standard Flex Container (No motion wrapper needed here anymore) */}
                <div className="flex flex-col gap-12 md:gap-24">
                    
                    {/* Row 1: Bio (Left) */}
                    <FadeUp delay={0.4} className="w-full h-auto md:w-7/12 self-start">
                        <div onMouseEnter={onLeaveColor}>
                            <BioCard />
                        </div>
                    </FadeUp>

                    {/* Row 2: Present School (Right) */}
                    <FadeUp delay={0.4} className="w-full md:w-6/12 self-end dark text-white">
                        <PresentSchool onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 3: Spotify (Left) */}
                    <FadeUp delay={0.4} className="w-full md:w-5/12 self-start h-[250px] md:h-[300px] dark text-white">
                        <SpotifyWidget 
                            pollInterval={60000}
                            onHoverColor={onHoverColor}
                            onLeaveColor={onLeaveColor}
                        />
                    </FadeUp>

                    {/* Row 4: Currently Reading (Right) */}
                    <FadeUp delay={0.4} className="w-full md:w-5/12 self-end h-full dark text-white">
                        <CurrentlyReading onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 5: Currently Watching (Left) */}
                    <FadeUp delay={0.4} className="w-full md:w-8/12 self-start h-full dark text-white">
                        <CurrentlyWatching onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 6: Duolingo (Right) */}
                    <FadeUp delay={0.4} className="w-full md:w-4/12 self-end md:h-full dark text-white">
                        <DuolingoWidget onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                </div>
            </div>
        </section>
    );
}