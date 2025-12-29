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
        <section className="w-full pb-32 bg-black text-white overflow-hidden">
            <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
                
                {/* Standard Flex Container (No motion wrapper needed here anymore) */}
                <div className="flex flex-col gap-12 md:gap-24">
                    
                    {/* Row 1: Bio (Left) */}
                    <FadeUp className="w-full h-auto md:w-7/12 self-start">
                        <div onMouseEnter={onLeaveColor}>
                            <BioCard />
                        </div>
                    </FadeUp>

                    {/* Row 2: Present School (Right) */}
                    <FadeUp className="w-full md:w-6/12 self-end">
                        <PresentSchool onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 3: Spotify (Left) */}
                    <FadeUp className="w-full md:w-5/12 self-start h-[250px] md:h-[300px]">
                        <SpotifyWidget 
                            pollInterval={60000}
                            onHoverColor={onHoverColor}
                            onLeaveColor={onLeaveColor}
                        />
                    </FadeUp>

                    {/* Row 4: Currently Reading (Right) */}
                    <FadeUp className="w-full md:w-5/12 self-end h-full">
                        <CurrentlyReading onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 5: Currently Watching (Left) */}
                    <FadeUp className="w-full md:w-8/12 self-start h-full">
                        <CurrentlyWatching onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                    {/* Row 6: Duolingo (Right) */}
                    <FadeUp className="w-full md:w-4/12 self-end md:h-full">
                        <DuolingoWidget onHoverColor={onHoverColor} onLeaveColor={onLeaveColor} />
                    </FadeUp>

                </div>
            </div>
        </section>
    );
}