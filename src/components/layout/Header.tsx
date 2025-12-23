//Header.tsx


'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HeaderProps {
  currentBrand?: string;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

// Shape of a single theme
interface BrandTheme {
  logo: string;
  textColor: string;
  iconColor: string;
  menuIcon: string;
}

// Fallback theme so the site doesn't crash while fetching
const DEFAULT_THEME: BrandTheme = {
  logo: 'https://wnkbjxsnjquryyojfxmx.supabase.co/storage/v1/object/public/hero-assets/logos/logo-default.svg',
  textColor: '#FFFFFF',
  iconColor: '#FFFFFF',
  menuIcon: 'https://wnkbjxsnjquryyojfxmx.supabase.co/storage/v1/object/public/hero-assets/menubrands/menu.svg',
};

export default function Header({ currentBrand = 'default', onMobileMenuToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isInHeroSection, setIsInHeroSection] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Dynamic State for Themes
  const [brandThemes, setBrandThemes] = useState<Record<string, BrandTheme>>({
    default: DEFAULT_THEME
  });

  // 3. Fetch Themes from Supabase
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const { data, error } = await supabase.from('brand_themes').select('*');
        
        if (error) throw error;

        if (data) {
          const themesMap: Record<string, BrandTheme> = {};
          
          data.forEach((theme: any) => {
            themesMap[theme.brand_key] = {
              logo: theme.logo_url,
              textColor: theme.text_color,
              iconColor: theme.icon_color,
              menuIcon: theme.menu_icon_url
            };
          });

          // Merge with default to ensure we always have a base
          setBrandThemes(prev => ({ ...prev, ...themesMap }));
        }
      } catch (error) {
        console.error('Error loading header themes:', error);
      }
    };

    fetchThemes();
  }, []);

  const navItems = [
    //{ name: 'HOME', href: '/' },
    { name: 'WORKS', href: '/works' },
    { name: 'LAB', href: '/lab' },
    { name: 'ABOUT', href: '/about' },
    { name: 'CONTACT', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'Behance', url: 'https://www.behance.net/everdann', ariaLabel: 'Visit our Behance' },
    { name: 'Instagram', url: 'https://www.instagram.com/everdannbrands?igsh=cXIyNGI5a3R4azln', ariaLabel: 'Follow us on Instagram' },
    { name: 'Pinterest', url: 'https://pin.it/42HM3Bbh9', ariaLabel: 'Follow us on Pinterest' },
    { name: 'WhatsApp', url: 'https://wa.me/message/JDKKXFLCFFYDB1', ariaLabel: 'Contact us on WhatsApp' },
    { name: 'Threads', url: 'https://threads.net/@everdannbrands', ariaLabel: 'Follow us on Threads', hidden: false },
    { name: 'Facebook', url: 'https://facebook.com', ariaLabel: 'Follow us on Facebook', hidden: true },
  ];

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notify parent component
  useEffect(() => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle(isMenuOpen);
    }
  }, [isMenuOpen, onMobileMenuToggle]);

  // Determine Current Theme based on Fetch Data
  const currentTheme = isInHeroSection 
    ? (brandThemes[currentBrand] || brandThemes.default || DEFAULT_THEME)
    : (brandThemes.default || DEFAULT_THEME);

  // Enhanced scroll handling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastTime = Date.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime;
      const scrollDelta = currentScrollY - lastScrollY;
      
      const velocity = scrollDelta / (timeDelta || 1);
      setScrollVelocity(velocity);

      const heroSection = document.querySelector('[data-cursor-brand]');
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const isHeaderInHero = heroRect.bottom > 0;
        
        if (isHeaderInHero !== isInHeroSection) {
          setIsInHeroSection(isHeaderInHero);
        }
      }

      const velocityThreshold = 0.5;
      if (velocity > velocityThreshold && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else if (velocity < -velocityThreshold) {
        setIsScrollingDown(false);
      }

      setLastScrollY(currentScrollY);
      lastTime = currentTime;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {}, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY, isInHeroSection]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Animations
  const menuVariants = {
    closed: { opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
    open: { opacity: 1, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  const navItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const logoVariants = {
    closed: { opacity: 0, y: 20 },
    open: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.4, duration: 0.6, ease: 'easeOut' },
    },
  };

  const headerVariants = {
    visible: { opacity: 1, pointerEvents: 'auto' as const, transition: { duration: 0.5, ease: 'easeOut' } },
    hidden: { opacity: 0, pointerEvents: 'none' as const, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const logoFadeVariants = {
    visible: { opacity: 1, visibility: 'visible' as const, transition: { duration: 0.6, ease: 'easeOut' } },
    hidden: { opacity: 0, visibility: 'hidden' as const, transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const shouldShowHeader = !isScrollingDown;
  const shouldShowLogo = isInHeroSection;

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      variants={headerVariants}
      initial="visible"
      animate={shouldShowHeader ? 'visible' : 'hidden'}
    >
      <div className="container max-w-none mx-auto px-8 py-8 flex items-center justify-between">
        {/* Logo with smooth fade */}
        <motion.div
          variants={logoFadeVariants}
          initial="visible"
          animate={shouldShowLogo && !isMenuOpen ? 'visible' : 'hidden'}
          className="relative w-28 h-7 sm:w-28 sm:h-7 md:w-32 md:h-8 z-50"
        >
          <Link href="/">
            <Image
              src={currentTheme.logo}
              alt="everdann"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex items-center gap-12 pr-2"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:opacity-85 transition-opacity font-space text-[0.8rem] tracking-wider"
              style={{ color: currentTheme.textColor }}
            >
              {item.name}
            </Link>
          ))}
        </motion.nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative w-5 h-5 z-50 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label="Toggle menu"
        >
          {isMounted && (
            <>
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 1, rotate: 0, scale: 1 }}
                animate={isMenuOpen ? { opacity: 0, rotate: 90, scale: 0 } : { opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <Image
                  src={currentTheme.menuIcon}
                  alt="Menu"
                  fill
                  className="object-contain"
                />
              </motion.div>
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0, rotate: -90, scale: 0 }}
                animate={isMenuOpen ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: -90, scale: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <Image
                  src="/close.svg"
                  alt="Close"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </>
          )}
        </button>
      </div>

      {/* Mobile Menu - full screen overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden fixed inset-0 bg-black/95 z-40 flex flex-col"
          >
            {/* Navigation items */}
            <nav className="flex flex-col gap-6 pt-20 px-6 flex-grow">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  custom={index}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={navItemVariants}
                  className="inline-block w-fit"
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-space tracking-wider text-white/70 hover:text-white/100 transition-opacity inline-block"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            {/* Contact Info and Social Media Icons */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={logoVariants}
              className="px-6 pb-8 space-y-4"
            >
              {/* Contact Information - greyed out with hyperlinks */}
              <div className="space-y-1 text-[13px] font-space tracking-wider text-white/30">
                {/* Telephone */}
                <div>
                  TEL:{' '}
                  <a 
                    href="tel:+2348100305171"
                    className="text-white/30 hover:text-white/80 transition-colors duration-400"
                  >
                    (+234) 810 030 5171
                  </a>
                </div>
                
                {/* Email */}
                <div>
                  EMAIL:{' '}
                  <a 
                    href="mailto:everdanndesigns@gmail.com"
                    className="text-white/30 hover:text-white/80 transition-colors duration-400"
                  >
                    EVERDANNDESIGNS<span style={{ fontFamily: 'var(--font-space-mono)' }}>@</span>GMAIL.COM
                  </a>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-4 justify-start pt-2">
                {socialLinks.map((social) => (
                  !social.hidden && (
                    <a 
                      key={social.name}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="text-white/50 hover:text-white transition-colors duration-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="social-icon"
                        fill="currentColor"
                        viewBox={social.name === 'Threads' ? "0 0 192 192" : "0 0 24 24"}
                      >
                        {/* Note: I'm mapping generic paths here. If you need your specific paths from the Contact Page, let me know, otherwise this uses standard SVGs or relies on your previous CSS classes if defined */}
                        {social.name === 'Behance' && <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />}
                        {social.name === 'Instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />}
                        {social.name === 'Pinterest' && <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" fillRule="evenodd" clipRule="evenodd" />}
                        {social.name === 'WhatsApp' && <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />}
                        {social.name === 'Threads' && <path d="M141.5,89c-0.8-0.4-1.7-0.8-2.5-1.1c-1.5-27.3-16.4-42.9-41.5-43.1c-0.1,0-0.2,0-0.3,0c-15,0-27.4,6.4-35.1,18l13.8,9.5c5.7-8.7,14.7-10.5,21.3-10.5c0.1,0,0.2,0,0.2,0c8.2,0.1,14.5,2.5,18.5,7.1c2.9,3.4,4.9,8.1,5.9,14c-7.3-1.2-15.2-1.6-23.7-1.1C74.3,83.1,59,97,60,116.3c0.5,9.8,5.4,18.2,13.7,23.7c7,4.7,16.1,6.9,25.6,6.4c12.5-0.7,22.2-5.4,29-14.1c5.2-6.6,8.5-15.2,9.9-25.9c5.9,3.6,10.3,8.3,12.8,14c4.1,9.6,4.4,25.5-8.5,38.4c-11.3,11.3-24.9,16.2-45.5,16.4c-22.8-0.2-40.1-7.5-51.3-21.7C35.2,140,29.8,120.7,29.6,96c0.2-24.7,5.6-44,16.1-57.3C57,24.4,74.2,17.1,97,16.9c23,0.2,40.5,7.5,52.2,21.8c5.7,7,10,15.9,12.9,26.2l16.1-4.3C174.7,48,169.3,37,162,28C147,9.6,125.2,0.2,97.1,0H97C68.9,0.2,47.3,9.6,32.8,28.1C19.9,44.5,13.2,67.3,13,95.9l0,0.1l0,0.1c0.2,28.6,6.9,51.4,19.8,67.9C47.3,182.4,68.9,191.8,97,192h0.1c25-0.2,42.6-6.7,57-21.2c19-18.9,18.4-42.7,12.1-57.3C161.8,103.1,153.2,94.6,141.5,89z M98.4,129.5c-10.4,0.6-21.3-4.1-21.8-14.1c-0.4-7.4,5.3-15.7,22.5-16.7c2-0.1,3.9-0.2,5.8-0.2c6.2,0,12.1,0.6,17.4,1.8C120.3,124.9,108.7,128.9,98.4,129.5z" />}
                        {social.name === 'Facebook' && <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />}
                      </svg>
                    </a>
                  )
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}