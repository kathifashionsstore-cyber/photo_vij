import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Phone, Search, X, Instagram, Youtube, Facebook } from "lucide-react";
import { ANNOUNCEMENT_BAR_HEIGHT, NAVBAR_HEIGHT, PUBLIC_HEADER_HEIGHT } from "./layoutConstants";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Contact", path: "/contact" },
];

export const Navbar = ({ onSearchOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.nav
        animate={{
          backgroundColor: scrolled ? "rgba(5, 5, 5, 0.82)" : "rgba(0, 0, 0, 0)",
          boxShadow: scrolled ? "0 18px 40px rgba(0,0,0,0.38)" : "none",
        }}
        style={{ top: ANNOUNCEMENT_BAR_HEIGHT, height: NAVBAR_HEIGHT }}
        className="fixed left-0 right-0 z-[9999] flex items-center justify-between px-5 md:px-12 border-b border-white/5 backdrop-blur-xl transition-all duration-300"
      >
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
          <img
            src="/logo.webp"
            alt="Snaplica Photography"
            className="h-10 w-10 rounded-xl object-contain bg-black/20 ring-1 ring-white/10"
          />
          <span className="text-lg md:text-xl font-bold font-serif tracking-[0.18em] text-white group-hover:text-brand-gold transition-colors">
            SNAPLICA
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-[13px] uppercase tracking-wider font-medium transition-all relative py-2 ${
                  isActive ? "text-brand-gold font-semibold" : "text-gray-300 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSearchOpen}
            className="p-2 text-gray-300 hover:text-brand-gold transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <a
            href="tel:9494387387"
            className="hidden md:inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-200 hover:text-brand-gold transition-colors"
          >
            <Phone className="w-4 h-4 text-brand-gold" />
            9494387387
          </a>

          <Link
            to="/booking"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-brand-gold hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all hover:scale-105"
          >
            Book Now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden p-2 text-white hover:text-brand-gold transition-colors"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            style={{ top: PUBLIC_HEADER_HEIGHT }}
            className="fixed left-0 right-0 bottom-0 z-[9998] overflow-y-auto bg-[#050505]/96 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-20 items-center justify-between px-5 border-b border-white/10">
              <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
                <img src="/logo.webp" alt="Snaplica" className="h-11 w-11 rounded-xl object-contain ring-1 ring-white/10" />
                <span className="text-lg font-serif font-bold tracking-[0.18em]">SNAPLICA</span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 text-gray-300 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 pt-10 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `py-4 border-b border-white/5 text-2xl font-serif ${
                      isActive ? "text-brand-gold" : "text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <Link
                to="/booking"
                onClick={closeMenu}
                className="mt-6 inline-flex justify-center rounded-full bg-brand-gold px-6 py-4 text-sm font-bold uppercase tracking-wider text-black"
              >
                Book Now
              </Link>
              <a
                href="tel:9494387387"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-4 text-sm text-white"
              >
                <Phone className="w-4 h-4 text-brand-gold" />
                9494387387
              </a>
              <div className="mt-8 flex items-center justify-center gap-5 text-gray-400">
                <a href="https://www.instagram.com/snaplicaofficial/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@snaplicaphotography2462" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/snaplicaphotography/" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
