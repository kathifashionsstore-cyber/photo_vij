import React from "react";

const WhatsAppLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const PhoneLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const InstagramLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YouTubeLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const GmailLogo = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
);

export const LeftSocialBar = () => {
  const socials = [
    { icon: <InstagramLogo />, href: "https://www.instagram.com/snaplicaofficial/", color: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: "Instagram" },
    { icon: <YouTubeLogo />, href: "https://www.youtube.com/@snaplicaphotography2462", color: "#FF0000", label: "YouTube" },
    { icon: <FacebookLogo />, href: "https://www.facebook.com/snaplicaphotography/", color: "#1877F2", label: "Facebook" },
    { icon: <GmailLogo />, href: "mailto:snaplicaphotography@gmail.com", color: "#EA4335", label: "Email" },
  ];

  return (
    <div className="fixed bottom-20 left-4 z-[9000] hidden flex-col gap-2 md:flex">
      {socials.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          title={item.label}
          className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition-transform hover:translate-x-1"
          style={{ background: item.color, boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

export const RightSocialBar = () => (
  <div className="fixed bottom-20 right-4 z-[9000] hidden flex-col gap-3 md:flex">
    <a
      href="https://wa.me/919494387387?text=Hi%20Snaplica%20Photography!%20I%20want%20to%20book%20a%20shoot."
      target="_blank"
      rel="noreferrer"
      title="WhatsApp us"
      className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366]"
      style={{ boxShadow: "0 4px 20px rgba(37,211,102,0.4)", animation: "pulseGreen 2s infinite" }}
    >
      <WhatsAppLogo />
    </a>
    <a
      href="tel:+919494387387"
      title="Call us"
      className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#007AFF]"
      style={{ boxShadow: "0 4px 20px rgba(0,122,255,0.4)" }}
    >
      <PhoneLogo />
    </a>
    <style>{`
      @keyframes pulseGreen {
        0% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
        50% { box-shadow: 0 4px 32px rgba(37,211,102,0.7), 0 0 0 8px rgba(37,211,102,0.1); }
        100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4); }
      }
    `}</style>
  </div>
);

export default function FloatingBars() {
  return (
    <>
      <LeftSocialBar />
      <RightSocialBar />
    </>
  );
}
