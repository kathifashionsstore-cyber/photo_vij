import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
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
  awardsEyebrow: "Recognitions",
  awardsHeading: "Our Recognitions & Awards",
  awardsIntro:
    "Since our journey began in 2021, we have earned recognition across photography, cinematography, drone visuals, wedding storytelling, and creative content. Every award reflects the trust our clients place in us.",
};

const awards = [
  {
    name: "Times Business Awards - Andhra Pradesh",
    issuer: "Times Business Awards AP",
    year: "2022",
    category: "Best Photography Recognition; Young Achiever Recognition in Visual Storytelling",
  },
  {
    name: "APCEI Best Photography Award",
    issuer: "APCEI",
    year: "2023",
    category: "Best Photography Award",
  },
  {
    name: "Times Business Awards - Andhra Pradesh",
    issuer: "Times Business Awards AP",
    year: "2024",
    category: "Excellence in Drone & Cinematic Photography",
  },
  {
    name: "Andhra Pradesh Event Excellence Awards",
    issuer: "Andhra Pradesh Event Excellence Awards",
    year: "2025",
    category: "Best Wedding Photography; Best Reel Maker of the Year",
  },
  {
    name: "JD Design Awards",
    issuer: "JD Design Awards",
    year: "Recognition",
    category: "Creative Excellence Recognition",
  },
];

const supportingRecognitions = [
  "Photography Partner & Collaboration Awards",
  "Media, Press & Community Appreciation Awards",
  "Creative Content & Storytelling Recognitions",
  "Special Contribution Awards in Photography & Events",
];

const awardGallery = [
  { src: "/awards/award-01.jpg", caption: "Times Business Awards AP 2022" },
  { src: "/awards/award-02.jpg", caption: "Young Achiever Recognition" },
  { src: "/awards/award-03.jpg", caption: "APCEI Recognition" },
  { src: "/awards/award-04.jpg", caption: "Times Business Awards 2024" },
  { src: "/awards/award-05.jpg", caption: "Drone & Cinematic Photography" },
  { src: "/awards/award-06.jpg", caption: "Andhra Pradesh Event Excellence Awards" },
  { src: "/awards/award-07.jpg", caption: "Best Wedding Photography" },
  { src: "/awards/award-08.jpg", caption: "Best Reel Maker of the Year" },
  { src: "/awards/award-09.jpg", caption: "JD Design Awards" },
  { src: "/awards/award-10.jpg", caption: "Creative Excellence Recognition" },
  { src: "/awards/award-11.jpg", caption: "Photography Partner Award" },
  { src: "/awards/award-12.jpg", caption: "Collaboration Recognition" },
  { src: "/awards/award-13.jpg", caption: "Media Point Recognition" },
  { src: "/awards/award-14.jpg", caption: "Press Appreciation" },
];

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const awardRowReveal = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const galleryReveal = {
  hidden: { opacity: 0, scale: 0.96, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const useRevealOnce = (amount = 0.2) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      setVisible(true);
      return undefined;
    }

    let frameId = 0;
    const checkVisibility = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const revealLine = viewportHeight * (1 - amount);

        if (rect.top <= revealLine && rect.bottom >= 0) {
          setVisible(true);
        }
      });
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [amount, visible]);

  return [ref, visible];
};

const AwardsRecognitionsSection = ({ about }) => {
  const [headerRef, headerVisible] = useRevealOnce(0.28);
  const [awardsRef, awardsVisible] = useRevealOnce(0.22);
  const [supportingRef, supportingVisible] = useRevealOnce(0.22);
  const [galleryHeaderRef, galleryHeaderVisible] = useRevealOnce(0.25);
  const [galleryRef, galleryVisible] = useRevealOnce(0.18);

  return (
    <section className="border-y border-white/5 bg-[#080808] px-6 py-24 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={headerRef}
          className="max-w-3xl"
          initial="hidden"
          animate={headerVisible ? "visible" : "hidden"}
          variants={awardRowReveal}
        >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">{about.awardsEyebrow}</p>
        <h2 className="font-serif text-4xl font-bold leading-tight md:text-6xl">{about.awardsHeading}</h2>
        <p className="mt-6 text-base leading-8 text-gray-300 md:text-lg">{about.awardsIntro}</p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.35fr)]">
        <motion.ul
          ref={awardsRef}
          className="space-y-4"
          initial="hidden"
          animate={awardsVisible ? "visible" : "hidden"}
          variants={revealContainer}
        >
          {awards.map((award) => (
            <motion.li
              key={`${award.name}-${award.year}`}
              variants={awardRowReveal}
              className="group grid gap-4 rounded-lg border border-white/[0.08] bg-white/[0.025] p-5 transition-colors duration-300 hover:border-brand-gold/35 hover:bg-white/[0.04] sm:grid-cols-[90px_1fr]"
            >
              <div>
                <span className="inline-flex min-w-20 justify-center rounded-full bg-brand-gold px-4 py-2 text-xs font-bold text-black shadow-[0_10px_30px_rgba(201,162,39,0.18)]">
                  {award.year}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{award.issuer}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{award.name}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{award.category}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          ref={supportingRef}
          className="self-start border-l border-brand-gold/25 pl-6"
          initial="hidden"
          animate={supportingVisible ? "visible" : "hidden"}
          variants={revealContainer}
        >
          <motion.p variants={awardRowReveal} className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
            Also Recognized For
          </motion.p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-gray-300">
            {supportingRecognitions.map((item) => (
              <motion.li key={item} variants={awardRowReveal} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-gold" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="mt-20">
        <motion.div
          ref={galleryHeaderRef}
          className="flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-10 md:flex-row md:items-end"
          initial="hidden"
          animate={galleryHeaderVisible ? "visible" : "hidden"}
          variants={awardRowReveal}
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Award Gallery</p>
            <h3 className="font-serif text-3xl font-bold leading-tight md:text-5xl">Moments from the recognition wall</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-gray-400">
            Placeholder image slots are ready for physical trophies, stage moments, and event photographs. Replace files in
            <span className="text-brand-gold"> /public/awards/ </span>
            with the same filenames to update the wall.
          </p>
        </motion.div>

        <motion.div
          ref={galleryRef}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={galleryVisible ? "visible" : "hidden"}
          variants={revealContainer}
        >
          {awardGallery.map((item) => (
            <motion.figure
              key={item.src}
              variants={galleryReveal}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="group overflow-hidden rounded-lg bg-brand-card shadow-[0_18px_45px_rgba(0,0,0,0.24)]"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-lg">
                <motion.img
                  src={item.src}
                  alt={item.caption}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  loading="lazy"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 transition-colors duration-300 group-hover:text-brand-gold">
                {item.caption}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
  );
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

      <AwardsRecognitionsSection about={about} />

      <GoogleReviews dark />
    </div>
  );
}
