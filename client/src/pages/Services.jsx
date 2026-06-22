import React from 'react';
import { Camera, Video, Layers, Check, MessageCircle, Phone } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import SEOHead from '../components/SEOHead';

export const Services = () => {
  const packages = [
    {
      name: "Pre-Wedding Cinematic",
      time: "1 Day Session",
      tag: "Couple Story",
      desc: "Perfect for couple portfolios, featuring outdoor Vijayawada shoot sites and a 3-minute cinematic teaser.",
      icon: Camera,
      features: [
        "1 Lead Portrait Photographer",
        "1 Lead Cinematographer",
        "Gimbal & 4K Camera Rigging",
        "40 Fully Retouched Frames",
        "3-Minute Edited Cinematic Video",
        "Online Customer Portal Access"
      ],
      popular: false
    },
    {
      name: "Royal Wedding Package",
      time: "2 Days Coverage",
      tag: "Full Team",
      desc: "Our flagship comprehensive package. Coverage of main ceremonies with multiple cameras, drone, and premium photobooks.",
      icon: Layers,
      features: [
        "2 Candid Photographers",
        "2 Traditional Photographers",
        "2 Cinematographers (4K)",
        "Aerial Drone Coverage",
        "2 Premium Leather Photobooks",
        "5-Minute Cinematic Film & Full Length Reels",
        "All raw files + web portal delivery"
      ],
      popular: true
    },
    {
      name: "Celebration & Birthday",
      time: "4-Hour Session",
      tag: "Family Events",
      desc: "Candid and traditional coverage for kids, birthdays, housewarmings, and social gatherings.",
      icon: Video,
      features: [
        "1 Candid Photographer",
        "1 Traditional Photographer",
        "Basic Lighting Rig setup",
        "Unlimited RAW captures",
        "50 Color-Corrected Deliveries",
        "Digital Download Link in 5 days"
      ],
      popular: false
    }
  ];

  const gearSpecs = [
    { name: "Camera Bodies", items: ["Sony A7SIII (Cinematics)", "Sony A7RIV (61MP Portraits)", "Sony A7IV (Candid Handlers)"] },
    { name: "Glass Lenses", items: ["Sony GM 70-200mm f2.8", "Sony GM 24-70mm f2.8", "Sigma Art 85mm f1.4 (Portraits)"] },
    { name: "Stabilization & Aerial", items: ["DJI Ronin RS3 Pro Gimbals", "DJI Mavic 3 Pro Cine Drone", "Aputure 600d Studio LED Systems"] }
  ];

  const faqs = [
    { q: "How do I confirm availability?", a: "Share your event date and venue through WhatsApp or the booking form. Snaplica will review team availability and confirm the next steps directly." },
    { q: "How long does editing and photo delivery take?", a: "RAW selections are uploaded to your Customer Portal within 4 days. Edited frames take 2 to 3 weeks, and photobook print deliveries take 4 weeks after your selections." },
    { q: "Do you travel outside Vijayawada?", a: "Yes, our team travels all across Andhra Pradesh and Telangana. Travel and lodging costs are covered by the client for outstation shoots." }
  ];

  return (
    <div className="bg-brand-dark overflow-hidden pb-12">
      <SEOHead 
        title="Services & Packages" 
        description="View Snaplica's wedding, pre-wedding, and corporate photography packages, coverage options, and camera gear lists." 
      />

      <HeroSection pageId="services" />

      {/* Pricing Packages Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold block mb-3">
            Packages
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mb-4">
            Customizable Shoot Packages
          </h2>
          <p className="text-gray-500 text-sm font-light">
            Select a package or speak with Sonu to construct a custom crew configuration matching your ceremony requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, idx) => {
            const Icon = pkg.icon;
            return (
              <div 
                key={idx} 
                className={`rounded-3xl p-8 border relative flex flex-col justify-between h-full
                  ${pkg.popular 
                    ? 'bg-brand-card border-brand-gold shadow-xl shadow-brand-gold/5' 
                    : 'bg-brand-card/40 border-white/5'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-black text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-serif font-bold text-lg">{pkg.name}</h3>
                      <span className="text-xs text-gray-500">{pkg.time}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-gold">
                      {pkg.tag}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">
                    {pkg.desc}
                  </p>

                  <div className="h-[1px] bg-white/5 mb-6" />

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-gray-300 font-light">
                        <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <a
                    href={`https://wa.me/919494387387?text=${encodeURIComponent(`Hi Snaplica! I want to discuss the ${pkg.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-center text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href="tel:+919494387387"
                    className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-center text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] ${
                      pkg.popular ? "bg-brand-gold text-black" : "border border-white/10 bg-white/5 text-white hover:border-white"
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crew Gear Spec Showcases */}
      <section className="bg-brand-card/20 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold">
              Our Gear
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white font-bold mt-2 mb-6">
              Studio Equipment Inventory
            </h2>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">
              Visual excellence depends heavily on equipment redundancy and high dynamic range depth. We shoot on flagship Sony full-frame sensors and G-Master prime glass to ensure cinematic grade color outputs.
            </p>

            <div className="space-y-6">
              {gearSpecs.map((spec, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider">{spec.name}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {spec.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-gray-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/5 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800" 
              alt="Studio Gear Setup" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Booking FAQs */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-xs uppercase tracking-[0.2em] font-semibold block mb-3">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-white font-bold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 space-y-2">
              <h4 className="text-white font-serif font-bold text-base flex gap-2 items-center">
                <span className="text-brand-gold">Q.</span> {faq.q}
              </h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
