import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';

export const FestivalBannerModal = () => {
  const [activeBanner, setActiveBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(
          collection(db, 'banners'), 
          where('isActive', '==', true), 
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const bannerData = querySnapshot.docs[0].data();
          setActiveBanner(bannerData);
          setIsOpen(true);
        } else {
          // Fallback to a default premium discount banner if none in DB
          setActiveBanner({
            title: "Grand Wedding Festival Offer",
            imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
            titleText: "Book Your Dream Wedding Today",
            discountText: "Plan your wedding coverage with Snaplica's award-winning studio.",
            ctaLink: "/booking"
          });
          // To make it look impressive but not annoying, we can pop it open:
          const hasSeen = sessionStorage.getItem('hasSeenFestivalBanner');
          if (!hasSeen) {
            setIsOpen(true);
            sessionStorage.setItem('hasSeenFestivalBanner', 'true');
          }
        }
      } catch (err) {
        console.error("Error fetching active banner:", err);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setCanClose(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(false);
    }
  }, [isOpen]);

  if (!isOpen || !activeBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99998] bg-black/90 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative max-w-lg w-full rounded-[20px] p-2 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #c9a227, #fff8dc, #c9a227, #a07e15, #c9a227)",
            backgroundSize: "300% 300%",
            animation: "goldShimmer 3s ease infinite",
            boxShadow: "0 0 60px rgba(201,162,39,0.4), 0 0 120px rgba(201,162,39,0.15)",
          }}
        >
          <div className="relative overflow-hidden rounded-[14px] bg-black">
          {/* Banner Image */}
          <div className="relative aspect-[4/5] bg-gray-900 flex flex-col justify-end">
            <img 
              src={activeBanner.imageUrl} 
              alt={activeBanner.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/30 to-transparent" />

            {/* Content overlay */}
            <div className="relative z-10 p-6 md:p-8 text-center flex flex-col items-center">
              <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                Special Announcement
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3 leading-tight text-white">
                {activeBanner.title}
              </h2>
              {activeBanner.discountText && (
                <p className="text-gray-300 text-sm mb-6 max-w-sm font-sans font-normal leading-relaxed">
                  {activeBanner.discountText}
                </p>
              )}
              
              <a 
                href={activeBanner.ctaLink || "/booking"}
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full transition-all hover:scale-105"
              >
                Claim Offer Now
              </a>
            </div>
          </div>
          
          {/* WayzenTech Credit Footer */}
          <div className="bg-black py-2 text-center border-t border-white/5">
            <a 
              href="tel:9398724704" 
              className="text-gray-500 text-[10px] tracking-wider uppercase hover:text-brand-gold transition-colors"
            >
              Website designed by WayzenTech — 9398724704
            </a>
          </div>
          </div>

          {/* Close button - appears after 2s */}
          <AnimatePresence>
            {canClose && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors z-[100000]"
                title="Dismiss Banner"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-2 rounded-[14px] border-2 border-white/20" />
          <style>{`
            @keyframes goldShimmer {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FestivalBannerModal;
