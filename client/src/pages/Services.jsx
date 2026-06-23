import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import { SERVICES } from "../data/services";

export const Services = () => {
  return (
    <div className="overflow-hidden bg-brand-dark pb-20">
      <SEOHead
        title="Services"
        description="Explore Snaplica Photography services including weddings, pre-weddings, maternity, birthdays, corporate, product, drone, reels, and event coverage."
      />

      <HeroSection pageId="services" />

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-12 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Services</span>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">Choose the kind of story you want captured.</h1>
          <p className="mt-5 text-sm leading-8 text-gray-400">
            Every service starts with date availability, venue requirements, crew planning, and creative direction from the Snaplica team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link key={service.id} to={`/services/${service.id}`} className="group overflow-hidden rounded-[8px] border border-white/10 bg-brand-card no-underline transition-transform duration-300 hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={service.image} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-white">{service.title}</h2>
                <p className="mt-3 min-h-[54px] text-sm leading-6 text-gray-500">{service.summary}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                  View Gallery <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center md:px-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">How We Work</span>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {["Discuss service type", "Verify team availability", "Schedule and confirm"].map((step) => (
                <div key={step} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-brand-card/60 p-4">
                  <CheckCircle className="h-5 w-5 text-brand-gold" />
                  <span className="text-sm font-semibold text-white">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
            <MessageCircle className="h-4 w-4" />
            Book A Shoot
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
