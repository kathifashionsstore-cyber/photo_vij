import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
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
            Every service starts with date availability, venue requirements, production planning, and creative direction from Snaplica.
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {SERVICES.map((service, index) => (
            <Link key={service.id} to={`/services/${service.id}`} className="group grid gap-4 py-6 no-underline transition-colors hover:bg-white/[0.025] md:grid-cols-[90px_1fr_auto] md:items-center">
              <span className="font-serif text-3xl text-brand-gold/60 md:text-4xl">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-2xl font-bold text-white transition-colors group-hover:text-brand-gold md:text-3xl">{service.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500">{service.summary}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                View Detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center md:px-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">How We Work</span>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {["Discuss service type", "Verify date availability", "Schedule and confirm"].map((step, index) => (
                <div key={step} className="flex items-baseline gap-3">
                  <span className="font-serif text-xl text-brand-gold">{index + 1}</span>
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
