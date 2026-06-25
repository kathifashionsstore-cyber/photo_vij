import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { ArrowLeft, CalendarPlus, MessageCircle, Phone } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { db } from "../firebase";
import { getServiceById, mergeServiceWithDefault } from "../data/services";

const BookingForm = lazy(() => import("../components/BookingForm"));

const timestampValue = (value) => value?.toMillis?.() || Date.parse(value || 0) || 0;

const BookingFormFallback = () => (
  <div className="glass-card min-h-[520px] rounded-[8px] border border-white/10 p-5 md:p-7">
    <div className="h-3 w-28 rounded-full bg-brand-gold/30" />
    <div className="mt-4 h-8 w-3/4 rounded bg-white/10" />
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-12 rounded-[8px] bg-white/[0.06]" />
      ))}
    </div>
  </div>
);

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const fallbackService = getServiceById(serviceId);
  const [remoteService, setRemoteService] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    if (!fallbackService?.id) return undefined;
    const unsubscribe = onSnapshot(
      doc(db, "services", fallbackService.id),
      (snap) => setRemoteService(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => {
        console.warn("Service content fetch failed:", err);
        setRemoteService(null);
      },
    );
    return unsubscribe;
  }, [fallbackService?.id]);

  useEffect(() => {
    if (!fallbackService?.id) return undefined;
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), where("category", "==", fallbackService.id), where("showInPublic", "==", true)),
      (snap) => setGallery(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => {
        console.warn("Service gallery fetch failed:", err);
        setGallery([]);
      },
    );

    return unsubscribe;
  }, [fallbackService?.id]);

  const service = useMemo(
    () => (fallbackService ? mergeServiceWithDefault({ ...fallbackService, ...remoteService }) : null),
    [fallbackService, remoteService],
  );

  const photos = useMemo(
    () => [...gallery].sort((a, b) => timestampValue(b.uploadedAt || b.createdAt) - timestampValue(a.uploadedAt || a.createdAt)),
    [gallery],
  );

  if (!fallbackService || !service) return <Navigate to="/services" replace />;

  const heroPhoto = photos[0]?.imageUrl || photos[0]?.url || service.imageUrl || service.image || "";
  const description = service.description || service.summary;

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      <SEOHead title={service.label} description={description} />

      <section className="relative min-h-[500px] overflow-hidden">
        {heroPhoto ? (
          <img src={heroPhoto} alt={service.label} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#09090b] text-7xl">{service.icon}</div>
        )}
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl flex-col justify-end px-6 py-14 md:px-12">
          <Link to="/services" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
            <ArrowLeft className="h-4 w-4" />
            Services
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Service Detail</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white md:text-6xl">{service.label}</h1>
          {description && <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-300">{description}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#service-booking" className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
              <CalendarPlus className="h-4 w-4" />
              Book This Service
            </a>
            <a href="https://wa.me/919494387387" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a href="tel:+919494387387" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Gallery</span>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">{service.label} Photos</h2>
          </div>
          <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-gray-500">{photos.length} public photos</span>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-white/10 bg-black/25 p-10 text-center text-sm text-gray-500">
            Public photos for this service will appear here once the gallery is updated.
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {photos.map((photo) => (
              <figure key={photo.id} className="group relative mb-5 break-inside-avoid overflow-hidden rounded-[8px] border border-white/10 bg-brand-card">
                <img src={photo.imageUrl || photo.url} alt={photo.description || service.label} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {photo.description && (
                  <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/78 p-4 text-sm leading-6 text-white transition-transform duration-300 group-hover:translate-y-0">
                    {photo.description}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>

      <section id="service-booking" className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-12">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Inquiry</span>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Send a {service.label} booking request.</h2>
          <p className="mt-5 text-sm leading-8 text-gray-400">
            The form is pre-filled with this service type. Snaplica will verify date availability before scheduling.
          </p>
        </div>
        <Suspense fallback={<BookingFormFallback />}>
          <BookingForm defaultServiceId={service.id} source={`service_${service.id}`} />
        </Suspense>
      </section>
    </div>
  );
}
