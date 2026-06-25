export const DEFAULT_SERVICES = [
  {
    id: "engagement",
    label: "Engagement",
    title: "Engagement",
    shortTitle: "Engagement",
    description: "Elegant coverage for ring ceremonies, couple portraits, family blessings, decor details, and candid celebration moments.",
    summary: "Elegant ring ceremony, couple portrait, family, and decor coverage.",
    icon: "\u{1F48D}",
    image: "",
    imageUrl: "",
    active: true,
    order: 1,
    keywords: ["engagement", "ring", "ring ceremony", "proposal"],
  },
  {
    id: "dhoti",
    label: "Dhoti",
    title: "Dhoti",
    shortTitle: "Dhoti",
    description: "Traditional dhoti ceremony coverage with family portraits, rituals, stage moments, and warm documentary storytelling.",
    summary: "Traditional dhoti ceremony rituals, family portraits, and stage coverage.",
    icon: "\u{1F9E3}",
    image: "",
    imageUrl: "",
    active: true,
    order: 2,
    keywords: ["dhoti", "dhoti ceremony", "traditional ceremony"],
  },
  {
    id: "halfsaree",
    label: "Half Saree",
    title: "Half Saree",
    shortTitle: "Half Saree",
    description: "Half saree ceremony photography focused on rituals, portraits, family emotions, decor, and joyful candid moments.",
    summary: "Half saree rituals, portraits, family emotions, and celebration coverage.",
    icon: "\u{1F97B}",
    image: "",
    imageUrl: "",
    active: true,
    order: 3,
    keywords: ["half saree", "halfsaree", "saree ceremony", "langa voni"],
  },
  {
    id: "birthday",
    label: "Birthday",
    title: "Birthday",
    shortTitle: "Birthday",
    description: "Birthday coverage for kids, families, milestone parties, decor, cake moments, stage entries, and candid celebration frames.",
    summary: "Birthday decor, cake moments, portraits, family, and candid celebration coverage.",
    icon: "\u{1F382}",
    image: "/services/birthday.jpg",
    imageUrl: "/services/birthday.jpg",
    active: true,
    order: 4,
    keywords: ["birthday", "birthday party", "cake smash", "milestone"],
  },
  {
    id: "wedding",
    label: "Wedding",
    title: "Wedding",
    shortTitle: "Wedding",
    description: "Complete wedding photography for rituals, candid emotions, couple portraits, family moments, decor, and traditional coverage.",
    summary: "Complete wedding rituals, candid emotions, portraits, and family coverage.",
    icon: "\u{1F490}",
    image: "/services/wedding.jpg",
    imageUrl: "/services/wedding.jpg",
    active: true,
    order: 5,
    keywords: ["wedding", "marriage", "muhurtham", "reception"],
  },
  {
    id: "pre-post-wedding",
    label: "Pre/Post Wedding",
    title: "Pre/Post Wedding",
    shortTitle: "Pre/Post",
    description: "Story-led couple shoots before or after the wedding with outdoor, studio, cinematic, and editorial portrait styling.",
    summary: "Story-led couple portraits before or after the wedding day.",
    icon: "\u{1F491}",
    image: "/services/pre-wedding.jpg",
    imageUrl: "/services/pre-wedding.jpg",
    active: true,
    order: 6,
    keywords: ["pre wedding", "pre-wedding", "post wedding", "post-wedding", "couple shoot"],
  },
  {
    id: "anniversary-event",
    label: "Anniversary Event",
    title: "Anniversary Event",
    shortTitle: "Anniversary",
    description: "Anniversary event coverage for couple portraits, family moments, stage celebrations, decor, and candid memories.",
    summary: "Anniversary portraits, family, decor, stage, and candid celebration coverage.",
    icon: "\u{1F49B}",
    image: "",
    imageUrl: "",
    active: true,
    order: 7,
    keywords: ["anniversary", "anniversary event", "wedding anniversary"],
  },
  {
    id: "retirement-event",
    label: "Retirement Event",
    title: "Retirement Event",
    shortTitle: "Retirement",
    description: "Respectful retirement event coverage for speeches, honors, colleague moments, family portraits, and venue details.",
    summary: "Retirement speeches, honors, colleague moments, and family portraits.",
    icon: "\u{1F3C5}",
    image: "",
    imageUrl: "",
    active: true,
    order: 8,
    keywords: ["retirement", "retirement event", "farewell"],
  },
  {
    id: "maternity",
    label: "Maternity",
    title: "Maternity",
    shortTitle: "Maternity",
    description: "Soft maternity portraits with careful posing, lighting, styling support, family frames, and warm emotional detail.",
    summary: "Soft maternity portraits with careful posing, lighting, and family frames.",
    icon: "\u{1F930}",
    image: "/services/maternity.jpg",
    imageUrl: "/services/maternity.jpg",
    active: true,
    order: 9,
    keywords: ["maternity", "pregnancy", "baby bump", "mom to be"],
  },
  {
    id: "graduation-ceremony",
    label: "Graduation Ceremony",
    title: "Graduation Ceremony",
    shortTitle: "Graduation",
    description: "Graduation ceremony photography for stage moments, certificates, portraits, family pride, groups, and campus memories.",
    summary: "Graduation stage moments, certificates, portraits, groups, and family pride.",
    icon: "\u{1F393}",
    image: "",
    imageUrl: "",
    active: true,
    order: 10,
    keywords: ["graduation", "graduation ceremony", "convocation"],
  },
  {
    id: "corporate-event",
    label: "Corporate Event",
    title: "Corporate Event",
    shortTitle: "Corporate",
    description: "Corporate event coverage for conferences, launches, award nights, team moments, brand activations, and professional portraits.",
    summary: "Conferences, launches, awards, team moments, and brand event coverage.",
    icon: "\u{1F4BC}",
    image: "/services/corporate.jpg",
    imageUrl: "/services/corporate.jpg",
    active: true,
    order: 11,
    keywords: ["corporate", "corporate event", "conference", "launch", "award night"],
  },
  {
    id: "jewellery-ads",
    label: "Jewellery Ads",
    title: "Jewellery Ads",
    shortTitle: "Jewellery",
    description: "Jewellery ad photography with clean product detail, model-led visuals, campaign framing, and polished brand presentation.",
    summary: "Jewellery product detail, campaign, model-led, and brand ad photography.",
    icon: "\u{1F48E}",
    image: "/services/product.jpg",
    imageUrl: "/services/product.jpg",
    active: true,
    order: 12,
    keywords: ["jewellery", "jewelry", "jewellery ads", "jewellery ad", "ornaments"],
  },
];

export const SERVICES = DEFAULT_SERVICES;

export const SERVICE_ALIASES = {
  "pre-wedding": "pre-post-wedding",
  "pre-wedding-shoots": "pre-post-wedding",
  prewedding: "pre-post-wedding",
  "post-wedding": "pre-post-wedding",
  postwedding: "pre-post-wedding",
  "pre-post": "pre-post-wedding",
  prepostwedding: "pre-post-wedding",
  "pre-post-wedding": "pre-post-wedding",
  "pre/post-wedding": "pre-post-wedding",
  "pre/post wedding": "pre-post-wedding",
  "half-saree": "halfsaree",
  "half saree": "halfsaree",
  halfsaree: "halfsaree",
  "wedding-photography": "wedding",
  "maternity-shoots": "maternity",
  "birthday-photography": "birthday",
  "baby-shower-photography": "birthday",
  "housewarming-photography": "anniversary-event",
  "corporate-events": "corporate-event",
  corporate: "corporate-event",
  "corporate-event": "corporate-event",
  "anniversary": "anniversary-event",
  "retirement": "retirement-event",
  "graduation": "graduation-ceremony",
  "jewellery": "jewellery-ads",
  "jewelry": "jewellery-ads",
  "product": "jewellery-ads",
  "product-shoot": "jewellery-ads",
  "product-photography": "jewellery-ads",
  "model-portfolio-shoots": "jewellery-ads",
  "drone-coverage": "wedding",
  "reels-and-shorts": "pre-post-wedding",
  "event-coverage": "corporate-event",
  "baby-shower": "birthday",
  housewarming: "anniversary-event",
  events: "corporate-event",
  reels: "pre-post-wedding",
  drone: "wedding",
  model: "jewellery-ads",
};

export const toServiceSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/^-|-$/g, "");

export const normalizeServiceId = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const slug = toServiceSlug(raw);
  return SERVICE_ALIASES[raw.toLowerCase()] || SERVICE_ALIASES[slug] || slug;
};

export const getServiceById = (value) => {
  const normalized = normalizeServiceId(value);
  return SERVICES.find((service) => service.id === normalized);
};

export const SERVICE_LABELS = SERVICES.reduce((acc, service) => {
  acc[service.id] = service.label;
  acc[service.title] = service.label;
  return acc;
}, {});

export const mergeServiceWithDefault = (service = {}) => {
  const fallback = getServiceById(service.id) || {};
  const merged = {
    ...fallback,
    ...service,
  };
  const label = merged.label || merged.title || fallback.label || "Service";
  return {
    ...merged,
    id: merged.id || fallback.id,
    label,
    title: label,
    shortTitle: merged.shortTitle || label,
    description: merged.description || merged.summary || fallback.description || "",
    summary: merged.summary || merged.description || fallback.summary || "",
    imageUrl: merged.imageUrl || merged.photoUrl || merged.image || fallback.imageUrl || fallback.image || "",
    image: merged.image || merged.imageUrl || merged.photoUrl || fallback.image || "",
    icon: merged.icon || fallback.icon || "\u{1F4F7}",
    active: merged.active !== false,
    order: Number(merged.order || fallback.order || 999),
  };
};

export const sortServicesByOrder = (services = []) =>
  [...services].map(mergeServiceWithDefault).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
