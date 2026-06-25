import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { PUBLIC_HEADER_HEIGHT } from './layout/layoutConstants';

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1920';

const DEFAULT_HERO_CONFIG = {
  home: {
    heading: 'Capturing Moments That Last Forever',
    subheading: 'Award-winning wedding and event photography across Vijayawada and Andhra Pradesh.',
    cta1Text: 'Book Your Shoot',
    cta1Url: '/booking',
    cta2Text: 'View Portfolio',
    cta2Url: '/portfolio',
  },
  about: {
    heading: 'Our Story - Passion Meets Perfection',
    subheading: "Meet Sonu and the story behind Snaplica's cinematic wedding and event coverage.",
    cta1Text: 'Read Our Story',
    cta1Url: '/about',
    cta2Text: 'Book Now',
    cta2Url: '/booking',
  },
  services: {
    heading: 'Photography Services for Every Occasion',
    subheading: 'Engagement, wedding, maternity, birthday, corporate, graduation, anniversary, retirement, and jewellery ad coverage.',
    cta1Text: 'Explore Services',
    cta1Url: '/services',
    cta2Text: 'Book Now',
    cta2Url: '/booking',
  },
  portfolio: {
    heading: 'Portfolio',
    subheading: 'Browse public photos from celebrations, ceremonies, campaigns, and family milestones crafted by Snaplica.',
    cta1Text: 'Book Similar Shoot',
    cta1Url: '/booking',
    cta2Text: 'Contact Studio',
    cta2Url: '/contact',
  },
  contact: {
    heading: "Let's Create Something Beautiful Together",
    subheading: 'Call, WhatsApp, or visit Snaplica Photography in Vijayawada to plan your next shoot.',
    cta1Text: 'Call 9494387387',
    cta1Url: 'tel:9494387387',
    cta2Text: 'Book Online',
    cta2Url: '/booking',
  },
  booking: {
    heading: 'Book Your Dream Photo Session',
    subheading: 'Share your date, venue, service type, and creative requirements with Snaplica.',
    cta1Text: 'Start Booking',
    cta1Url: '#booking-form',
    cta2Text: 'View Services',
    cta2Url: '/services',
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};

const resolveHeroData = (pageId, data) => ({
  backgroundImageUrl: data?.backgroundImageUrl || fallbackHeroImage,
  heading: data?.heading || DEFAULT_HERO_CONFIG[pageId]?.heading || DEFAULT_HERO_CONFIG.home.heading,
  subheading: data?.subheading || DEFAULT_HERO_CONFIG[pageId]?.subheading || DEFAULT_HERO_CONFIG.home.subheading,
  cta1Text: data?.cta1Text || DEFAULT_HERO_CONFIG[pageId]?.cta1Text || DEFAULT_HERO_CONFIG.home.cta1Text,
  cta1Url: data?.cta1Url || DEFAULT_HERO_CONFIG[pageId]?.cta1Url || DEFAULT_HERO_CONFIG.home.cta1Url,
  cta2Text: data?.cta2Text || DEFAULT_HERO_CONFIG[pageId]?.cta2Text || DEFAULT_HERO_CONFIG.home.cta2Text,
  cta2Url: data?.cta2Url || DEFAULT_HERO_CONFIG[pageId]?.cta2Url || DEFAULT_HERO_CONFIG.home.cta2Url,
  overlayOpacity: Number.isFinite(Number(data?.overlayOpacity)) ? Number(data.overlayOpacity) : 0.58,
});

const CtaLink = ({ href, children, variant = 'primary' }) => {
  const className =
    variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-brand-gold/25 transition-all hover:scale-105 hover:bg-amber-500'
      : 'inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-brand-gold hover:text-brand-gold';

  if (href?.startsWith('http') || href?.startsWith('tel:') || href?.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href || '/'} className={className}>
      {children}
    </Link>
  );
};

export const HeroSection = ({ pageId = 'home' }) => {
  const [remoteData, setRemoteData] = useState(null);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 130]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'heroConfig', pageId),
      (snap) => setRemoteData(snap.exists() ? snap.data() : null),
      (err) => {
        console.warn('Firestore hero config fetch failed, using fallback:', err);
        setRemoteData(null);
      },
    );

    return unsubscribe;
  }, [pageId]);

  const heroData = useMemo(() => resolveHeroData(pageId, remoteData), [pageId, remoteData]);
  const overlayOpacity = Math.max(0, Math.min(0.8, heroData.overlayOpacity));

  return (
    <section
      className="relative min-h-[500px] overflow-hidden bg-brand-dark"
      style={{ height: `calc(100vh - ${PUBLIC_HEADER_HEIGHT}px)` }}
    >
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 h-full w-full">
        <img
          src={heroData.backgroundImageUrl}
          alt={`${pageId} hero`}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: `rgba(10, 10, 10, ${overlayOpacity})` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark to-transparent" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-12 text-center"
      >
        <motion.div
          variants={fadeInDown}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-gold backdrop-blur-sm"
        >
          <MapPin className="h-4 w-4" />
          Vijayawada Photography Studio
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="mb-6 max-w-5xl text-4xl font-bold leading-tight tracking-normal text-white md:text-6xl lg:text-7xl"
        >
          {heroData.heading}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mb-10 max-w-2xl text-sm font-light leading-8 text-gray-300 md:text-lg"
        >
          {heroData.subheading}
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
          {heroData.cta1Text && <CtaLink href={heroData.cta1Url}>{heroData.cta1Text}</CtaLink>}
          {heroData.cta2Text && (
            <CtaLink href={heroData.cta2Url} variant="secondary">
              {heroData.cta2Text}
            </CtaLink>
          )}
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/45 md:bottom-8"
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.84, behavior: 'smooth' })}
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">Explore</span>
        <ChevronDown className="h-5 w-5 text-brand-gold" />
      </motion.button>
    </section>
  );
};

export default HeroSection;
