import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Check, CheckCircle, MessageCircle, Phone } from 'lucide-react';
import { db } from '../firebase';
import HeroSection from '../components/HeroSection';
import SEOHead from '../components/SEOHead';
import {
  buildAdminNewBookingWhatsApp,
  buildClientInquiryWhatsApp,
  normalizePhone,
} from '../utils/whatsapp';

const EVENT_TYPES = [
  'Wedding',
  'Pre-Wedding',
  'Birthday',
  'Corporate',
  'Product Shoot',
  'Maternity',
  'Graduation',
  'Other',
];

const DURATIONS = ['Half Day', 'Full Day', '2 Days', 'Multi-Day'];

const PACKAGES = [
  { id: 'basic', label: 'Basic', display: 'Essential photography coverage' },
  { id: 'standard', label: 'Standard', display: 'Photo, video, and extended event coverage' },
  { id: 'premium', label: 'Premium', display: 'Full team coverage with cinematic add-ons' },
  { id: 'custom', label: 'Custom', display: 'Tailored around your event plan' },
];

const SERVICES = [
  'Photography',
  'Videography',
  'Drone Coverage',
  'Photo Album',
  'Same-Day Edit Video',
  'Pre-Event Shoot',
];

const REFERRAL_SOURCES = ['Google', 'Instagram', 'Facebook', 'Friend', 'Walk-in', 'Other'];

const initialForm = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientCity: '',
  eventType: 'Wedding',
  eventDate: '',
  eventTime: '',
  venue: '',
  duration: 'Full Day',
  packageInterest: 'Premium',
  guestCount: '',
  servicesNeeded: ['Photography'],
  specialRequirements: '',
  referralSource: 'Google',
  termsAccepted: false,
};

const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const fallbackBookingRef = () => {
  const year = new Date().getFullYear();
  return `SNP-${year}-${String(Date.now()).slice(-6)}`;
};

const generateBookingRef = async () => {
  const year = new Date().getFullYear();
  const counterRef = doc(db, 'counters', `bookings-${year}`);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      const nextNumber = (snap.exists() ? Number(snap.data().lastNumber || 0) : 0) + 1;
      transaction.set(
        counterRef,
        {
          year,
          lastNumber: nextNumber,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return `SNP-${year}-${String(nextNumber).padStart(3, '0')}`;
    });
  } catch (err) {
    console.warn('Booking counter unavailable, using timestamp fallback:', err);
    return fallbackBookingRef();
  }
};

export const Booking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleService = (service) => {
    setFormData((prev) => {
      const exists = prev.servicesNeeded.includes(service);
      return {
        ...prev,
        servicesNeeded: exists
          ? prev.servicesNeeded.filter((item) => item !== service)
          : [...prev.servicesNeeded, service],
      };
    });
  };

  const handlePackageSelect = (pkg) => {
    setFormData((prev) => ({ ...prev, packageInterest: pkg.label }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      setError('Please agree to the terms and conditions before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingRef = await generateBookingRef();
      const normalizedPhone = normalizePhone(formData.clientPhone);

      const bookingPayload = {
        ...formData,
        clientPhone: normalizedPhone,
        phone: normalizedPhone,
        email: formData.clientEmail,
        clientEmail: formData.clientEmail,
        clientCity: formData.clientCity,
        venueAddress: formData.venue,
        package: formData.packageInterest,
        packageName: `${formData.packageInterest} Package`,
        priority: 'normal',
        source: 'website_form',
        bookingSource: 'Website Form',
        bookingRef,
        status: 'new_inquiry',
        assignedTeamId: '',
        assignedTeamName: '',
        assignedTeamLeaderPhone: '',
        receiptGenerated: false,
        receiptUrl: '',
        contractSigned: false,
        whatsappSentToAdmin: true,
        whatsappSentToClient: true,
        lastAction: 'Website inquiry submitted',
        notes: [],
        statusHistory: [{ status: 'new_inquiry', label: 'Booking request received', at: new Date().toISOString() }],
        auditLog: [{ action: 'WEBSITE_BOOKING_CREATED', at: new Date().toISOString() }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const bookingDoc = await addDoc(collection(db, 'bookings'), bookingPayload);

      const leadPayload = {
        bookingId: bookingDoc.id,
        bookingRef,
        sourceCollection: 'bookings',
        clientName: bookingPayload.clientName,
        phone: normalizedPhone,
        clientPhone: normalizedPhone,
        email: bookingPayload.clientEmail,
        clientEmail: bookingPayload.clientEmail,
        clientCity: bookingPayload.clientCity,
        eventType: bookingPayload.eventType,
        eventDate: bookingPayload.eventDate,
        eventTime: bookingPayload.eventTime,
        venue: bookingPayload.venue,
        package: bookingPayload.packageInterest,
        packageInterest: bookingPayload.packageInterest,
        servicesNeeded: bookingPayload.servicesNeeded,
        priority: 'normal',
        status: 'new_inquiry',
        notes: bookingPayload.specialRequirements,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      addDoc(collection(db, 'leads'), leadPayload).catch((leadErr) => {
        console.warn('Lead mirror could not be created. CRM still reads bookings:', leadErr);
      });

      window.open(buildAdminNewBookingWhatsApp({ ...bookingPayload, id: bookingDoc.id }), '_blank');
      setTimeout(() => {
        window.open(buildClientInquiryWhatsApp({ ...bookingPayload, id: bookingDoc.id }), '_blank');
      }, 700);

      setFormData(initialForm);
      navigate(`/booking/success?ref=${encodeURIComponent(bookingRef)}`, {
        state: {
          bookingRef,
          booking: {
            ...bookingPayload,
            id: bookingDoc.id,
          },
        },
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to schedule booking. Please contact Sonu directly at 9494387387.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden bg-brand-dark pb-24">
      <SEOHead
        title="Schedule Event Shoot"
        description="Book your wedding, pre-wedding, or celebratory photoshoot date online with Snaplica's automated planner."
      />

      <HeroSection pageId="booking" />

      <section id="booking-form" className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Booking Request
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
                Share the full event brief with Snaplica.
              </h2>
              <p className="mt-5 text-sm font-light leading-8 text-gray-400">
                Your details are saved to the admin bookings module and CRM pipeline. The WhatsApp drafts open after submission so the team and client both get the booking reference immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                'Admin receives the full inquiry instantly.',
                'Your reference number is generated automatically.',
                'Snaplica follows up within 24 hours.',
                'Snaplica follows up to confirm availability and next steps.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/5 bg-brand-card/60 p-5">
                  <CheckCircle className="mb-3 h-5 w-5 text-brand-gold" />
                  <p className="text-xs leading-6 text-gray-400">{item}</p>
                </div>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="glass-card space-y-8 rounded-3xl p-6 md:p-8">
            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-900/20 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <FormSection number="1" title="Personal Details">
              <Field label="Full Name">
                <input required name="clientName" value={formData.clientName} onChange={handleChange} className={inputClass} placeholder="e.g. Rahul Verma" />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Phone Number">
                  <div className="flex overflow-hidden rounded-xl border border-white/5 bg-black/40 focus-within:border-brand-gold">
                    <span className="flex items-center border-r border-white/5 px-3 text-xs font-bold text-brand-gold">+91</span>
                    <input required name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-xs text-white outline-none" placeholder="9494387387" />
                  </div>
                </Field>
                <Field label="Email Address">
                  <input required type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className={inputClass} placeholder="client@email.com" />
                </Field>
              </div>

              <Field label="City / Area">
                <input required name="clientCity" value={formData.clientCity} onChange={handleChange} className={inputClass} placeholder="Ibrahimpatnam, Vijayawada" />
              </Field>
            </FormSection>

            <FormSection number="2" title="Event Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Event Type">
                  <select required name="eventType" value={formData.eventType} onChange={handleChange} className={inputClass}>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Event Duration">
                  <select name="duration" value={formData.duration} onChange={handleChange} className={inputClass}>
                    {DURATIONS.map((duration) => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Event Date">
                  <input required type="date" min={todayInputValue()} name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Event Time">
                  <input required type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className={inputClass} />
                </Field>
              </div>

              <Field label="Event Venue / Location">
                <input required name="venue" value={formData.venue} onChange={handleChange} className={inputClass} placeholder="Full venue address" />
              </Field>
            </FormSection>

            <FormSection number="3" title="Package & Requirements">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {PACKAGES.map((pkg) => {
                  const active = formData.packageInterest === pkg.label;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg)}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                        active ? 'border-brand-gold bg-brand-gold/10' : 'border-white/5 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{pkg.label}</p>
                        <p className="mt-1 text-xs text-gray-500">{pkg.display}</p>
                      </div>
                      {active && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-black">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Field label="Number of Guests">
                <input type="number" min="1" name="guestCount" value={formData.guestCount} onChange={handleChange} className={inputClass} placeholder="Approximate count" />
              </Field>

              <div className="space-y-3">
                <label className={labelClass}>Services Needed</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SERVICES.map((service) => {
                    const checked = formData.servicesNeeded.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs transition-all ${
                          checked ? 'border-brand-gold bg-brand-gold/10 text-white' : 'border-white/5 bg-black/30 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? 'border-brand-gold bg-brand-gold text-black' : 'border-white/15'}`}>
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Special Requirements">
                <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows="4" className={`${inputClass} resize-none leading-6`} placeholder="Drone timing, extra album, rituals, song requests, venue notes..." />
              </Field>

              <Field label="How did you hear about us?">
                <select name="referralSource" value={formData.referralSource} onChange={handleChange} className={inputClass}>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </Field>
            </FormSection>

            <FormSection number="4" title="Confirmation">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 text-xs leading-6 text-gray-400">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-brand-gold"
                />
                <span>I agree to the terms and conditions and understand that the booking is confirmed only after Snaplica reviews availability.</span>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.01] hover:bg-[#20ba59] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp Us
                    </>
                  )}
                </button>
                <a
                  href="tel:+919494387387"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.01] hover:bg-blue-700"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </div>
            </FormSection>
          </form>
        </div>
      </section>
    </div>
  );
};

const FormSection = ({ number, title, children }) => (
  <section className="space-y-5">
    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-black">
        {number}
      </span>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const inputClass =
  'w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white outline-none transition-colors focus:border-brand-gold';

const labelClass = 'text-[10px] font-semibold uppercase tracking-wider text-gray-500';

export default Booking;
