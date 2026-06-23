import { useMemo, useState } from "react";
import { addDoc, collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { CalendarCheck, Download, MessageCircle, Phone, Send } from "lucide-react";
import { jsPDF } from "jspdf";
import { db } from "../firebase";
import { SERVICES, getServiceById } from "../data/services";
import { normalizePhone } from "../utils/whatsapp";

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const fallbackBookingRef = () => `SNP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const generateBookingRef = async () => {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", `bookings-${year}`);

  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      const nextNumber = (snap.exists() ? Number(snap.data().lastNumber || 0) : 0) + 1;
      transaction.set(counterRef, { year, lastNumber: nextNumber, updatedAt: serverTimestamp() }, { merge: true });
      return `SNP-${year}-${String(nextNumber).padStart(3, "0")}`;
    });
  } catch (err) {
    console.warn("Booking counter unavailable, using fallback reference:", err);
    return fallbackBookingRef();
  }
};

const initialForm = (defaultServiceId) => ({
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  serviceType: getServiceById(defaultServiceId)?.id || "wedding",
  eventDate: "",
  eventTime: "",
  venue: "",
  guestCount: "",
  notes: "",
});

const downloadReceipt = (booking) => {
  const service = getServiceById(booking.serviceType)?.title || booking.serviceType;
  const docPdf = new jsPDF();

  docPdf.setFillColor(10, 10, 10);
  docPdf.rect(0, 0, 210, 297, "F");
  docPdf.setTextColor(201, 162, 39);
  docPdf.setFont("helvetica", "bold");
  docPdf.setFontSize(22);
  docPdf.text("SNAPLICA PHOTOGRAPHY", 105, 28, { align: "center" });
  docPdf.setFontSize(12);
  docPdf.text("Booking Request Receipt", 105, 38, { align: "center" });

  docPdf.setDrawColor(201, 162, 39);
  docPdf.roundedRect(18, 52, 174, 172, 4, 4);
  docPdf.setFont("helvetica", "normal");
  docPdf.setTextColor(255, 255, 255);
  docPdf.setFontSize(11);

  const rows = [
    ["Booking Ref", booking.bookingRef],
    ["Client", booking.clientName],
    ["Phone", `+91 ${booking.clientPhone}`],
    ["Email", booking.clientEmail || "-"],
    ["Service Type", service],
    ["Event Date", booking.eventDate || "-"],
    ["Event Time", booking.eventTime || "-"],
    ["Venue", booking.venue || "-"],
    ["Guests", booking.guestCount || "-"],
    ["Status", "Pending admin verification"],
  ];

  rows.forEach(([label, value], index) => {
    const y = 68 + index * 13;
    docPdf.setTextColor(201, 162, 39);
    docPdf.text(label, 28, y);
    docPdf.setTextColor(255, 255, 255);
    docPdf.text(String(value), 82, y);
  });

  if (booking.notes) {
    docPdf.setTextColor(201, 162, 39);
    docPdf.text("Notes", 28, 202);
    docPdf.setTextColor(255, 255, 255);
    docPdf.text(docPdf.splitTextToSize(booking.notes, 110), 82, 202);
  }

  docPdf.setFontSize(9);
  docPdf.setTextColor(150, 150, 150);
  docPdf.text("Snaplica will confirm availability after admin verification.", 105, 248, { align: "center" });
  docPdf.text("Call / WhatsApp: +91 94943 87387", 105, 256, { align: "center" });
  docPdf.save(`${booking.bookingRef}-snaplica-receipt.pdf`);
};

const adminWhatsAppUrl = (booking) => {
  const service = getServiceById(booking.serviceType)?.title || booking.serviceType;
  const message = [
    "*NEW SNAPLICA BOOKING REQUEST*",
    "",
    `Ref: ${booking.bookingRef}`,
    `Client: ${booking.clientName}`,
    `Phone: +91 ${booking.clientPhone}`,
    booking.clientEmail ? `Email: ${booking.clientEmail}` : "",
    `Service Type: ${service}`,
    `Date: ${booking.eventDate || "-"}`,
    `Time: ${booking.eventTime || "-"}`,
    `Venue: ${booking.venue || "-"}`,
    booking.guestCount ? `Guests: ${booking.guestCount}` : "",
    booking.notes ? `Notes: ${booking.notes}` : "",
    "",
    "Please verify and schedule this booking from the admin panel.",
  ].filter(Boolean).join("\n");

  return `https://wa.me/919494387387?text=${encodeURIComponent(message)}`;
};

export default function BookingForm({ defaultServiceId = "wedding", source = "website", onSuccess }) {
  const [form, setForm] = useState(() => initialForm(defaultServiceId));
  const [submitting, setSubmitting] = useState(false);
  const [lastRef, setLastRef] = useState("");
  const [error, setError] = useState("");
  const selectedService = useMemo(() => getServiceById(form.serviceType), [form.serviceType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const bookingRef = await generateBookingRef();
      const clientPhone = normalizePhone(form.clientPhone);
      const bookingPayload = {
        ...form,
        bookingRef,
        clientPhone,
        phone: clientPhone,
        name: form.clientName,
        email: form.clientEmail,
        eventType: form.serviceType,
        venueAddress: form.venue,
        verified: false,
        status: "pending",
        priority: "normal",
        source,
        bookingSource: source,
        lastAction: "Booking request submitted",
        receiptGenerated: true,
        statusHistory: [{ status: "pending", label: "Booking request submitted", at: new Date().toISOString() }],
        auditLog: [{ action: "BOOKING_REQUEST_CREATED", at: new Date().toISOString() }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const bookingDoc = await addDoc(collection(db, "bookings"), bookingPayload);
      const savedBooking = { ...bookingPayload, id: bookingDoc.id };

      addDoc(collection(db, "leads"), {
        bookingId: bookingDoc.id,
        bookingRef,
        sourceCollection: "bookings",
        clientName: form.clientName,
        phone: clientPhone,
        clientPhone,
        email: form.clientEmail,
        clientEmail: form.clientEmail,
        eventType: form.serviceType,
        serviceType: form.serviceType,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        venue: form.venue,
        status: "pending",
        notes: form.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => console.warn("Lead mirror skipped:", err));

      downloadReceipt(savedBooking);
      window.open(adminWhatsAppUrl(savedBooking), "_blank");
      setLastRef(bookingRef);
      setForm(initialForm(defaultServiceId));
      onSuccess?.(savedBooking);
    } catch (err) {
      console.error("Booking submission failed:", err);
      setError("Booking could not be saved. Please call or WhatsApp Snaplica directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[8px] border border-white/10 p-5 md:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Booking Form</p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Tell us what to capture.</h2>
        </div>
        <CalendarCheck className="hidden h-9 w-9 text-brand-gold sm:block" />
      </div>

      {error && <div className="mb-5 rounded-[8px] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}
      {lastRef && (
        <div className="mb-5 rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          Saved successfully. Reference: <span className="font-mono font-bold">{lastRef}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full Name">
          <input required name="clientName" value={form.clientName} onChange={handleChange} className={inputClass} placeholder="Client name" />
        </Field>
        <Field label="Phone">
          <div className="flex overflow-hidden rounded-[8px] border border-white/10 bg-black/40 focus-within:border-brand-gold">
            <span className="flex items-center border-r border-white/10 px-3 text-xs font-bold text-brand-gold">+91</span>
            <input required name="clientPhone" value={form.clientPhone} onChange={handleChange} className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none" placeholder="9494387387" />
          </div>
        </Field>
        <Field label="Email">
          <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleChange} className={inputClass} placeholder="client@email.com" />
        </Field>
        <Field label="Service Type">
          <select required name="serviceType" value={form.serviceType} onChange={handleChange} className={inputClass}>
            {SERVICES.map((service) => (
              <option key={service.id} value={service.id}>{service.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Event Date">
          <input required type="date" min={todayInputValue()} name="eventDate" value={form.eventDate} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Event Time">
          <input type="time" name="eventTime" value={form.eventTime} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Venue">
          <input required name="venue" value={form.venue} onChange={handleChange} className={inputClass} placeholder="Venue or address" />
        </Field>
        <Field label="Guest Count">
          <input type="number" min="1" name="guestCount" value={form.guestCount} onChange={handleChange} className={inputClass} placeholder="Approximate" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes">
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className={`${inputClass} resize-none leading-6`} placeholder={`Anything important for ${selectedService?.shortTitle || "the shoot"}`} />
          </Field>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500 disabled:opacity-60"
        >
          {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : <Send className="h-4 w-4" />}
          Submit Booking
        </button>
        <a href="https://wa.me/919494387387" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <a href="tel:+919494387387" className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
          <Phone className="h-4 w-4" />
          Call
        </a>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
        <Download className="h-3.5 w-3.5 text-brand-gold" />
        Receipt PDF downloads after submission.
      </div>
    </form>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
  </label>
);

const inputClass =
  "w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-gold";
