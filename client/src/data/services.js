export const SERVICES = [
  {
    id: "wedding",
    title: "Wedding Photography",
    shortTitle: "Wedding",
    image: "/services/wedding.jpg",
    summary: "Traditional, candid, cinematic, and family coverage for wedding celebrations.",
  },
  {
    id: "pre-wedding",
    title: "Pre-Wedding Shoots",
    shortTitle: "Pre-Wedding",
    image: "/services/pre-wedding.jpg",
    summary: "Outdoor, studio, and story-led couple portraits before the wedding day.",
  },
  {
    id: "maternity",
    title: "Maternity Shoots",
    shortTitle: "Maternity",
    image: "/services/maternity.jpg",
    summary: "Soft, elegant pregnancy portraits with careful posing and lighting.",
  },
  {
    id: "birthday",
    title: "Birthday Photography",
    shortTitle: "Birthday",
    image: "/services/birthday.jpg",
    summary: "Celebration coverage for kids, families, milestone parties, and stage moments.",
  },
  {
    id: "baby-shower",
    title: "Baby Shower Photography",
    shortTitle: "Baby Shower",
    image: "/services/baby-shower.jpg",
    summary: "Warm family coverage for baby shower rituals, decor, and candid emotions.",
  },
  {
    id: "housewarming",
    title: "Housewarming Photography",
    shortTitle: "Housewarming",
    image: "/services/housewarming.jpg",
    summary: "Pooja, family portraits, decor, and documentary coverage for new homes.",
  },
  {
    id: "corporate",
    title: "Corporate Events",
    shortTitle: "Corporate",
    image: "/services/corporate.jpg",
    summary: "Conferences, launches, award nights, team portraits, and brand events.",
  },
  {
    id: "product",
    title: "Product Photography",
    shortTitle: "Product",
    image: "/services/product.jpg",
    summary: "Clean catalog, ecommerce, lifestyle, and social content for products.",
  },
  {
    id: "model",
    title: "Model Portfolio Shoots",
    shortTitle: "Model",
    image: "/services/model.jpg",
    summary: "Portfolio portraits, fashion looks, headshots, and social profile content.",
  },
  {
    id: "drone",
    title: "Drone Coverage",
    shortTitle: "Drone",
    image: "/services/drone.jpg",
    summary: "Aerial views for venues, entries, outdoor rituals, estates, and events.",
  },
  {
    id: "reels",
    title: "Reels and Shorts",
    shortTitle: "Reels",
    image: "/services/reels.jpg",
    summary: "Fast vertical videos for Instagram, announcements, launches, and highlights.",
  },
  {
    id: "events",
    title: "Event Coverage",
    shortTitle: "Events",
    image: "/services/events.jpg",
    summary: "Reliable photo and video coverage for private, cultural, and public events.",
  },
];

export const SERVICE_LABELS = SERVICES.reduce((acc, service) => {
  acc[service.id] = service.title;
  return acc;
}, {});

export const getServiceById = (id) => SERVICES.find((service) => service.id === id);
