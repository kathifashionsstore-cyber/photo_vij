const ADMIN_PHONE = "9494387387";

export const normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length <= 10) return digits;
  return digits.endsWith(digits.slice(-10)) ? digits.slice(-10) : digits;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export const whatsappUrl = (phone, message) => {
  const normalized = normalizePhone(phone);
  return `https://wa.me/91${normalized}?text=${encodeURIComponent(message)}`;
};

const serviceList = (servicesNeeded = []) => {
  if (!Array.isArray(servicesNeeded) || servicesNeeded.length === 0) return "Not specified";
  return servicesNeeded.join(", ");
};

export const buildAdminNewBookingWhatsApp = (booking) => {
  const message = `NEW BOOKING REQUEST - SNAPLICA

Booking Ref: ${booking.bookingRef || "Pending"}

Client: ${booking.clientName || ""}
Phone: ${booking.clientPhone || booking.phone || ""}
Email: ${booking.clientEmail || booking.email || ""}
City: ${booking.clientCity || ""}

Event Type: ${booking.eventType || ""}
Date: ${formatDate(booking.eventDate)}
Time: ${booking.eventTime || ""}
Venue: ${booking.venue || booking.venueAddress || ""}
Duration: ${booking.duration || ""}

Package Interest: ${booking.packageInterest || booking.package || ""}
Services: ${serviceList(booking.servicesNeeded)}
Guests: ${booking.guestCount ? `~${booking.guestCount}` : "Not specified"}
Special Notes: ${booking.specialRequirements || booking.specialNotes || booking.comments || "None"}

Source: ${booking.referralSource || booking.source || "website_form"}

Please follow up within 24 hours.
- Snaplica Website System`;

  return whatsappUrl(ADMIN_PHONE, message);
};

export const buildClientInquiryWhatsApp = (booking) => {
  const message = `Hi ${booking.clientName || "there"}!

Thank you for your booking inquiry with Snaplica Photography.

Your Ref: ${booking.bookingRef || "Pending"}
Event: ${booking.eventType || ""}
Date: ${formatDate(booking.eventDate)}
Venue: ${booking.venue || booking.venueAddress || ""}

We have received your request and our team will contact you within 24 hours to confirm availability and discuss packages.

For urgent queries call: ${ADMIN_PHONE}

- Team Snaplica Photography
Vijayawada, Andhra Pradesh`;

  return whatsappUrl(booking.clientPhone || booking.phone, message);
};

export const buildTeamAssignmentWhatsApp = (teamLeaderPhone, booking) => {
  const venue = booking.venue || booking.venueAddress || "";
  const venueQuery = encodeURIComponent(`${venue} Vijayawada`);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${venueQuery}`;

  const message = `NEW ASSIGNMENT - SNAPLICA

Hi ${booking.teamLeaderName || "Team Leader"}!

Event: ${booking.eventType || "Photo Shoot"}
Client: ${booking.clientName || ""}
Client Phone: ${booking.clientPhone || booking.phone || ""}
Date: ${formatDate(booking.eventDate)}
Time: ${booking.eventTime || ""}
Venue: ${venue}
Package: ${booking.packageInterest || booking.package || booking.packageName || ""}
Notes: ${booking.specialRequirements || booking.specialNotes || booking.comments || "None"}

Location on Maps:
${mapsLink}

Please confirm availability by replying yes.
- Snaplica Admin`;

  return whatsappUrl(teamLeaderPhone, message);
};

export const buildPaymentReminderWhatsApp = (clientPhone, clientName, amount, eventDate) => {
  const message = `Hi ${clientName}!

This is a reminder from Snaplica Photography.

We are following up on your event scheduled for ${formatDate(eventDate)}.

Please reply with a good time to discuss the remaining booking details.

For any queries, call us at ${ADMIN_PHONE}.

Thank you.
- Team Snaplica`;

  return whatsappUrl(clientPhone, message);
};

export const buildClientConfirmationWhatsApp = (clientPhone, clientName, eventType, eventDate, venue) => {
  const message = `Hi ${clientName}!

Your ${eventType} booking with Snaplica Photography is confirmed.

Date: ${formatDate(eventDate)}
Venue: ${venue}

Our team will reach out to you 24 hours before the event with final details.

For assistance: ${ADMIN_PHONE}

Looking forward to capturing your special moments.
- Team Snaplica`;

  return whatsappUrl(clientPhone, message);
};

export const buildGalleryReadyWhatsApp = (clientPhone, clientName, galleryLink) => {
  const message = `Hi ${clientName}!

Your photo gallery from Snaplica Photography is ready.

Open your gallery:
${galleryLink}

For help: ${ADMIN_PHONE}
- Team Snaplica`;

  return whatsappUrl(clientPhone, message);
};

export const buildClientFollowUpWhatsApp = (booking) => {
  const message = `Hi ${booking.clientName || "there"}! Snaplica Photography here.

We are following up on your ${booking.eventType || "event"} inquiry for ${formatDate(booking.eventDate)}.

Your booking ref: ${booking.bookingRef || booking.id || ""}

Please let us know a good time to discuss availability and package details.
- Snaplica Photography`;

  return whatsappUrl(booking.clientPhone || booking.phone, message);
};
