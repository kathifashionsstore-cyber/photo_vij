import { lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import SEOHead from "../components/SEOHead";
import { getServiceById } from "../data/services";

const BookingForm = lazy(() => import("../components/BookingForm"));

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

export const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service") || "wedding";
  const service = getServiceById(serviceId);

  return (
    <div className="overflow-hidden bg-brand-dark pb-24">
      <SEOHead
        title="Book A Shoot"
        description="Book engagement, wedding, birthday, maternity, corporate event, graduation, anniversary, retirement, or jewellery ad photography with Snaplica Photography Vijayawada."
      />

      <HeroSection pageId="booking" />

      <section id="booking-form" className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-12">
        <aside>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Booking Request</span>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-5xl">Share the brief. Snaplica will verify the date.</h1>
          <p className="mt-5 text-sm leading-8 text-gray-400">
            {service
              ? `${service.title} is selected. You can change the service type inside the form before submitting.`
              : "Choose the service type, date, venue, and notes before submitting."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Saved to admin bookings", "Receipt PDF download", "WhatsApp alert to studio", "Verification before scheduling"].map((item) => (
              <div key={item} className="rounded-[8px] border border-white/10 bg-brand-card/60 p-4 text-xs leading-6 text-gray-400">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <Suspense fallback={<BookingFormFallback />}>
          <BookingForm
            defaultServiceId={service?.id || "wedding"}
            source="booking_page"
            onSuccess={(booking) => navigate(`/booking/success?ref=${encodeURIComponent(booking.bookingRef)}`, { state: { bookingRef: booking.bookingRef, booking } })}
          />
        </Suspense>
      </section>
    </div>
  );
};

export default Booking;
