import React from "react";
import { Heart, Trophy, Video } from "lucide-react";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import GoogleReviews from "../components/GoogleReviews";

const gold = "#c9a227";

const timeline = [
  ["2017", "Founded"],
  ["2020", "30+ Events/mo"],
  ["2023", "6,000+ Events"],
  ["2024", "17 Countries"],
];

const initiatives = [
  ["Food Drives", "Regular meal distributions to families below the poverty line"],
  ["Festival Relief", "Ramadan and festival support through dry rations and financial aid"],
  ["Community First", "Direct ground-level distributions so help reaches the people who need it"],
];

const videoReels = [
  { src: "/videos/wedding-reel.mp4", poster: "/images/video-thumb-1.jpg", title: "Wedding Reel" },
  { src: "/videos/prewedding-reel.mp4", poster: "/images/video-thumb-2.jpg", title: "Pre-Wedding Reel" },
];

export default function About() {
  return (
    <div className="overflow-hidden bg-brand-dark pb-12">
      <SEOHead
        title="About Us"
        description="Learn about Snaplica Sonu's journey, the Snaplica Photography team, awards, community initiatives, and video work."
      />

      <HeroSection pageId="about" />

      <FounderSection />
      <AwardsSection />
      <HelpingHandsSection />
      <TeamSection />
      <VideoSection />
      <GoogleReviews dark />
    </div>
  );
}

const FounderSection = () => (
  <section className="bg-[#0f0f12] px-6 py-24 text-white md:px-12">
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 md:grid-cols-2">
      <div className="relative">
        <img
          src="/images/founder.jpg"
          alt="Snaplica Sonu - Founder"
          className="aspect-[4/5] w-full rounded-2xl border-[3px] border-brand-gold/30 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=900";
          }}
        />
        <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur">
          <img
            src="/images/ceo.jpg"
            alt="CEO Sonu"
            className="h-16 w-16 rounded-full border-[3px] border-brand-gold object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://ui-avatars.com/api/?name=Snaplica+Sonu&background=1a1200&color=c9a227&size=96";
            }}
          />
          <div>
            <p className="text-sm font-bold text-white">Snaplica Sonu</p>
            <p className="text-xs text-brand-gold">Founder & Creative Director</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Our Story</p>
        <h2 className="mb-6 font-serif text-4xl font-bold leading-tight md:text-5xl">
          From a Dream to 6,000+ Events
        </h2>
        <div className="space-y-5 text-sm leading-8 text-gray-300 md:text-base">
          <p>
            Founded in 2017 by Mr. Sonu, affectionately known as <strong className="text-brand-gold">Snaplica Sonu</strong>, Snaplica Photography began as a personal passion for preserving real moments and quickly grew into one of Andhra Pradesh's celebrated photography studios.
          </p>
          <p>
            Today, Snaplica Photography is headquartered in Ibrahimpatnam, Vijayawada, with a dedicated team of over <strong className="text-brand-gold">36 professionals</strong> and a portfolio spanning <strong className="text-brand-gold">17+ countries</strong>.
          </p>
          <p>
            Under Sonu's creative direction, the studio has won the <strong className="text-brand-gold">Best Photography Award at Times Business Awards Andhra Pradesh twice</strong>, with the award personally presented by Bollywood actress Rakul Preet Singh, along with the <strong className="text-brand-gold">APCEI Golden Award</strong> for Best Photography of the Year.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {timeline.map(([year, label]) => (
            <div key={year} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-brand-gold">{year}</div>
              <div className="mt-1 text-[11px] text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const AwardsSection = () => (
  <section className="border-y border-white/5 bg-brand-card/30 px-6 py-20 md:px-12">
    <div className="mx-auto max-w-5xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Accolades</p>
      <h2 className="mb-10 font-serif text-3xl font-bold text-white md:text-5xl">Award-Winning Studio</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {["Times Business Awards AP - Winner", "Times Business Awards AP - Winner", "APCEI Golden Award"].map((award) => (
          <div key={award} className="rounded-2xl border border-white/5 bg-black/20 p-6">
            <Trophy className="mx-auto mb-4 h-9 w-9 text-brand-gold" />
            <p className="text-sm font-bold text-white">{award}</p>
            <p className="mt-3 text-xs leading-6 text-gray-500">Recognized for consistent creative direction, event coverage, and client trust.</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HelpingHandsSection = () => (
  <section className="bg-[#faf9f6] px-6 py-24 md:px-12">
    <div className="mx-auto max-w-5xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Social Responsibility</p>
      <Heart className="mx-auto mb-4 h-10 w-10 text-brand-gold" />
      <h2 className="mb-5 font-serif text-3xl font-bold text-[#111] md:text-5xl">Helping Hands Initiative</h2>
      <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-gray-600">
        Mr. Sonu has committed 3% of Snaplica's monthly revenue to supporting underprivileged communities. Through food security drives, Ramadan relief distributions, and ground-level welfare initiatives, Snaplica believes business success should translate into community impact.
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {initiatives.map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <h3 className="mb-3 font-serif text-lg font-bold text-[#111]">{title}</h3>
            <p className="text-sm leading-7 text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TeamSection = () => (
  <section className="bg-[#111] px-6 py-24 md:px-12">
    <div className="mx-auto max-w-7xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">The People Behind the Lens</p>
      <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-5xl">Our Team of 36 Professionals</h2>
      <p className="mx-auto mb-12 max-w-2xl text-sm leading-7 text-gray-500">
        Photographers, videographers, editors, drone operators, and event specialists united by one mission: preserve the feeling of the day.
      </p>

      <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
        {Array.from({ length: 36 }, (_, index) => (
          <div key={index} className="text-center">
            <img
              src={`/images/team/member-${index + 1}.jpg`}
              alt={`Team Member ${index + 1}`}
              className="mx-auto mb-2 h-20 w-20 rounded-full border-2 border-brand-gold/30 object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=Team+${index + 1}&background=1a1200&color=c9a227&size=96`;
              }}
            />
            <p className="text-[11px] text-gray-500">Member {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const VideoSection = () => (
  <section className="bg-[#0a0a0a] px-6 py-24 md:px-12">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Motion</p>
        <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Our Work in Motion</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {videoReels.map((video) => (
          <div key={video.src} className="rounded-2xl border border-white/5 bg-black p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
              <Video className="h-4 w-4" />
              {video.title}
            </div>
            <video src={video.src} controls poster={video.poster} className="aspect-video w-full rounded-xl bg-[#111] object-cover">
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  </section>
);
