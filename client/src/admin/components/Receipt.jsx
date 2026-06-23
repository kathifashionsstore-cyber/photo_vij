import { useMemo, useRef } from "react";
import { getServiceById } from "../../data/services";

const fmtD = (value) => {
  if (!value) return "-";
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const row = (label, value) => (
  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 18, fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
    <span style={{ color: "#6b7280" }}>{label}</span>
    <span style={{ fontWeight: 700, color: "#111", textAlign: "right" }}>{value || "-"}</span>
  </div>
);

const serviceLabel = (booking = {}) => {
  const value = booking.serviceType || booking.eventType || "";
  const slug = String(value).trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return getServiceById(slug)?.title || value || "-";
};

export default function Receipt({ booking, onClose }) {
  const ref = useRef(null);
  const receiptNo = useMemo(() => `RCP-${Date.now().toString().slice(-6)}`, []);

  const print = () => {
    const w = window.open("", "_blank");
    if (!w || !ref.current) return;

    w.document.write(`<html><head><title>Receipt</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Georgia, serif; background: #fff; color: #111; padding: 40px; }
        @media print { body { padding: 0; } }
      </style>
      </head><body>${ref.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 0, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}>
        <div style={{ background: "#111", padding: "12px 20px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: 700 }}>Receipt Preview</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={print} style={{ padding: "8px 16px", background: "#c9a227", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Print</button>
            <button onClick={onClose} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Close</button>
          </div>
        </div>

        <div ref={ref} style={{ padding: 36, background: "#fff" }}>
          <div style={{ border: "3px double #c9a227", padding: 28, borderRadius: 8 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <img src="/logo.webp" alt="Snaplica" style={{ width: 58, height: 58, borderRadius: 16, objectFit: "contain", marginBottom: 8 }} />
              <h1 style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 800, letterSpacing: "0.12em", color: "#111", margin: "0 0 4px" }}>SNAPLICA</h1>
              <p style={{ fontSize: 11, letterSpacing: "0.25em", color: "#c9a227", textTransform: "uppercase", margin: "0 0 2px" }}>Photography - Vijayawada</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Ibrahimpatnam, Vijayawada, AP - 9494387387</p>

              <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "8px 0", margin: "16px 0" }}>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.15em", color: "#111" }}>BOOKING RECEIPT</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, color: "#6b7280" }}>
                <span>Receipt No: <strong style={{ color: "#111" }}>{receiptNo}</strong></span>
                <span>Date: <strong style={{ color: "#111" }}>{fmtD(new Date())}</strong></span>
              </div>
            </div>

            <Section title="Client Details">
              {[
                ["Name", booking.clientName],
                ["Phone", booking.phone || booking.clientPhone],
                ["Email", booking.email || booking.clientEmail || "-"],
              ].map(([label, value]) => row(label, value))}
            </Section>

            <Section title="Event Details">
              {[
                ["Service Type", serviceLabel(booking)],
                ["Event Date", fmtD(booking.eventDate)],
                ["Event Time", booking.eventTime || "-"],
                ["Venue", booking.venue || booking.venueAddress || "-"],
                ["Assigned Team", booking.assignedTeamName || "To be assigned"],
              ].map(([label, value]) => row(label, value))}
            </Section>

            {(booking.specialNotes || booking.specialRequirements) && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#92400e", textTransform: "uppercase", margin: "0 0 6px" }}>Special Requirements</p>
                <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{booking.specialNotes || booking.specialRequirements}</p>
              </div>
            )}

            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <span style={{ display: "inline-block", color: "#22c55e", border: "2px solid #22c55e", padding: "5px 20px", borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", transform: "rotate(-4deg)" }}>
                BOOKING CONFIRMED
              </span>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 14, marginTop: 14, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>Thank you for choosing Snaplica Photography.</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>snaplicaphotography@gmail.com - 9494387387</p>
              <p style={{ fontSize: 10, color: "#d1d5db", marginTop: 8 }}>Website by WayzenTech - 9398724704</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ background: "#faf9f6", borderRadius: 8, padding: 14, marginBottom: 18 }}>
    <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#c9a227", textTransform: "uppercase", margin: "0 0 10px" }}>{title}</p>
    {children}
  </div>
);
