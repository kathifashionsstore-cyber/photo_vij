import { Link } from "react-router-dom";
import { Camera, Calendar, Heart, ShieldCheck, Trophy, Users } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import SEOHead from "../components/SEOHead";
import GoogleReviews from "../components/GoogleReviews";
import BookingForm from "../components/BookingForm";
import { db } from "../firebase";

export const Home = () => {
  const stats = [
    { value: 1000, suffix: "+", label: "Events Covered", icon: Camera },
    { value: 36, suffix: "", label: "Team Members", icon: Users },
    { value: 5, suffix: "+", label: "Years Experience", icon: Calendar },
    { value: 2, suffix: "x", label: "Award Winner", icon: Trophy },
  ];

  const features = [
    { title: "Founder-Led Planning", desc: "Every inquiry is reviewed with creative intent, scheduling clarity, and crew fit in mind.", icon: Heart },
    { title: "Dedicated Operations", desc: "Bookings, teams, galleries, and communication are tracked from a single admin workflow.", icon: ShieldCheck },
    { title: "Large Event Ready", desc: "Specialists can be scheduled for multiple rituals, stages, locations, and parallel moments.", icon: Users },
  ];

  return (
    <div className="overflow-hidden bg-brand-dark pb-16">
      <SEOHead
        title="Home"
        description="Snaplica Photography in Vijayawada captures weddings, events, portraits, products, reels, and drone stories with a founder-led team."
      />

      <HeroSection pageId="home" />

      <HomeHighlightsSection />
      <HomeVideosSection />

      <section className="border-y border-white/5 bg-black/50 py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-white/10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center justify-center rounded-[8px] p-4 text-center md:rounded-none">
                  <Icon className="mb-3 h-8 w-8 text-brand-gold" />
                  <div className="mb-1 text-3xl font-bold text-white md:text-4xl">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-brand-card/30 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Meet The Founder</span>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Sonu built Snaplica around care, craft, and consistency.</h2>
            <p className="mt-5 text-sm leading-8 text-gray-400">
              Snaplica started as one photographer's promise to preserve important days with honesty. Today it is a full team operation that still keeps that personal attention at the center of every shoot.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/portfolio" className="rounded-full bg-brand-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
                View Story
              </Link>
              <Link to="/services" className="rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
                Explore Services
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[8px] border border-white/10 bg-black/25 p-5">
                  <Icon className="mb-4 h-6 w-6 text-brand-gold" />
                  <h3 className="text-base font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="home-booking" className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-[0.85fr_1.15fr] md:px-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Book Snaplica</span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Send your event details in one clean step.</h2>
          <p className="mt-5 text-sm leading-8 text-gray-400">
            Your request is saved to the admin bookings list, a receipt PDF is downloaded, and the studio WhatsApp draft opens with the full brief.
          </p>
        </div>
        <BookingForm source="home" />
      </section>

      <GoogleReviews dark />
    </div>
  );
};

const HomeHighlightsSection = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "homeHighlights"), orderBy("order", "asc")),
      (snap) => setPhotos(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })).filter((item) => item.active !== false)),
      (err) => console.error("Home highlights listener failed:", err),
    );
    return unsub;
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="bg-[#0d0d0f] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Latest Highlights</span>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Stories Framed By Snaplica</h2>
          </div>
          <Link to="/portfolio" className="rounded-full border border-brand-gold/40 px-5 py-3 text-xs font-bold uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
            View Portfolio
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {photos.slice(0, 6).map((photo, index) => (
            <article
              key={photo.id}
              className={`group relative overflow-hidden rounded-[8px] border border-brand-gold/30 bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img src={photo.imageUrl} alt={photo.caption || "Snaplica highlight"} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {photo.caption && (
                <p className="absolute bottom-0 left-0 right-0 p-4 text-sm font-semibold leading-6 text-white md:p-5">
                  {photo.caption}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomeVideosSection = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "homeVideos"), orderBy("order", "asc")),
      (snap) => setVideos(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })).filter((item) => item.active !== false)),
      (err) => console.error("Home videos listener failed:", err),
    );
    return unsub;
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="border-y border-white/5 bg-black px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Films</span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Featured Video Stories</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {videos.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-[#0f0f12]">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="aspect-video w-full bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="border-t border-white/10 p-4">
                <h3 className="text-base font-bold text-white">{video.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
