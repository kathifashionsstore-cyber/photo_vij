import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, Star, Trophy, Users, Award, ShieldCheck, Heart, MessageCircle, Phone, Video } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SEOHead from '../components/SEOHead';
import GoogleReviews from '../components/GoogleReviews';
import { scaleIn, cardHover, staggerContainer, fadeInUp, sectionReveal } from '../animations/variants';

const SERVICE_CIRCLES = [
  { icon: "💍", label: "Wedding", path: "/services", color: "#c9a227" },
  { icon: "💑", label: "Pre-Wedding", path: "/services", color: "#ec4899" },
  { icon: "🎂", label: "Birthday", path: "/services", color: "#f97316" },
  { icon: "🏢", label: "Corporate", path: "/services", color: "#3b82f6" },
  { icon: "📦", label: "Product Shoot", path: "/services", color: "#8b5cf6" },
  { icon: "👶", label: "Baby Shoot", path: "/services", color: "#10b981" },
];

const PACKAGE_OPTIONS = [
  {
    name: "Basic",
    includes: ["Candid Photography", "4 Hours Coverage", "150 Edited Photos", "1 Photographer", "Online Gallery"],
    audio: "/audio/basic-theme.mp3",
    whatsapp: "Hi Snaplica! I'm interested in the Basic Photography Package.",
  },
  {
    name: "Standard",
    includes: ["Candid + Traditional", "8 Hours Coverage", "400 Edited Photos", "2 Photographers", "1 Videographer", "Online Gallery", "Highlight Reel"],
    audio: "/audio/standard-theme.mp3",
    whatsapp: "Hi Snaplica! I'm interested in the Standard Photography Package.",
  },
  {
    name: "Premium",
    includes: ["Full Day Coverage", "Candid + Traditional + Cinematic", "600+ Edited Photos", "Full Team (Photo+Video+Drone)", "Premium Album", "Same-Day Edit", "Online Gallery"],
    audio: "/audio/premium-theme.mp3",
    whatsapp: "Hi Snaplica! I'm interested in the Premium Photography Package.",
  },
];

export const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const stats = [
    { value: 1000, suffix: "+", label: "Events Covered", icon: Camera },
    { value: 30, suffix: "+", label: "Crew Members", icon: Users },
    { value: 5, suffix: "", label: "Years Experience", icon: Calendar },
    { value: 2, suffix: "×", label: "Times Award Winner", icon: Trophy }
  ];

  const portfolioCategories = ["all", "wedding", "pre-wedding", "birthday", "corporate"];

  const portfolioImages = [
    { id: 1, cat: "wedding", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600" },
    { id: 2, cat: "pre-wedding", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600" },
    { id: 3, cat: "wedding", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600" },
    { id: 4, cat: "corporate", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600" },
    { id: 5, cat: "birthday", url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600" },
    { id: 6, cat: "pre-wedding", url: "https://images.unsplash.com/photo-1519225495810-7517c3198a7a?auto=format&fit=crop&q=80&w=600" },
    { id: 7, cat: "wedding", url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600" },
    { id: 8, cat: "corporate", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600" }
  ];

  const filteredImages = activeCategory === "all" 
    ? portfolioImages 
    : portfolioImages.filter(img => img.cat === activeCategory);

  const testimonials = [
    { name: "Rahul & Harini", role: "Wedding Couple", quote: "Sonu and the crew captured our wedding so beautifully! The attention to detail and candid frames were spectacular. Vijayawada's absolute best!", rating: 5 },
    { name: "Suresh Kumar", role: "Corporate VP", quote: "Extremely professional. They arrived early, handled the corporate portraits with top-tier gear, and delivered high-res edits within 48 hours.", rating: 5 },
    { name: "Anjali Devi", role: "Birthday Celebrant", quote: "The lights, the angles, the expressions! They made my daughter's first birthday party look like a fairytale. Highly recommended crew!", rating: 5 }
  ];

  const features = [
    { title: "5+ Years Experience", desc: "A half-decade of trust, covering weddings and commercial shoots with elite composition.", icon: Trophy },
    { title: "Award-Winning Studio", desc: "Two-time winner at the Times Business Awards for exceptional wedding photography in AP.", icon: Award },
    { title: "30+ Professional Crew", desc: "Equipped with advanced camera setups, aerial drones, and cinematic lighting setups.", icon: Users },
    { title: "Premium Guarantee", desc: "Isolated backup, secure customer portals, and high-fidelity, color-graded deliveries.", icon: ShieldCheck }
  ];

  return (
    <div className="bg-brand-dark overflow-hidden pb-12">
      <SEOHead 
        title="Home" 
        description="Capture your premium moments with Snaplica Photography, Vijayawada. Under founder Sonu and a crew of 30+ specialists." 
      />

      {/* Hero Header */}
      <HeroSection pageId="home" />

      {/* Stats Bar Section */}
      <section className="bg-black/50 border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center justify-center text-center p-4">
                  <Icon className="text-brand-gold w-8 h-8 mb-3 opacity-80" />
                  <div className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium font-sans">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="bg-[#faf9f6] px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              What We Do
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#111] md:text-5xl">
              Our Photography Services
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {SERVICE_CIRCLES.map((service) => (
              <a key={service.label} href={service.path} className="group flex w-[130px] flex-col items-center gap-3 text-center no-underline">
                <div
                  className="flex h-[100px] w-[100px] items-center justify-center rounded-full text-4xl transition-all duration-300"
                  style={{
                    background: `${service.color}15`,
                    border: `3px solid ${service.color}30`,
                    boxShadow: `0 8px 24px ${service.color}20`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
                    e.currentTarget.style.boxShadow = `0 16px 40px ${service.color}35`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${service.color}20`;
                  }}
                >
                  {service.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700">{service.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Packages
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#111] md:text-5xl">
              Choose Your Coverage
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Hover a package to preview its theme audio, then message or call Snaplica to discuss availability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PACKAGE_OPTIONS.map((pkg) => (
              <PackageCard key={pkg.name} pkg={pkg} featured={pkg.name === "Standard"} />
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story Preview Section */}
      <section className="bg-brand-card/40 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left image with golden decorative border */}
          <div className="relative justify-center flex">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden banner-frame shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600" 
                alt="Founder Sonu" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decors */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-brand-gold/30 pointer-events-none rounded-tl-2xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-brand-gold/30 pointer-events-none rounded-br-2xl" />
          </div>

          {/* Right Text */}
          <div className="space-y-6">
            <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold">
              Meet the Founder
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white">
              Snaplica Sonu & Team
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
              The founder of Snaplica Photography is an entrepreneur and photographer popularly known as **Snaplica Sonu**. What started as a small personal dream quickly grew into a large business over five years, expanding to a dedicated professional team of over 30 crew members. 
            </p>
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
              Under Sonu's leadership, the company has covered thousands of events and won major accolades, including winning the **Best Photography Award** twice at the prestigious Times Business Awards Andhra Pradesh.
            </p>

            <div className="pt-4">
              <a 
                href="/about" 
                className="inline-flex items-center justify-center px-6 py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all"
              >
                Read Full Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold block mb-3">
            Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 text-white">
            Moments Captured
          </h2>
          {/* Category Tabs */}
          <div className="flex justify-center gap-2 flex-wrap mt-6">
            {portfolioCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded-full border transition-all
                  ${activeCategory === cat ? 'bg-brand-gold text-black border-brand-gold' : 'border-white/10 text-gray-400 hover:text-white'}`}
              >
                {cat === 'all' ? 'All Shoots' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Masonry */}
        <motion.div layout className="columns-2 md:columns-4 gap-4 break-inside-avoid">
          <AnimatePresence>
            {filteredImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 break-inside-avoid rounded-xl overflow-hidden cursor-pointer group border border-white/5 relative bg-brand-card"
                onClick={() => setSelectedImage(img.url)}
              >
                <img 
                  src={img.url} 
                  alt="Portfolio Grid" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white uppercase tracking-widest bg-brand-gold/80 px-4 py-2 rounded-full font-bold">
                    View Larger
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Testimonials Slider */}
      <section className="bg-brand-card/20 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold block mb-3">
            Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-12 text-white">
            Client Love
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl text-left border border-white/5 relative flex flex-col justify-between">
                <div className="flex items-center gap-1 text-brand-gold mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm font-light italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="text-white font-serif font-bold text-base">{t.name}</h4>
                  <span className="text-xs text-gray-500 font-sans">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GoogleReviews dark />

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold">
              Our Value
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mt-2 mb-6">
              Why Choose Snaplica?
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed mb-8">
              We merge award-winning creativity with software-powered reliability. When you book a shoot, you get real-time tracking, an isolated media-delivery dashboard, clear pricing, and a massive team equipped to capture multiple events concurrently.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-serif font-bold text-sm">{f.title}</h4>
                      <p className="text-gray-500 text-xs mt-1 leading-normal font-light">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* YouTube video section */}
          <div className="glass-card p-4 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-brand-gold text-xs uppercase tracking-wider font-semibold">
              <Video className="w-4 h-4" /> Cinematic Showcase
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {/* Responsive Iframe Embed */}
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/54X6YV6N_Zk?autoplay=0&mute=1&loop=1&playlist=54X6YV6N_Zk"
                title="Snaplica Photography Cinema Reel"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed text-center px-4">
              Watch our latest cinematic highlight reel from actual wedding coverage in Vijayawada.
            </p>
          </div>
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="w-full py-16 px-8 rounded-3xl text-center flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A120B, #000000)' }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

          <Heart className="text-brand-gold w-10 h-10 mb-4 animate-pulse opacity-80" />
          <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-4">
            Ready to Capture Your Special Moment?
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-light max-w-xl mb-8 leading-relaxed">
            Share your event details, check dates, and let Snaplica plan the right coverage for your shoot.
          </p>
          
          <a 
            href="/booking"
            className="px-8 py-4 bg-brand-gold hover:bg-amber-500 text-black font-semibold uppercase tracking-wider text-xs rounded-full shadow-lg shadow-brand-gold/30 transition-all hover:scale-105"
          >
            Start Booking Now
          </a>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl">
            <img src={selectedImage} alt="Lightbox View" className="max-w-full max-h-[80vh] object-contain" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PackageCard = ({ pkg, featured }) => {
  const audioRef = useRef(null);

  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div
      onMouseEnter={playAudio}
      onMouseLeave={stopAudio}
      className="relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: featured ? "linear-gradient(135deg,#1a1200,#2d1e00)" : "#fff",
        border: featured ? "2px solid #c9a227" : "2px solid #f0f0f0",
        boxShadow: featured ? "0 20px 60px rgba(201,162,39,0.25)" : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <audio ref={audioRef} src={pkg.audio} preload="none" />
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gold px-4 py-1 text-[11px] font-bold tracking-wider text-black">
          MOST POPULAR
        </div>
      )}
      <h3 className={`mb-4 font-serif text-2xl font-bold ${featured ? "text-brand-gold" : "text-[#111]"}`}>{pkg.name}</h3>
      <ul className="mb-6 space-y-0">
        {pkg.includes.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-2 border-b py-2 text-sm ${featured ? "border-white/10 text-white/80" : "border-gray-100 text-gray-700"}`}
          >
            <span className="text-emerald-500">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <a
          href={`https://wa.me/919494387387?text=${encodeURIComponent(pkg.whatsapp)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#20ba59]"
        >
          <MessageCircle className="h-4 w-4" />
          Book via WhatsApp
        </a>
        <a
          href="tel:+919494387387"
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-colors ${
            featured ? "border border-white/10 bg-white/5 text-white hover:bg-white/10" : "border border-gray-200 bg-gray-50 text-[#111] hover:bg-gray-100"
          }`}
        >
          <Phone className="h-4 w-4" />
          Call to Discuss
        </a>
      </div>
    </div>
  );
};

export default Home;
