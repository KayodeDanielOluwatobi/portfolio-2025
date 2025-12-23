'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
// Squircle import removed
import Header from '@/components/layout/Header';
import TextPressure from '@/components/TextPressure';
import ViewportIndicator from '@/components/layout/ViewportIndicator';
import Bottom from '@/components/layout/Bottom';
import Footer3 from '@/components/layout/Footer3';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Constants & Data
const SERVICE_TYPES = [
  'Branding',
  'Web Design',
  'Church Media',
  'Development',
  'Social Media',
  'Other'
];

const socialLinks = [
  { name: 'Behance', url: 'https://www.behance.net/everdann', ariaLabel: 'Visit our Behance', hidden: false, path: "M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" },
  { name: 'Instagram', url: 'https://www.instagram.com/everdannbrands?igsh=cXIyNGI5a3R4azln', ariaLabel: 'Follow us on Instagram', hidden: false, path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: 'Pinterest', url: 'https://pin.it/42HM3Bbh9', ariaLabel: 'Follow us on Pinterest', hidden: false, path: "M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" },
  { name: 'WhatsApp', url: 'https://wa.me/message/JDKKXFLCFFYDB1', ariaLabel: 'Contact us on WhatsApp', hidden: false, path: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" },
  { name: 'Threads', url: 'https://threads.net/@everdannbrands', ariaLabel: 'Follow us on Threads', hidden: false, path: "M141.5,89c-0.8-0.4-1.7-0.8-2.5-1.1c-1.5-27.3-16.4-42.9-41.5-43.1c-0.1,0-0.2,0-0.3,0c-15,0-27.4,6.4-35.1,18l13.8,9.5c5.7-8.7,14.7-10.5,21.3-10.5c0.1,0,0.2,0,0.2,0c8.2,0.1,14.5,2.5,18.5,7.1c2.9,3.4,4.9,8.1,5.9,14c-7.3-1.2-15.2-1.6-23.7-1.1C74.3,83.1,59,97,60,116.3c0.5,9.8,5.4,18.2,13.7,23.7c7,4.7,16.1,6.9,25.6,6.4c12.5-0.7,22.2-5.4,29-14.1c5.2-6.6,8.5-15.2,9.9-25.9c5.9,3.6,10.3,8.3,12.8,14c4.1,9.6,4.4,25.5-8.5,38.4c-11.3,11.3-24.9,16.2-45.5,16.4c-22.8-0.2-40.1-7.5-51.3-21.7C35.2,140,29.8,120.7,29.6,96c0.2-24.7,5.6-44,16.1-57.3C57,24.4,74.2,17.1,97,16.9c23,0.2,40.5,7.5,52.2,21.8c5.7,7,10,15.9,12.9,26.2l16.1-4.3C174.7,48,169.3,37,162,28C147,9.6,125.2,0.2,97.1,0H97C68.9,0.2,47.3,9.6,32.8,28.1C19.9,44.5,13.2,67.3,13,95.9l0,0.1l0,0.1c0.2,28.6,6.9,51.4,19.8,67.9C47.3,182.4,68.9,191.8,97,192h0.1c25-0.2,42.6-6.7,57-21.2c19-18.9,18.4-42.7,12.1-57.3C161.8,103.1,153.2,94.6,141.5,89z M98.4,129.5c-10.4,0.6-21.3-4.1-21.8-14.1c-0.4-7.4,5.3-15.7,22.5-16.7c2-0.1,3.9-0.2,5.8-0.2c6.2,0,12.1,0.6,17.4,1.8C120.3,124.9,108.7,128.9,98.4,129.5z" },
  { name: 'Facebook', url: 'https://facebook.com', ariaLabel: 'Follow us on Facebook', hidden: true, path: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" },
];

export default function Contact() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pressureFontSize, setPressureFontSize] = useState(120);
  const [emailCopied, setEmailCopied] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service_type: 'Branding', 
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setPressureFontSize(window.innerWidth < 520 ? 80 : 160);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Copy Email
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('everdanndesigns@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', service_type: 'Branding', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />

      <section className="w-full pt-32 pb-20 bg-black min-h-screen overflow-x-hidden">
        <div className="container mx-auto max-w-none px-4 sm:px-6 md:px-8 lg:px-8">
          
          {/* HEADER */}
          <div className="mb-16 md:mb-24">
            <TextPressure
              text="LET'S TALK!"
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
            <p className="text-white/60 font-thin text-lg md:text-2xl tracking-wide mt-8 max-w-2xl">
              Have a project in mind? Let’s build something that stands out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 xl:gap-24">
            
            {/* LEFT COLUMN: INFO & SOCIALS (Socials Hidden on Mobile) */}
            <div className="md:col-span-5 flex flex-col gap-12">
              
              {/* Contact Details */}
              <div className="flex flex-col gap-18">
                
                {/* Email Widget */}
                <div className="group cursor-pointer" onClick={handleCopyEmail}>
                  <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Email</p>
                  <div className="relative inline-block">
                    {/* 👇 SILENT FIX: Wrapped @ in span with Space Mono variable */}
                    <h2 className="text-md md:text-2xl tracking-wider uppercase text-white/80 font-space font-bold group-hover:text-white/80 transition-colors">
                      everdanndesigns<span style={{ fontFamily: 'var(--font-space-mono)' }}>@</span>gmail.com
                    </h2>
                    <AnimatePresence>
                      {emailCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-8 left-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wide"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Phone Widget */}
                <div>
                  <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Phone</p>
                  <a href="tel:+2348100305171" className="text-xl whitespace-nowrap tracking-wide font-space md:text-2xl uppercase text-white/80 font-bold hover:text-white/80 transition-colors">
                    (+234) 810 030 5171
                  </a>
                </div>

                {/* Working Hours */}
                <div>
                  <p className="text-white/40 text-xs font-space tracking-widest mb-2 uppercase">Working Hours</p>
                  <p className="text-lg uppercase font-space tracking-wide font-bold text-white/80 ">
                    Mon - Fri <br/> 
                    09:00 - 17:00 (WAT)
                  </p>
                </div>
              </div>

              {/* Social Icons Row - DESKTOP ONLY */}
              {/* Added hidden md:block here */}
              <div className="mt-auto invisible hidden md:block">
                <p className="text-white/40 text-xs font-space tracking-widest mb-4 uppercase">Connect</p>
                <div className="flex gap-6 items-center">
                  {socialLinks.map((social) => (
                    !social.hidden && (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.ariaLabel}
                        className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 md:w-7 md:h-7"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={social.path} transform={social.name === 'Threads' ? "scale(0.125)" : ""} /> 
                        </svg>
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE FORM */}
            <div className="md:col-span-6 md:col-end-13 max-w-full">
              <form 
                onSubmit={handleSubmit} 
                className="w-full  pt-12 md:p-0 bg-black flex flex-col gap-8"
              >
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-space uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      required
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20 w-full"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-space uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20 w-full"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs text-white/40 font-space uppercase tracking-wider">I'm interested in...</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_TYPES.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setFormData({...formData, service_type: service})}
                        className={`
                          px-3 py-1.5 pt-[9px] md:pt-[13px] md:px-4 md:py-2 
                          text-[10px] md:text-xs 
                          rounded-full font-space uppercase tracking-wider transition-all border 
                          ${formData.service_type === service
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'
                          }
                        `}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-space uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    autoComplete="off"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors placeholder:text-white/20 w-full"
                    placeholder="Project Inquiry"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-space uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-transparent border-b border-white/20 pb-2 text-white outline-none focus:border-white transition-colors resize-none placeholder:text-white/20 w-full"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className={`w-full py-4 rounded-lg font-space font-bold uppercase tracking-widest text-sm transition-all ${
                      submitStatus === 'success'
                        ? 'bg-[#39FF14] text-black cursor-default'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : submitStatus === 'success' ? (
                      'Message Sent!'
                    ) : (
                      'Send Message'
                    )}
                  </button>
                  {submitStatus === 'error' && (
                    <p className="text-red-500 text-xs mt-2 text-center">Something went wrong. Please try again or email directly.</p>
                  )}
                </div>
              </form>
            </div>

            {/* Social Icons Row - MOBILE ONLY (Bottom of Grid) */}
            {/* <div className="md:hidden mt-8">
              <p className="text-white/40 text-xs font-space tracking-widest mb-4 uppercase">Connect</p>
              <div className="flex gap-6 items-center">
                {socialLinks.map((social) => (
                  !social.hidden && (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d={social.path} transform={social.name === 'Threads' ? "scale(0.125)" : ""} /> 
                      </svg>
                    </a>
                  )
                ))}
              </div>
            </div> */}

          </div>
        </div>
      </section>

      {/* <ViewportIndicator /> */}
      <Footer3 className='pt-19'/>
      <Bottom />
    </main>
  );
}