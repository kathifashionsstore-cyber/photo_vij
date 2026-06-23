import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { db } from "../firebase";
import { getServiceById } from "../data/services";

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const service = getServiceById(serviceId);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), where("showInPublic", "==", true)),
      (snap) => setGallery(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => {
        console.warn("Service gallery fetch failed:", err);
        setGallery([]);
      },
    );

    return unsubscribe;
  }, []);

  const images = useMemo(
    () => gallery.filter((item) => item.category === serviceId || item.serviceType === serviceId),
    [gallery, serviceId],
  );

  if (!service) return <Navigate to="/services" replace />;

  const displayImages = images.length > 0
    ? images
    : Array.from({ length: 6 }, (_, index) => ({
        id: `fallback-${index}`,
        imageUrl: service.image,
        url: service.image,
        description: `${service.title} sample ${index + 1}`,
      }));

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      <SEOHead title={service.title} description={service.summary} />

      <section className="relative min-h-[500px] overflow-hidden">
        <img src={service.image} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl flex-col justify-end px-6 py-14 md:px-12">
          <Link to="/services" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
            <ArrowLeft className="h-4 w-4" />
            Services
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Service Detail</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white md:text-6xl">{service.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-300">{service.summary}</p>
          <Link to={`/booking?service=${service.id}`} className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
            <CalendarPlus className="h-4 w-4" />
            Book This Service
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Gallery</span>
            <h2 className="mt-3 text-3xl font-bold text-white">Recent Work</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-gray-500">
            Public images appear here when they are uploaded from Admin Gallery with this service category selected.
          </p>
        </div>

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {displayImages.map((item) => (
            <figure key={item.id} className="mb-5 break-inside-avoid overflow-hidden rounded-[8px] border border-white/10 bg-brand-card">
              <img src={item.imageUrl || item.url} alt={item.description || service.title} className="w-full object-cover" />
              {item.description && <figcaption className="p-4 text-sm leading-6 text-gray-400">{item.description}</figcaption>}
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
