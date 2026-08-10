'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Bottom from '@/components/layout/Bottom';
import Footer3 from '@/components/layout/Footer3';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import FadeUp from '@/components/animations/FadeUp';
import { Squircle } from '@squircle-js/react';
import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';

export default function LabHub() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Default cursor styling: Black fill, white stroke
    const [cursorColor, setCursorColor] = useState('var(--black-val)');
    const [cursorStrokeColor, setCursorStrokeColor] = useState('var(--white-val)');

    const handleHoverColor = (fill: string, stroke?: string) => {
        setCursorColor(fill);
        setCursorStrokeColor(stroke || '#ffffff');
    };

    const handleResetColor = () => {
        setCursorColor('var(--black-val)');
        setCursorStrokeColor('var(--white-val)');
    };

    return (
        <main className="bg-black min-h-screen text-white selection:bg-zinc-800 selection:text-white">
            <Header
                currentBrand="default"
                onMobileMenuToggle={setIsMobileMenuOpen}
            />

            <SmoothCursor
                cursorColor={cursorColor}
                cursorStrokeColor={cursorStrokeColor}
            />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto w-full">
                <div className="space-y-6 max-w-2xl">
                    <FadeUp delay={0.1}>
                        <span className="font-space text-xs tracking-widest uppercase text-[#3BA2DE]">
                            / Lab / Experiments
                        </span>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-none text-zinc-100">
                            The Design <br />
                            <span className="font-semibold text-white">Laboratory.</span>
                        </h1>
                    </FadeUp>
                    <FadeUp delay={0.3}>
                        <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">
                            A creative sandbox for production-ready concepts, client tools, and experiments merging high-fidelity visual design with technical implementation.
                        </p>
                    </FadeUp>
                </div>
            </section>

            {/* Lab Experiments Grid */}
            <section className="pb-32 px-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FadeUp delay={0.4}>
                        <Link 
                            href="/lab/invoice-generator" 
                            className="group block h-full"
                            onMouseEnter={() => handleHoverColor('#3BA2DE', '#ffffff')}
                            onMouseLeave={handleResetColor}
                        >
                            <Squircle
                                cornerRadius={24}
                                cornerSmoothing={0.7}
                                className="h-full bg-zinc-900/30 border border-zinc-800/50 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:border-[#3BA2DE]/30 hover:bg-zinc-900/60 group-hover:shadow-[0_0_50px_rgba(59,162,222,0.05)] min-h-[320px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#3BA2DE]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="relative z-10 flex justify-between items-start w-full">
                                    <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-zinc-400 group-hover:text-[#3BA2DE] transition-colors duration-300">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-zinc-500 group-hover:text-white transition-colors duration-300">
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-3 mt-12">
                                    <span className="font-space text-[10px] tracking-wider uppercase text-zinc-500 group-hover:text-[#3BA2DE] transition-colors">
                                        LAB-01 / Utility Tool
                                    </span>
                                    <h3 className="text-lg font-medium text-zinc-100 group-hover:text-white transition-colors duration-300">
                                        PDF Invoice Generator
                                    </h3>
                                    <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
                                        Create, preview, and download professional-grade business invoices with customized layouts, dynamic item lists, automated calculations, and high-res PNG/PDF export.
                                    </p>
                                </div>
                            </Squircle>
                        </Link>
                    </FadeUp>

                    {/* Placeholder for future Lab concept */}
                    <FadeUp delay={0.5}>
                        <div className="h-full bg-zinc-900/10 border border-zinc-900/50 border-dashed rounded-[24px] p-6 md:p-8 flex flex-col justify-between min-h-[320px] opacity-40">
                            <div className="p-3 bg-zinc-950/20 rounded-xl border border-zinc-900 w-12 h-12 flex items-center justify-center text-zinc-600">
                                ?
                            </div>
                            <div className="space-y-2">
                                <span className="font-space text-[10px] tracking-wider uppercase text-zinc-600">
                                    LAB-02 / Coming Soon
                                </span>
                                <h3 className="text-lg font-medium text-zinc-700">
                                    Under Development
                                </h3>
                                <p className="text-zinc-600 text-xs sm:text-sm font-light">
                                    A new design experiment is currently brewing in the pipeline. Stay tuned.
                                </p>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            <Footer3 />
            <Bottom />
        </main>
    );
}
