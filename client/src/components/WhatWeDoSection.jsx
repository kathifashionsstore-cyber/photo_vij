import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useServices from "../hooks/useServices";

export default function WhatWeDoSection({ compact = false }) {
  const { services } = useServices({ activeOnly: true });

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
      <div className="mb-12 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">What We Do</span>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">Choose the kind of story you want captured.</h1>
        <p className="mt-5 text-sm leading-8 text-gray-400">
          Every service starts with date availability, venue requirements, production planning, and creative direction from Snaplica.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {services.map((service) => (
          <Link key={service.id} to={`/services/${service.id}`} className="group flex flex-col items-center text-center no-underline">
            <span className="relative grid aspect-square w-full max-w-[168px] place-items-center overflow-hidden rounded-full border border-brand-gold/25 bg-black/35 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold group-hover:shadow-[0_20px_50px_rgba(201,162,39,0.16)]">
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <span className="text-4xl" aria-hidden="true">{service.icon}</span>
              )}
              <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/55 via-transparent to-white/5" />
            </span>
            <span className="mt-4 text-sm font-bold text-white transition-colors group-hover:text-brand-gold">{service.label}</span>
            {!compact && (
              <span className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">{service.description || service.summary}</span>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold opacity-0 transition-opacity group-hover:opacity-100">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
