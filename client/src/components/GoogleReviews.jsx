import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Star } from "lucide-react";
import { db } from "../firebase";

const fallbackReviews = [
  {
    id: "fallback-1",
    name: "Rahul & Harini",
    rating: 5,
    text: "Snaplica captured our wedding with warmth, patience, and beautiful candid timing.",
    eventType: "Wedding",
  },
  {
    id: "fallback-2",
    name: "Anjali Devi",
    rating: 5,
    text: "The team handled our family event professionally and delivered images everyone loved.",
    eventType: "Birthday",
  },
  {
    id: "fallback-3",
    name: "Suresh Kumar",
    rating: 5,
    text: "Reliable, punctual, and polished coverage for our company event in Vijayawada.",
    eventType: "Corporate",
  },
];

export default function GoogleReviews({ dark = false }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "reviews"), where("showOnSite", "==", true), orderBy("date", "desc")),
      (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error("Reviews listener failed:", err);
        setReviews([]);
      },
    );
    return unsub;
  }, []);

  const visible = useMemo(() => (reviews.length ? reviews : fallbackReviews).slice(0, 6), [reviews]);

  return (
    <section className={dark ? "border-y border-white/5 bg-brand-card/20 py-24" : "bg-[#faf9f6] py-24"}>
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Google Reviews
          </span>
          <h2 className={`font-serif text-3xl font-bold md:text-5xl ${dark ? "text-white" : "text-[#111]"}`}>
            Client Love
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-sm leading-7 ${dark ? "text-gray-500" : "text-gray-600"}`}>
            Manual review highlights from the Snaplica client book.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {visible.map((review) => (
            <article
              key={review.id}
              className={dark ? "rounded-2xl border border-white/5 bg-black/25 p-6" : "rounded-2xl border border-black/5 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"}
            >
              <div className="mb-3 flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Number(review.rating || 5) ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <p className={`mb-5 text-sm leading-7 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                "{review.text}"
              </p>
              <div className="flex items-center gap-3">
                {review.photoUrl ? (
                  <img src={review.photoUrl} alt={review.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold">
                    {(review.name || "S").slice(0, 1)}
                  </div>
                )}
                <div>
                  <p className={`text-sm font-bold ${dark ? "text-white" : "text-[#111]"}`}>{review.name}</p>
                  <p className="text-xs text-gray-500">{review.eventType || "Snaplica Client"}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
