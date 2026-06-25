import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Camera, Loader2, X } from "lucide-react";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import GoogleDriveNotice from "../components/GoogleDriveNotice";
import { db } from "../firebase";

const PAGE_SIZE = 24;
const timestampValue = (value) => value?.toMillis?.() || Date.parse(value || 0) || 0;

export const Portfolio = () => {
  const [gallery, setGallery] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), where("showInPublic", "==", true)),
      (snap) => {
        setGallery(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (err) => {
        console.warn("Portfolio gallery fetch failed:", err);
        setGallery([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const sortedGallery = useMemo(
    () => [...gallery].sort((a, b) => timestampValue(b.uploadedAt || b.createdAt) - timestampValue(a.uploadedAt || a.createdAt)),
    [gallery],
  );
  const visiblePhotos = sortedGallery.slice(0, visibleCount);
  const canLoadMore = visibleCount < sortedGallery.length;

  return (
    <div className="overflow-hidden bg-brand-dark pb-0">
      <SEOHead
        title="Portfolio"
        description="Browse all public Snaplica Photography gallery photos in one continuous masonry portfolio."
      />

      <HeroSection pageId="portfolio" />

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading photos</span>
          </div>
        ) : visiblePhotos.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-white/10 bg-black/25 p-12 text-center">
            <Camera className="mx-auto mb-4 h-10 w-10 text-brand-gold" />
            <p className="text-sm text-gray-500">Public gallery photos will appear here once they are enabled from Gallery Assets.</p>
          </div>
        ) : (
          <>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {visiblePhotos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxPhoto(item)}
                  className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-[8px] border border-white/10 bg-brand-card p-0 text-left"
                >
                  <img src={item.imageUrl || item.url} alt={item.description || "Snaplica portfolio photo"} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {item.description && (
                    <span className="absolute inset-x-0 bottom-0 translate-y-full bg-black/78 p-4 text-sm leading-6 text-white transition-transform duration-300 group-hover:translate-y-0">
                      {item.description}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {canLoadMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded-full border border-brand-gold/40 px-7 py-4 text-xs font-bold uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-black"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <GoogleDriveNotice />

      {lightboxPhoto && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxPhoto(null)}>
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-[88vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={lightboxPhoto.imageUrl || lightboxPhoto.url} alt={lightboxPhoto.description || "Snaplica portfolio photo"} className="max-h-[78vh] w-full rounded-[8px] object-contain" />
            {lightboxPhoto.description && (
              <figcaption className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-gray-300">
                {lightboxPhoto.description}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
