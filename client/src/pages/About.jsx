import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import GoogleReviews from "../components/GoogleReviews";
import { db } from "../firebase";

const DEFAULT_ABOUT = {
  founderName: "Snaplica Sonu",
  founderRole: "Founder & Creative Director",
  founderImageUrl: "/images/founder.jpg",
  eyebrow: "About Snaplica",
  heading: "A Vijayawada studio built around emotional storytelling and reliable event coverage.",
  story:
    "Founded in 2017 by Mr. Sonu, Snaplica Photography grew from a personal love for preserving real moments into a full-service photography and filmmaking studio in Ibrahimpatnam, Vijayawada. The studio is known for wedding photography, cinematic videography, drone coverage, reels and social content, and warm documentary storytelling that keeps families, rituals, and atmosphere at the center of the frame.",
  recognitions:
    "Recognitions include Times Business Awards Andhra Pradesh honors, APCEI Best Photography recognition, JD Design Awards mentions, and Andhra Pradesh Event Excellence Awards appreciation for consistent creative work and client trust.",
};

export default function About() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "about"),
      (snap) => setAbout({ ...DEFAULT_ABOUT, ...(snap.exists() ? snap.data() : {}) }),
      (err) => {
        console.warn("About content fetch failed:", err);
        setAbout(DEFAULT_ABOUT);
      },
    );
    return unsubscribe;
  }, []);

  return (
    <div className="overflow-hidden bg-brand-dark pb-12">
      <SEOHead
        title="About Us"
        description="Learn about Snaplica Photography, founder Snaplica Sonu, the studio story, recognitions, and creative approach."
      />

      <HeroSection pageId="about" />

      <section className="px-6 py-24 text-white md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative">
            <img
              src={about.founderImageUrl}
              alt={`${about.founderName} - ${about.founderRole}`}
              className="aspect-[4/5] w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=900";
              }}
            />
            <div className="mt-5">
              <p className="text-2xl font-bold text-white">{about.founderName}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">{about.founderRole}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">{about.eyebrow}</p>
            <h2 className="font-serif text-4xl font-bold leading-tight md:text-6xl">{about.heading}</h2>
            <div className="mt-8 space-y-6 text-base leading-8 text-gray-300">
              <p>{about.story}</p>
              <p className="text-brand-gold/90">{about.recognitions}</p>
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews dark />
    </div>
  );
}
