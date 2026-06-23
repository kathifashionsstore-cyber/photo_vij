import React, { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  Paintbrush,
  Save,
  Settings,
  Upload,
} from "lucide-react";

const IMGBB_KEY = "106aa1744e58f8a5770cb8b1dee136ad";

const HERO_PAGES = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
  { id: "booking", label: "Booking" },
];

const HERO_DEFAULTS = {
  home: {
    heading: "Capturing Moments That Last Forever",
    subheading: "Award-winning wedding and event photography across Vijayawada and Andhra Pradesh.",
    cta1Text: "Book Your Shoot",
    cta1Url: "/booking",
    cta2Text: "View Portfolio",
    cta2Url: "/portfolio",
  },
  about: {
    heading: "Our Story - Passion Meets Perfection",
    subheading: "Meet Sonu and the crew behind Snaplica's cinematic wedding and event coverage.",
    cta1Text: "Meet the Team",
    cta1Url: "/about",
    cta2Text: "Book Now",
    cta2Url: "/booking",
  },
  services: {
    heading: "Photography Services for Every Occasion",
    subheading: "Wedding, pre-wedding, birthday, corporate, product, portrait, and cinematic coverage.",
    cta1Text: "Explore Services",
    cta1Url: "/services",
    cta2Text: "Book Now",
    cta2Url: "/booking",
  },
  portfolio: {
    heading: "Our Work Speaks for Itself",
    subheading: "Browse candid, traditional, cinematic, and event stories crafted by Snaplica.",
    cta1Text: "Book Similar Shoot",
    cta1Url: "/booking",
    cta2Text: "Contact Studio",
    cta2Url: "/contact",
  },
  contact: {
    heading: "Let's Create Something Beautiful Together",
    subheading: "Call, WhatsApp, or visit Snaplica Photography in Vijayawada to plan your next shoot.",
    cta1Text: "Call 9494387387",
    cta1Url: "tel:9494387387",
    cta2Text: "Book Online",
    cta2Url: "/booking",
  },
  booking: {
    heading: "Book Your Dream Photo Session",
    subheading: "Share your date, venue, service type, and creative requirements with our team.",
    cta1Text: "Start Booking",
    cta1Url: "#booking-form",
    cta2Text: "View Services",
    cta2Url: "/services",
  },
};

const emptyHero = (pageId) => ({
  backgroundImageUrl:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1920",
  heading: HERO_DEFAULTS[pageId]?.heading || "",
  subheading: HERO_DEFAULTS[pageId]?.subheading || "",
  cta1Text: HERO_DEFAULTS[pageId]?.cta1Text || "",
  cta1Url: HERO_DEFAULTS[pageId]?.cta1Url || "",
  cta2Text: HERO_DEFAULTS[pageId]?.cta2Text || "",
  cta2Url: HERO_DEFAULTS[pageId]?.cta2Url || "",
  overlayOpacity: 0.58,
});

const Spinner = ({ light = false }) => (
  <div
    className={`h-4 w-4 animate-spin rounded-full border-2 ${
      light ? "border-white border-t-transparent" : "border-black border-t-transparent"
    }`}
  />
);

const fieldClass =
  "w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white outline-none transition-colors focus:border-brand-gold";

const labelClass = "text-[10px] font-semibold uppercase tracking-wider text-gray-500";

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profileForm, setProfileForm] = useState({
    studioName: "Snaplica Photography",
    phone: "9494387387",
    email: "snaplicaphotography@gmail.com",
    address: "Ibrahimpatnam, Vijayawada, Andhra Pradesh",
    currency: "INR",
  });

  const [themeForm, setThemeForm] = useState({
    colorPrimary: "#c9a227",
    colorPrimaryDark: "#a07e15",
    colorAccent: "#e8593c",
    colorBg: "#060608",
    colorSurface: "#0f0f12",
    colorText: "#ffffff",
    publicBg: "#0A0A0A",
    publicText: "#ffffff",
    fontHeading: "Playfair Display",
    fontBody: "Outfit",
    borderRadius: "12",
  });

  const [selectedHeroPage, setSelectedHeroPage] = useState("home");
  const [heroForm, setHeroForm] = useState(emptyHero("home"));
  const [uploadingHero, setUploadingHero] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const [profileSnap, themeSnap] = await Promise.all([
          getDoc(doc(db, "settings", "profile")),
          getDoc(doc(db, "settings", "theme")),
        ]);

        if (profileSnap.exists()) setProfileForm((prev) => ({ ...prev, ...profileSnap.data() }));
        if (themeSnap.exists()) setThemeForm((prev) => ({ ...prev, ...themeSnap.data() }));
      } catch (err) {
        console.error("Failed to load settings:", err);
        setErrorMsg("Failed to load settings from Firestore.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const loadHeroConfig = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const snap = await getDoc(doc(db, "heroConfig", selectedHeroPage));
        setHeroForm(snap.exists() ? { ...emptyHero(selectedHeroPage), ...snap.data() } : emptyHero(selectedHeroPage));
      } catch (err) {
        console.error("Failed to load hero config:", err);
        setHeroForm(emptyHero(selectedHeroPage));
        setErrorMsg("Failed to load this hero config.");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "hero") loadHeroConfig();
  }, [activeTab, selectedHeroPage]);

  const flashSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await setDoc(doc(db, "settings", "profile"), {
        ...profileForm,
        updatedAt: serverTimestamp(),
      });
      flashSuccess("Studio profile saved.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await setDoc(doc(db, "settings", "theme"), {
        ...themeForm,
        borderRadius: Number(themeForm.borderRadius || 12),
        updatedAt: serverTimestamp(),
      });
      flashSuccess("Theme settings saved.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save theme settings.");
    } finally {
      setLoading(false);
    }
  };

  const uploadHeroImage = async (file) => {
    if (!file) return;
    setUploadingHero(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error("ImgBB upload failed");

      setHeroForm((prev) => ({
        ...prev,
        backgroundImageUrl: json.data.url,
        thumbUrl: json.data.thumb?.url || json.data.display_url || json.data.url,
      }));
      flashSuccess("Hero image uploaded. Save the page config to publish it.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload hero image.");
    } finally {
      setUploadingHero(false);
    }
  };

  const saveHero = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await setDoc(doc(db, "heroConfig", selectedHeroPage), {
        ...heroForm,
        overlayOpacity: Number(heroForm.overlayOpacity || 0.58),
        updatedAt: serverTimestamp(),
        updatedBy: "admin",
      });
      flashSuccess(`Hero saved for ${HERO_PAGES.find((p) => p.id === selectedHeroPage)?.label}.`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save hero config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">System Settings</h1>
        <p className="mt-1 text-xs font-light text-gray-500">
          Manage studio profile, visual theme, and public page hero content.
        </p>
      </div>

      <div className="flex max-w-2xl gap-2 rounded-2xl border border-white/5 bg-black/40 p-1">
        <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={Settings}>
          Studio
        </TabButton>
        <TabButton active={activeTab === "theme"} onClick={() => setActiveTab("theme")} icon={Paintbrush}>
          Theme
        </TabButton>
        <TabButton active={activeTab === "hero"} onClick={() => setActiveTab("hero")} icon={ImageIcon}>
          Hero Manager
        </TabButton>
      </div>

      {success && (
        <div className="flex max-w-2xl items-center gap-2 rounded-xl border border-emerald-950/50 bg-emerald-950/20 p-3 text-xs text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex max-w-2xl items-center gap-2 rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === "profile" && (
        <form onSubmit={saveProfile} className="max-w-2xl space-y-5 rounded-3xl border border-white/5 bg-brand-card p-8">
          <SectionTitle icon={Settings}>Studio Profile</SectionTitle>
          <Field label="Studio Name">
            <input
              required
              className={fieldClass}
              value={profileForm.studioName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, studioName: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Contact Phone">
              <input
                required
                className={fieldClass}
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </Field>
            <Field label="Contact Email">
              <input
                required
                type="email"
                className={fieldClass}
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Physical Address">
            <input
              required
              className={fieldClass}
              value={profileForm.address}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </Field>
          <SubmitButton loading={loading}>Save Studio Profile</SubmitButton>
        </form>
      )}

      {activeTab === "theme" && (
        <form onSubmit={saveTheme} className="max-w-3xl space-y-6 rounded-3xl border border-white/5 bg-brand-card p-8">
          <SectionTitle icon={Paintbrush}>Admin & Public Color Tokens</SectionTitle>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["Primary Gold", "colorPrimary"],
              ["Gold Hover", "colorPrimaryDark"],
              ["Accent", "colorAccent"],
              ["App Background", "colorBg"],
              ["Surface", "colorSurface"],
              ["Primary Text", "colorText"],
              ["Public Background", "publicBg"],
              ["Public Text", "publicText"],
            ].map(([label, key]) => (
              <ColorField key={key} label={label} value={themeForm[key]} onChange={(value) => setThemeForm((prev) => ({ ...prev, [key]: value }))} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-5 md:grid-cols-3">
            <Field label="Heading Font">
              <input
                className={fieldClass}
                value={themeForm.fontHeading}
                onChange={(e) => setThemeForm((prev) => ({ ...prev, fontHeading: e.target.value }))}
              />
            </Field>
            <Field label="Body Font">
              <input
                className={fieldClass}
                value={themeForm.fontBody}
                onChange={(e) => setThemeForm((prev) => ({ ...prev, fontBody: e.target.value }))}
              />
            </Field>
            <Field label="Border Radius">
              <input
                type="number"
                className={fieldClass}
                value={themeForm.borderRadius}
                onChange={(e) => setThemeForm((prev) => ({ ...prev, borderRadius: e.target.value }))}
              />
            </Field>
          </div>

          <SubmitButton loading={loading}>Save Theme Configurations</SubmitButton>
        </form>
      )}

      {activeTab === "hero" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={saveHero} className="space-y-5 rounded-3xl border border-white/5 bg-brand-card p-8">
            <SectionTitle icon={ImageIcon}>Hero Manager</SectionTitle>

            <Field label="Page">
              <select
                className={fieldClass}
                value={selectedHeroPage}
                onChange={(e) => setSelectedHeroPage(e.target.value)}
              >
                {HERO_PAGES.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Background Image URL">
              <input
                className={fieldClass}
                value={heroForm.backgroundImageUrl}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, backgroundImageUrl: e.target.value }))}
              />
            </Field>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-gold/30 bg-brand-gold/5 px-4 py-4 text-xs font-bold uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold/10">
              {uploadingHero ? <Spinner light /> : <Upload className="h-4 w-4" />}
              {uploadingHero ? "Uploading..." : "Upload New Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingHero}
                onChange={(e) => uploadHeroImage(e.target.files?.[0])}
              />
            </label>

            <Field label="Heading Text">
              <input
                className={fieldClass}
                value={heroForm.heading}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, heading: e.target.value }))}
              />
            </Field>

            <Field label="Subheading">
              <textarea
                rows={3}
                className={`${fieldClass} resize-none leading-6`}
                value={heroForm.subheading}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, subheading: e.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="CTA Button 1 Text">
                <input
                  className={fieldClass}
                  value={heroForm.cta1Text}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, cta1Text: e.target.value }))}
                />
              </Field>
              <Field label="CTA Button 1 URL">
                <input
                  className={fieldClass}
                  value={heroForm.cta1Url}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, cta1Url: e.target.value }))}
                />
              </Field>
              <Field label="CTA Button 2 Text">
                <input
                  className={fieldClass}
                  value={heroForm.cta2Text}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, cta2Text: e.target.value }))}
                />
              </Field>
              <Field label="CTA Button 2 URL">
                <input
                  className={fieldClass}
                  value={heroForm.cta2Url}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, cta2Url: e.target.value }))}
                />
              </Field>
            </div>

            <Field label={`Overlay Darkness: ${Math.round(Number(heroForm.overlayOpacity || 0) * 100)}%`}>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={heroForm.overlayOpacity}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, overlayOpacity: e.target.value }))}
                className="w-full accent-brand-gold"
              />
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview Hero"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500 disabled:opacity-50"
              >
                {loading ? <Spinner /> : <Save className="h-4 w-4" />}
                Save For This Page
              </button>
            </div>
          </form>

          {showPreview && (
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-brand-card">
              <div className="relative aspect-video min-h-[320px]">
                <img src={heroForm.backgroundImageUrl} alt="Hero preview" className="h-full w-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: `rgba(10,10,10,${Number(heroForm.overlayOpacity || 0.58)})` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <span className="mb-4 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                    Preview
                  </span>
                  <h3 className="text-3xl font-bold leading-tight text-white">{heroForm.heading}</h3>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300">{heroForm.subheading}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {heroForm.cta1Text && (
                      <span className="rounded-full bg-brand-gold px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-black">
                        {heroForm.cta1Text}
                      </span>
                    )}
                    {heroForm.cta2Text && (
                      <span className="rounded-full border border-white/20 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
                        {heroForm.cta2Text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
      active ? "bg-brand-gold text-black" : "text-gray-500 hover:text-white"
    }`}
  >
    <span className="inline-flex items-center justify-center gap-1.5">
      <Icon className="h-4 w-4" />
      {children}
    </span>
  </button>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <h3 className="flex items-center gap-2 border-b border-white/5 pb-3 text-lg font-bold text-white">
    <Icon className="h-5 w-5 text-brand-gold" />
    {children}
  </h3>
);

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
    />
    <div>
      <label className="block text-xs font-semibold text-gray-400">{label}</label>
      <span className="font-mono text-[10px] text-gray-600">{value}</span>
    </div>
  </div>
);

const SubmitButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500 disabled:opacity-50"
  >
    {loading ? <Spinner /> : <Save className="h-4 w-4" />}
    {children}
  </button>
);

export default SettingsPage;
