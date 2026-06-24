import React, { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clipboard, Home, MessageCircle, Phone } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export const BookingSuccess = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const bookingRef = useMemo(
    () => location.state?.bookingRef || searchParams.get('ref') || 'SNP-REFERENCE',
    [location.state?.bookingRef, searchParams],
  );

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-brand-dark pb-24 pt-10 md:pt-14">
      <SEOHead
        title="Booking Request Received"
        description="Your Snaplica booking request has been submitted successfully."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <img
            src="/logo.webp"
            alt="Snaplica Photography"
            className="mx-auto mb-8 h-20 w-20 rounded-3xl object-contain ring-1 ring-brand-gold/30 shadow-2xl shadow-brand-gold/10"
          />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <CheckCircle className="h-4 w-4" />
            Booking request received
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Your request is in the Snaplica calendar queue.
          </h1>

          <div className="mx-auto mt-8 max-w-md rounded-3xl border border-white/5 bg-brand-card p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Your Ref</p>
            <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-4">
              <span className="font-mono text-xl font-bold text-brand-gold">{bookingRef}</span>
              <button
                type="button"
                onClick={copyReference}
                className="rounded-lg bg-brand-gold px-3 py-2 text-black transition-colors hover:bg-amber-500"
                aria-label="Copy booking reference"
              >
                <Clipboard className="h-4 w-4" />
              </button>
            </div>
            {copied && <p className="mt-2 text-xs text-emerald-400">Reference copied.</p>}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/5 bg-black/25 p-6 md:p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">What happens next</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              'Request received',
              'Admin reviews within 24 hrs',
              'Studio calls to confirm',
              'Advance payment',
              'Event confirmed',
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/5 bg-brand-card/70 p-4 text-center">
                <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-black">
                  {index + 1}
                </div>
                <p className="text-xs leading-5 text-gray-400">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="https://wa.me/919494387387"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
            href="tel:9494387387"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            <Phone className="h-4 w-4" />
            Call 9494387387
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            <Home className="h-4 w-4" />
            Back Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BookingSuccess;
