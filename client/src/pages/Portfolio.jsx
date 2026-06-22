import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import HeroSection from '../components/HeroSection';
import SEOHead from '../components/SEOHead';
import { db } from '../firebase';

export const Portfolio = () => {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [publicPhotos, setPublicPhotos] = useState([]);

  const categories = ["all", "wedding", "pre-wedding", "birthday", "corporate", "events", "bts", "product"];

  const fallbackImages = [
    { id: 1, cat: "wedding", title: "Vijayawada Heritage Wedding", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800" },
    { id: 2, cat: "pre-wedding", title: "Sunrise at Krishna River", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800" },
    { id: 3, cat: "wedding", title: "South Indian Bride Glimpse", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" },
    { id: 4, cat: "corporate", title: "Summit Opening Gala", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800" },
    { id: 5, cat: "birthday", title: "Pastel Cake Smash Shoot", url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800" },
    { id: 6, cat: "pre-wedding", title: "Golden Hour Couple Fields", url: "https://images.unsplash.com/photo-1519225495810-7517c3198a7a?auto=format&fit=crop&q=80&w=800" },
    { id: 7, cat: "wedding", title: "Traditional Mandap Rituals", url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800" },
    { id: 8, cat: "corporate", title: "Executive Board Portraits", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800" },
    { id: 9, cat: "product", title: "Modern Brand Accessories", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" },
    { id: 10, cat: "wedding", title: "Varamala Exchange Snap", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800" },
    { id: 11, cat: "birthday", title: "Outdoor Garden Decor", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800" },
    { id: 12, cat: "product", title: "Premium Watch Showcase", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "gallery"), where("showInPublic", "==", true), orderBy("uploadedAt", "desc")),
      (snap) => setPublicPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error("Public gallery listener failed:", err);
        setPublicPhotos([]);
      },
    );
    return unsub;
  }, []);

  const galleryImages = useMemo(() => {
    if (!publicPhotos.length) return fallbackImages;
    return publicPhotos.map((photo) => ({
      id: photo.id,
      cat: String(photo.category || "Events").toLowerCase(),
      category: photo.category || "Events",
      title: photo.description || photo.fileName || photo.category || "Snaplica Portfolio",
      description: photo.description || "",
      url: photo.imageUrl,
      thumbUrl: photo.thumbUrl,
    }));
  }, [publicPhotos]);

  const filteredImages = filter === "all"
    ? galleryImages
    : galleryImages.filter(img => img.cat === filter);

  const openLightbox = (imgId) => {
    const idx = filteredImages.findIndex(i => i.id === imgId);
    setLightboxIndex(idx);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="bg-brand-dark overflow-hidden pb-24">
      <SEOHead 
        title="Portfolio Gallery" 
        description="Browse Snaplica's photo collections across wedding, pre-wedding, corporate events, and birthday parties in Vijayawada." 
      />

      <HeroSection pageId="portfolio" />

      {/* Gallery filter category header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="text-2xl md:text-4xl font-serif text-white font-bold">
              Captured Galleries
            </h2>
            <p className="text-gray-500 text-xs mt-1 font-light font-sans">
              Showing {filteredImages.length} moments of love, celebrations, and professional launches.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="relative px-5 py-2 text-xs uppercase tracking-widest font-semibold font-sans rounded-full transition-all border border-white/10 text-gray-400 hover:text-white"
              >
                {filter === cat && (
                  <motion.div 
                    layoutId="portfolioFilterBg"
                    className="absolute inset-0 bg-brand-gold rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={filter === cat ? "text-black" : ""}>
                  {cat === "all" ? "All Shoots" : cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid gallery */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 break-inside-avoid">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="mb-4 break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group border border-white/5 relative bg-brand-card shadow-lg"
                onClick={() => openLightbox(img.id)}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                
                {/* Hover overlay detail */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-semibold mb-1">
                    {img.category || img.cat}
                  </span>
                  <h4 className="text-white font-serif font-bold text-lg leading-tight">
                    {img.title}
                  </h4>
                  {img.description && (
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-300">
                      {img.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredImages.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-30 text-brand-gold" />
            <p className="font-serif text-lg">No photos found in this category.</p>
            <p className="text-xs mt-1 font-sans">Check back later for updates or request custom galleries.</p>
          </div>
        )}
      </section>

      {/* Custom Slider Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-black/98 flex flex-col items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Header info */}
            <div className="absolute top-4 inset-x-6 flex justify-between items-center text-white z-50">
              <div>
                <span className="text-[10px] text-brand-gold uppercase tracking-wider font-sans font-bold">
                  {filteredImages[lightboxIndex].category || filteredImages[lightboxIndex].cat}
                </span>
                <h3 className="font-serif text-sm md:text-lg">
                  {filteredImages[lightboxIndex].title}
                </h3>
                {filteredImages[lightboxIndex].description && (
                  <p className="mt-1 max-w-md text-xs text-gray-400">
                    {filteredImages[lightboxIndex].description}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slider arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full flex items-center justify-center text-white transition-all z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-4 w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full flex items-center justify-center text-white transition-all z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Media viewer container */}
            <motion.div 
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[75vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={filteredImages[lightboxIndex].url} 
                alt={filteredImages[lightboxIndex].title} 
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/5"
              />
            </motion.div>

            {/* Indicator info */}
            <div className="absolute bottom-6 text-gray-500 text-xs font-sans tracking-widest font-semibold uppercase">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
