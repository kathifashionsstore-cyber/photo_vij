import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { ANNOUNCEMENT_BAR_HEIGHT } from "./layoutConstants";

const MANDATORY = {
  text: "Website crafted by WayzenTech - Contact 9398724704",
  href: "tel:9398724704",
  mandatory: true,
};

export default function AnnouncementTicker() {
  const [adminItems, setAdminItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "announcements"),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.active !== false && item.isActive !== false && item.text);
        setAdminItems(items);
      },
      (err) => console.error("Announcement listener failed:", err),
    );
    return unsub;
  }, []);

  const allItems = useMemo(() => [MANDATORY, ...adminItems], [adminItems]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % allItems.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, [allItems.length]);

  const current = allItems[index] || MANDATORY;
  const text = current.text || current.title || MANDATORY.text;

  const content = (
    <span
      style={{
        display: "block",
        maxWidth: "90vw",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "opacity 0.3s",
        opacity: fade ? 1 : 0,
        whiteSpace: "nowrap",
      }}
      className="text-[13px] font-semibold tracking-[0.02em]"
    >
      {text}
    </span>
  );

  return (
    <>
      <div
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, #1a1200 50%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(201,162,39,0.2)",
          color: "#c9a227",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: ANNOUNCEMENT_BAR_HEIGHT,
          left: 0,
          overflow: "hidden",
          padding: "0 16px",
          position: "fixed",
          right: 0,
          textAlign: "center",
          top: 0,
          zIndex: 10000,
        }}
      >
        {current.href ? (
          <a
            href={current.href}
            style={{
              color: "inherit",
              display: "inline-flex",
              justifyContent: "center",
              maxWidth: "90vw",
              textDecoration: "none",
            }}
          >
            {content}
          </a>
        ) : (
          content
        )}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, #c9a227, #fff8dc, #c9a227, transparent)",
            backgroundSize: "200% 100%",
            animation: "tickerShimmer 2s linear infinite",
          }}
        />
      </div>
      <div aria-hidden="true" style={{ height: ANNOUNCEMENT_BAR_HEIGHT }} />
      <style>{`
        @keyframes tickerShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
}

export { AnnouncementTicker };
