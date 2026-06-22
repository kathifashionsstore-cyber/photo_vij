import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Grid, CalendarPlus, Info, Phone } from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();

  const tabs = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Portfolio", icon: Grid, path: "/portfolio" },
    { label: "Book", icon: CalendarPlus, path: "/booking", highlight: true },
    { label: "About", icon: Info, path: "/about" },
    { label: "Contact", icon: Phone, path: "/contact" }
  ];

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[9996] px-4 bg-transparent pointer-events-none"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="w-full max-w-lg mx-auto h-16 rounded-2xl glass-card flex items-center justify-around px-2 pointer-events-auto shadow-2xl shadow-black/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            if (tab.highlight) {
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative -top-5 flex flex-col items-center justify-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-brand-gold hover:bg-amber-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-brand-gold/30 pulse-ring relative"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[10px] mt-1 font-medium text-brand-gold uppercase tracking-wider">
                    {tab.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center py-2 px-3 text-gray-400 hover:text-white"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    color: isActive ? '#C9A227' : '#9CA3AF'
                  }}
                  className="flex flex-col items-center justify-center gap-0.5"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-sans font-medium">
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="w-4 h-[2px] bg-brand-gold rounded-full mt-0.5"
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className="h-24 md:hidden" aria-hidden="true" />
    </>
  );
};

export default MobileBottomNav;
