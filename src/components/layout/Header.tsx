'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  currentBrand?: string; // Used to determine which logo color and text color to show
}

export default function Header({ currentBrand = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isInHeroSection, setIsInHeroSection] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Brand theme configuration - add more brands as needed
  const brandThemes: Record<string, { logo: string; textColor: string; iconColor: string; menuIcon: string }> = {
    tripadvisor: {
      logo: '/logos/logo-tripadvisor.svg',
      textColor: '#F4D9CA', // Tripadvisor green
      iconColor: '#00AF87',
      menuIcon: '/menubrands/tripadvisor-menu.svg',
    },
    default: {
      logo: '/logos/logo-default.svg',
      textColor: '#FFFFFF', // White
      iconColor: '#FFFFFF',
      menuIcon: '/menu.svg',
    },
    // Add more brands here like:
    jael: {
      logo: '/logos/logo-jael.svg',
      textColor: '#EDCAF4',
      iconColor: '#EDCAF4',
      menuIcon: '/menubrands/jael-menu.svg',
    },

    conces: {
      logo: '/logos/logo-conces.svg',
      textColor: '#B8FB3C',
      iconColor: '#B8FB3C',
      menuIcon: '/menubrands/conces-menu.svg',
    },
  };

  // Your brand color for mobile menu (replace with your actual brand color)
  const mobileBrandColor = '#00AF87'; // Change this to your brand color

  const currentTheme = brandThemes[currentBrand] || brandThemes.default;

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'WORK', href: '/work' },
    { name: 'LAB', href: '/lab' },
    { name: 'ABOUT', href: '/about' },
    { name: 'CONTACT', href: '/contact' },
  ];

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight; // Assuming hero is 100vh
      const nearTopThreshold = 150; // Logo appears when within 150px of top

      // Check if we're near the top of the page
      const isNearTop = currentScrollY < nearTopThreshold;
      setIsInHeroSection(isNearTop);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsScrollingDown(true);
      } else {
        // Scrolling up
        setIsScrollingDown(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when viewport is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      // Check if viewport is desktop size (md breakpoint = 768px)
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Convert hex color to CSS filter for SVG color change
  // This allows dynamic coloring of SVG icons without needing multiple colored versions
  const getColorFilter = (hexColor: string): string => {
    // This is a simplified conversion. For precise color matching,
    // you might need a more complex filter calculation
    // But this works well for most use cases
    if (hexColor === '#FFFFFF' || hexColor.toLowerCase() === '#fff') {
      return 'brightness(0) saturate(100%) invert(1)';
    }
    // For colored icons, you can use this approximation
    // For #00AF87 (teal/green), this creates a similar color
    if (hexColor === '#00AF87') {
      return 'brightness(0) saturate(100%) invert(70%) sepia(52%) saturate(478%) hue-rotate(115deg) brightness(91%) contrast(101%)';
    }
    // Default to white
    return 'brightness(0) saturate(100%) invert(1)';
  };

  // Framer Motion animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const navItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
    },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  const logoVariants = {
    closed: {
      opacity: 0,
      y: 20,
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Determine header visibility
  const shouldShowHeader = !isScrollingDown;
  const shouldShowLogo = isInHeroSection;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-opacity duration-300 ${
        shouldShowHeader ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="container max-w-none mx-auto px-8 py-8 flex items-center justify-between">
        {/* Logo - hidden when mobile menu is open OR when scrolled out of hero section */}
        <Link 
          href="/" 
          className={`relative w-32 h-8 z-50 transition-opacity duration-300 ${
            isMenuOpen || !shouldShowLogo ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
        >
          <Image
            src={currentTheme.logo}
            alt="everdann"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-12 pr-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:opacity-70 transition-opacity font-sohne-mono-1 text-[0.7rem] tracking-wider"
              style={{ color: currentTheme.textColor }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button - toggles between hamburger and close icon */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative w-6 h-6 z-50 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label="Toggle menu"
        >
          <div className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
            {/* Hamburger menu icon - uses brand-specific menu icon */}
            <Image
              src={currentTheme.menuIcon}
              alt="Menu"
              fill
              className="object-contain"
            />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}>
            {/* Close icon - uses brand color when menu is open (mobile) */}
            <Image
              src="/close.svg"
              alt="Close"
              fill
              className="object-contain"
              //style={{ filter: getColorFilter(mobileBrandColor) }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu - full screen overlay with Framer Motion */}
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
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-sohne-mono-1 tracking-wider hover:opacity-70 transition-opacity block"
                    //style={{ color: mobileBrandColor }}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            {/* Full logo at bottom of mobile menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={logoVariants}
              className="px-6 pb-8"
            >
              <div className="relative w-80 h-32">
                <Image
                  src="/logofullmobile.svg"
                  alt="everdann full logo"
                  fill
                  className="object-contain object-left"
                  //style={{ filter: getColorFilter(mobileBrandColor) }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}