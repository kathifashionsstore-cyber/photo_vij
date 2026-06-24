import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import SEOHead from "../components/SEOHead";
import { db } from "../firebase";
import { getServiceById } from "../data/services";

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const service = getServiceById(serviceId);
  const [gallery, setGallery] = useState([]);
  const [serviceContent, setServiceContent] = useState(null);

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

  useEffect(() => {
    if (!serviceId) return undefined;
    const unsubscribe = onSnapshot(
      doc(db, "serviceContent", serviceId),
      (snap) => setServiceContent(snap.exists() ? snap.data() : null),
      (err) => {
        console.warn("Service content fetch failed:", err);
        setServiceContent(null);
      },
    );
    return unsubscribe;
  }, [serviceId]);

  const latestCategoryPhoto = useMemo(
    () => gallery.find((item) => item.category === serviceId || item.serviceType === serviceId),
    [gallery, serviceId],
  );

  if (!service) return <Navigate to="/services" replace />;

  const detailPhoto = serviceContent?.photoUrl || serviceContent?.imageUrl || latestCategoryPhoto?.imageUrl || latestCategoryPhoto?.url || service.image;
  const detailDescription = serviceContent?.description || latestCategoryPhoto?.description || service.summary;

  return (
    <div className="min-h-screen bg-brand-dark pb-20">
      <SEOHead title={service.title} description={detailDescription} />

      <section className="relative min-h-[500px] overflow-hidden">
        <img src={detailPhoto} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/68" />
        <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl flex-col justify-end px-6 py-14 md:px-12">
          <Link to="/services" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
            <ArrowLeft className="h-4 w-4" />
            Services
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Service Detail</span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white md:text-6xl">{service.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-300">{detailDescription}</p>
          <Link to={`/booking?service=${service.id}`} className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500">
            <CalendarPlus className="h-4 w-4" />
            Book This Service
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="group grid overflow-hidden rounded-[8px] bg-[#0f0f12] shadow-[0_24px_80px_rgba(0,0,0,0.38)] md:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative overflow-hidden">
            <img src={detailPhoto} alt={service.title} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-brand-gold/10" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Snaplica Service</span>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-white md:text-5xl">{service.title}</h2>
            <p className="mt-6 text-base leading-8 text-gray-300">{detailDescription}</p>
            <Link to={`/booking?service=${service.id}`} className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-brand-gold/40 px-6 py-3 text-xs font-bold uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black">
              Plan This Coverage
            </Link>
          </div>
        </motion.article>
      </section>
    </div>
  );
}
