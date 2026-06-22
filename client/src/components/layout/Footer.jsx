import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-24 md:pb-8 text-gray-400 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* About column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-white">
            <img src="/logo.webp" alt="Snaplica Photography" className="h-9 w-9 rounded-lg object-contain ring-1 ring-white/10" />
            <span className="text-xl font-bold font-serif tracking-[0.2em] text-white">
              SNAPLICA
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed font-light">
            Vijayawada's premier wedding and portrait photography studio. We capture moments, stories, and emotions that last forever.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://www.instagram.com/snaplicaofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com/@snaplicaphotography2462" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/snaplicaphotography/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-serif text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm font-light">
            <li><Link to="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-brand-gold transition-colors">About Sonu & Team</Link></li>
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Services</Link></li>
            <li><Link to="/portfolio" className="hover:text-brand-gold transition-colors">Our Portfolio</Link></li>
            <li><Link to="/booking" className="hover:text-brand-gold transition-colors">Book Shoot</Link></li>
          </ul>
        </div>

        {/* Services links */}
        <div>
          <h4 className="text-white font-serif text-lg mb-4">Our Services</h4>
          <ul className="space-y-2 text-sm font-light">
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Wedding Photography</Link></li>
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Pre-Wedding Shoots</Link></li>
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Candid & Cinematic Shoots</Link></li>
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Birthday & Event Coverage</Link></li>
            <li><Link to="/services" className="hover:text-brand-gold transition-colors">Corporate Portraits & Portfolios</Link></li>
          </ul>
        </div>

        {/* Contact column */}
        <div className="space-y-3">
          <h4 className="text-white font-serif text-lg mb-4">Get In Touch</h4>
          <div className="flex items-start gap-2 text-sm font-light">
            <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <span>Ibrahimpatnam, Vijayawada, Andhra Pradesh, India</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-light">
            <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <a href="tel:9494387387" className="hover:text-brand-gold transition-colors">9494 387 387</a>
          </div>
          <div className="flex items-center gap-2 text-sm font-light">
            <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <a href="mailto:snaplicaphotography@gmail.com" className="hover:text-brand-gold transition-colors">snaplicaphotography@gmail.com</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4">
        <span>&copy; {new Date().getFullYear()} Snaplica Photography. All Rights Reserved.</span>
        <span className="flex items-center gap-1">
          Website designed and maintained by{' '}
          <a href="tel:9398724704" className="text-gray-500 hover:text-brand-gold font-medium transition-colors">
            WayzenTech (9398724704)
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
