import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Calendar, Receipt, Camera, Info } from 'lucide-react';
import { globalSearch } from './searchEngine';
import { modalScale } from '../animations/variants';

export const SearchOverlay = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Esc key close handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (inputRef.current) inputRef.current.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({});
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      const searchRes = await globalSearch(query);
      setResults(searchRes);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults = Object.values(results).some(arr => arr && arr.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99000] bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalScale}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-2xl bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header input */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <Search className="text-brand-gold w-5 h-5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bookings, clients, invoices, gear..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-600 font-sans"
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          )}
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick helper capsules */}
        {!query && (
          <div className="p-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">
              Quick Filter Filters
            </p>
            <div className="flex gap-2 flex-wrap mb-4">
              {['Rahul', 'Wedding', 'INV', 'Mavic', 'Sonu'].map(word => (
                <button 
                  key={word}
                  onClick={() => setQuery(word)}
                  className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-brand-gold/30 hover:text-brand-gold transition-all text-xs text-gray-400 rounded-full"
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="text-gray-600 text-[11px] leading-relaxed flex items-center gap-1.5 font-light">
              <Info className="w-3.5 h-3.5 text-brand-gold" />
              <span>Enter 2 or more characters to trigger search across all databases in real-time.</span>
            </div>
          </div>
        )}

        {/* Search results list */}
        {query && (
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-white/5">
            <SearchResultsGroup title="Leads & Clients" icon={User} results={results.clients} query={query} />
            <SearchResultsGroup title="Bookings scheduled" icon={Calendar} results={results.bookings} query={query} />
            <SearchResultsGroup title="Invoices log" icon={Receipt} results={results.invoices} query={query} />
            <SearchResultsGroup title="Studio Gear" icon={Camera} results={results.equipment} query={query} />

            {!hasResults && !isSearching && (
              <div className="p-12 text-center text-gray-500 font-sans">
                No database entries found for "<span className="text-white font-medium">{query}</span>"
              </div>
            )}
          </div>
        )}

        {/* Footer shortcuts */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600">
          <span className="font-sans">Navigate with mouse pointer / click</span>
          <span className="font-sans">ESC to close overlay</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Sub-component for rendering category group lists
const SearchResultsGroup = ({ title, icon: Icon, results, query }) => {
  if (!results || results.length === 0) return null;

  return (
    <div>
      <div className="px-6 py-2.5 bg-black/20 text-[10px] uppercase font-bold tracking-widest text-brand-gold flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span>{title}</span>
      </div>
      <div className="py-2">
        {results.map((res) => (
          <div 
            key={res.id}
            className="px-6 py-3 hover:bg-white/5 transition-colors cursor-pointer flex justify-between items-center group"
          >
            <div className="space-y-1">
              <h4 className="text-white font-serif font-semibold text-sm group-hover:text-brand-gold transition-colors">
                <HighlightMatch text={res.name || res.clientName || res.invoiceNumber || res.leader || ""} query={query} />
              </h4>
              <p className="text-xs text-gray-500 font-sans font-light">
                {res.serviceType || res.eventType || res.phone || res.email || res.model || res.status}
              </p>
            </div>
            {res.status && (
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold
                ${res.status === 'paid' || res.status === 'approved' || res.status === 'available' || res.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-brand-gold border border-brand-gold/20'}`}
              >
                {res.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Sub-component to highlight match query characters
const HighlightMatch = ({ text, query }) => {
  if (!text) return null;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-brand-gold/20 text-brand-gold rounded px-0.5">{part}</mark>
          : part
      )}
    </span>
  );
};

export default SearchOverlay;
