'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import TextPressure from '@/components/TextPressure';
import Bottom from '@/components/layout/Bottom';
import Footer3 from '@/components/layout/Footer3';
import { SmoothCursor } from '@/components/layout/SmoothCursor';
import FadeUp from '@/components/animations/FadeUp'; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERVICE_TYPES = ['Branding', 'Web Design', 'Church Media', 'Development', 'Social Media', 'Other'];

const socialLinks = [
  { name: 'Behance', url: 'https://www.behance.net/everdann', ariaLabel: 'Visit our Behance', hidden: false, path: "M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" },
  { name: 'Instagram', url: 'https://www.instagram.com/everdannbrands?igsh=cXIyNGI5a3R4azln', ariaLabel: 'Follow us on Instagram', hidden: false, path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
];

export default function Contact() {
  const [pressureFontSize, setPressureFontSize] = useState(120);
  const [emailCopied, setEmailCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', service_type: 'Branding', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleResize = () => {
      setPressureFontSize(window.innerWidth < 520 ? 80 : 160);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('everdanndesigns@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('messages').insert([formData]);
      if (error) throw error;
      setSubmitStatus('success');
      setFormData({ name: '', email: '', service_type: 'Branding', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👇 Butter-smooth Typing Logic
  const tagline = "Have a project in mind? Let’s build something that stands out.";
  const charVariants = {
    hidden: { opacity: 0 },
    reveal: { opacity: 1 },
  };

  return (
    <main>
      <Header />
      {/* <SmoothCursor cursorColor="#000000" cursorStrokeColor="#ffffff" /> */}

      <section className="w-full pt-32 pb-20 bg-black min-h-screen overflow-x-hidden">
        <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
          
          <div className="mb-16 md:mb-24">
            <FadeUp>
              <TextPressure
                text="LET'S TALK!"
                flex={false} alpha={false} stroke={false} width={true} weight={true} italic={true}
                textColor="#ffffff" minFontSize={36} fixedFontSize={pressureFontSize}
              />
            </FadeUp>
            
            {/* 👇 CONTINUOUS BUTTERY TYPING REVEAL */}
            <motion.p 
              className="mt-8 text-white/60 font-thin text-lg md:text-2xl tracking-wide max-w-2xl leading-relaxed"
              initial="hidden"
              whileInView="reveal"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.03, delayChildren: 0.5 }}
            >
              {tagline.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={charVariants}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 xl:gap-24">
            
            {/* LEFT COLUMN */}
            <div className="md:col-span-5 flex flex-col gap-12">
              <div className="flex flex-col gap-18">
                <FadeUp delay={0.6}>
                  <div className="group cursor-pointer" onClick={handleCopyEmail}>
                    <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Email</p>
                    <div className="relative inline-block">
                      <h2 className="text-md md:text-2xl tracking-wider uppercase text-white/80 font-space font-bold group-hover:text-white transition-colors">
                        everdanndesigns<span style={{ fontFamily: 'var(--font-space-mono)' }}>@</span>gmail.com
                      </h2>
                      <AnimatePresence>
                        {emailCopied && (
                          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute -top-8 left-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wide">Copied!</motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </FadeUp>

                <FadeUp delay={0.7}>
                  <div>
                    <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Phone</p>
                    <a href="tel:+2348100305171" className="text-xl tracking-wide font-space md:text-2xl uppercase text-white/80 font-bold hover:text-white transition-colors">
                      (+234) 810 030 5171
                    </a>
                  </div>
                </FadeUp>

                <FadeUp delay={0.8}>
                  <div>
                    <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Working Hours</p>
                    <p className="text-lg uppercase font-space tracking-wide font-bold text-white/80">
                      Mon - Fri <br/> 09:00 - 17:00 (WAT)
                    </p>
                  </div>
                </FadeUp>
              </div>

              <FadeUp delay={0.9} className="mt-auto hidden md:block">
                <div className="invisible md:block">
                  <p className="text-white/40 text-xs font-space tracking-widest mb-4 uppercase">Connect</p>
                  <div className="flex gap-6 items-center">
                    {socialLinks.map((social) => (
                      !social.hidden && (
                        <a key={social.name} href={social.url} target="_blank" className="text-white/40 hover:text-white transition-all hover:scale-110">
                          <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                            <path d={social.path} transform={social.name === 'Threads' ? "scale(0.125)" : ""} /> 
                          </svg>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:col-span-6 md:col-end-13 max-w-full">
              <FadeUp delay={0.7}>
                <form onSubmit={handleSubmit} className="w-full pt-12 md:p-0 bg-black flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/40 font-space uppercase tracking-wider">Name</label>
                      <input type="text" required name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/40 font-space uppercase tracking-wider">Email</label>
                      <input type="email" required name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-white/40 font-space uppercase tracking-wider">I'm interested in...</label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_TYPES.map((service) => (
                        <button key={service} type="button" onClick={() => setFormData({...formData, service_type: service})} className={`px-3 py-1.5 pt-[9px] md:pt-[13px] md:px-4 md:py-2 text-[10px] md:text-xs rounded-full font-space uppercase tracking-wider transition-all border ${formData.service_type === service ? 'bg-white text-black border-white' : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'}`}>{service}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-space uppercase tracking-wider">Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-space uppercase tracking-wider">Message</label>
                    <textarea required name="message" rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors resize-none placeholder:text-white/20" />
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={isSubmitting || submitStatus === 'success'} className={`w-full py-4 rounded-lg font-space font-bold uppercase tracking-widest text-sm transition-all ${submitStatus === 'success' ? 'bg-[#39FF14] text-black' : 'bg-white text-black hover:bg-gray-200'}`}>
                      {isSubmitting ? 'Sending...' : submitStatus === 'success' ? 'Message Sent!' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      <FadeUp delay={0.4}>
        <Footer3 className='pt-19'/>
      </FadeUp>
      <FadeUp delay={0.4}>
        <Bottom />
      </FadeUp>
    </main>
  );
}