import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Award, Camera, HeartHandshake, Sparkles, Trophy } from "lucide-react";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import { db } from "../firebase";
import { SERVICES, SERVICE_LABELS } from "../data/services";

const timeline = [
  { year: "2019", title: "The First Step", text: "Sonu began with a camera, local trust, and a clear promise to respect every family moment." },
  { year: "2021", title: "Growing Studio", text: "Snaplica expanded its workflow across photography, video, drone, and event operations." },
  { year: "2024", title: "Recognized Craft", text: "The studio earned wider recognition for consistent wedding and event coverage across Andhra Pradesh." },
  { year: "2026", title: "Full Workflow Studio", text: "Bookings, galleries, and client communication now run through a connected studio system." },
];

export const Portfolio = () => {
  const [gallery, setGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), where("showInPublic", "==", true)),
      (snap) => setGallery(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => {
        console.warn("Portfolio gallery fetch failed:", err);
        setGallery([]);
      },
    );

    return unsubscribe;
  }, []);

  const founderImages = gallery.filter((item) => item.category === "founder");
  const workGallery = gallery.filter((item) => SERVICES.some((service) => service.id === item.category));
  const filteredWork = useMemo(
    () => activeCategory === "all" ? workGallery : workGallery.filter((item) => item.category === activeCategory),
    [activeCategory, workGallery],
  );

  const displayedFounder = founderImages[0]?.imageUrl || founderImages[0]?.url || "/images/founder.jpg";
  const fallbackWork = SERVICES.slice(0, 9).map((service) => ({
    id: service.id,
    category: service.id,
    imageUrl: service.image,
    description: service.summary,
  }));
  const displayWork = filteredWork.length > 0 ? filteredWork : fallbackWork;

  return (
    <div className="overflow-hidden bg-brand-dark pb-20">
      <SEOHead
        title="Portfolio"
        description="Meet founder Sonu, the Snaplica studio story, awards, helping hands, and public work galleries."
      />

      <HeroSection pageId="portfolio" />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-12">
        <div className="overflow-hidden rounded-[8px] border border-brand-gold/30 bg-brand-card">
          <img src={displayedFounder} alt="Snaplica founder Sonu" className="h-full min-h-[420px] w-full object-cover" />
        </div>
        <div className="self-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Founder Intro</span>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">Sonu, the heart behind Snaplica Photography.</h1>
          <p className="mt-5 text-sm leading-8 text-gray-400">
            Snaplica is built on a simple belief: photography should make people feel remembered, not staged. Sonu shaped the studio around patience, kindness, and a thoughtful creative process so every event feels cared for from the first call to final delivery.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["5+", "Years"],
              ["10+", "Services"],
              ["1000+", "Events"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[8px] border border-white/10 bg-black/25 p-4 text-center">
                <div className="text-2xl font-bold text-brand-gold">{value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-brand-card/30 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-[1fr_1fr] md:px-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Kind Heart Story</span>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">A studio that treats events like family memory.</h2>
          </div>
          <p className="text-sm leading-8 text-gray-400">
            Snaplica is shaped around noticing the small things: a parent waiting quietly near the stage, a child laughing between rituals, a product's exact texture under light, or the way a venue looks from above. That attention is why clients return for every new chapter.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-10 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-brand-gold" />
          <h2 className="text-3xl font-bold text-white">Timeline</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {timeline.map((item) => (
            <div key={item.year} className="rounded-[8px] border border-white/10 bg-brand-card p-5">
              <div className="text-2xl font-bold text-brand-gold">{item.year}</div>
              <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-20 md:grid-cols-3 md:px-12">
        {[
          { icon: HeartHandshake, title: "Helping Hands", text: "Snaplica supports families through schedules, rituals, movement, and calm coordination." },
          { icon: Award, title: "Awards", text: "Snaplica has been recognized for photography excellence and trusted event delivery." },
          { icon: Trophy, title: "Studio Craft", text: "Every public gallery image can be curated from the admin gallery with clear visibility control." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[8px] border border-white/10 bg-brand-card p-6">
              <Icon className="mb-5 h-8 w-8 text-brand-gold" />
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-500">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Work Gallery</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Filter by service category.</h2>
          </div>
          <Camera className="h-10 w-10 text-brand-gold" />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory("all")} className={filterClass(activeCategory === "all")}>All</button>
          {SERVICES.map((service) => (
            <button key={service.id} onClick={() => setActiveCategory(service.id)} className={filterClass(activeCategory === service.id)}>
              {service.shortTitle}
            </button>
          ))}
        </div>

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {displayWork.map((item) => (
            <figure key={item.id} className="mb-5 break-inside-avoid overflow-hidden rounded-[8px] border border-white/10 bg-brand-card">
              <img src={item.imageUrl || item.url} alt={item.description || SERVICE_LABELS[item.category] || "Snaplica work"} className="w-full object-cover" />
              <figcaption className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">{SERVICE_LABELS[item.category] || item.category || "Snaplica"}</p>
                {item.description && <p className="mt-2 text-sm leading-6 text-gray-400">{item.description}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
};

const filterClass = (active) =>
  `rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
    active ? "border-brand-gold bg-brand-gold text-black" : "border-white/10 text-gray-400 hover:border-brand-gold hover:text-brand-gold"
  }`;

export default Portfolio;
