import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Settings, Save, CheckCircle, Paintbrush, AlertCircle } from "lucide-react";

// Inline helper components
const Spinner = ({ size = 14 }) => (
  <div 
    className="border-2 border-black border-t-transparent rounded-full animate-spin"
    style={{ width: size, height: size }}
  />
);

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile"); // profile | theme
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab 1 Form: Studio Profile
  const [profileForm, setProfileForm] = useState({
    studioName: "Snaplica Photography",
    phone: "9494387387",
    email: "snaplicaphotography@gmail.com",
    address: "Ibrahimpatnam, Vijayawada, Andhra Pradesh",
    currency: "INR"
  });

  // Tab 2 Form: Theme Customizer
  const [themeForm, setThemeForm] = useState({
    colorPrimary: "#c9a227",
    colorPrimaryDark: "#a07e15",
    colorAccent: "#e8593c",
    colorBg: "#060608",
    colorSurface: "#0f0f12",
    colorBorder: "rgba(255,255,255,0.08)",
    colorText: "#ffffff",
    colorTextMuted: "rgba(255,255,255,0.45)",
    publicBg: "#ffffff",
    publicText: "#1a1a1a",
    publicPrimary: "#c9a227",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    borderRadius: "12"
  });

  // Load Settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const [profileSnap, themeSnap] = await Promise.all([
          getDoc(doc(db, "settings", "profile")),
          getDoc(doc(db, "settings", "theme"))
        ]);

        if (profileSnap.exists()) {
          setProfileForm(profileSnap.data());
        }
        if (themeSnap.exists()) {
          setThemeForm(prev => ({ ...prev, ...themeSnap.data() }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);
    try {
      await setDoc(doc(db, "settings", "profile"), profileForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save profile settings");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);
    try {
      await setDoc(doc(db, "settings", "theme"), {
        ...themeForm,
        borderRadius: Number(themeForm.borderRadius || 12)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save theme settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">System Settings</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Customize core parameters, studio profile, and public styling themes.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 bg-black/40 border border-white/5 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
            ${activeTab === "profile" ? "bg-brand-gold text-black" : "text-gray-500 hover:text-white"}`}
        >
          <Settings className="w-4 h-4" /> Studio Profile
        </button>
        <button
          onClick={() => setActiveTab("theme")}
          className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
            ${activeTab === "theme" ? "bg-brand-gold text-black" : "text-gray-500 hover:text-white"}`}
        >
          <Paintbrush className="w-4 h-4" /> Theme Customizer
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-950/50 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 max-w-2xl font-light">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Settings saved and synced to database branches!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-900/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-1.5 max-w-2xl font-light">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === "profile" ? (
        /* Tab 1: Studio Profile */
        <div className="bg-brand-card border border-white/5 rounded-3xl p-8 space-y-6 max-w-2xl shadow-xl">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-gold" /> Studio Profile Data
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-5 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-gray-500 uppercase tracking-wider font-semibold">Studio Name</label>
              <input 
                required
                type="text" 
                value={profileForm.studioName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, studioName: e.target.value }))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider font-semibold">Contact Phone</label>
                <input 
                  required
                  type="tel" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 uppercase tracking-wider font-semibold">Contact Email</label>
                <input 
                  required
                  type="email" 
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 uppercase tracking-wider font-semibold">Physical Address</label>
              <input 
                required
                type="text" 
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-gold text-black hover:bg-amber-500 disabled:opacity-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? <Spinner /> : "Save Settings"}
            </button>
          </form>
        </div>
      ) : (
        /* Tab 2: Theme Customizer */
        <div className="bg-brand-card border border-white/5 rounded-3xl p-8 space-y-6 max-w-3xl shadow-xl">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-brand-gold" /> Admin & Public Color Tokens
          </h3>

          <form onSubmit={handleThemeSubmit} className="space-y-6 text-xs font-sans">
            
            {/* Admin Theme Palette */}
            <div>
              <h4 className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-3">Admin Portal Colors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorPrimary}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorPrimary: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Primary Theme Gold</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorPrimary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorPrimaryDark}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorPrimaryDark: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Primary Gold Hover / Dark</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorPrimaryDark}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorAccent}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorAccent: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Accent Call-To-Action (Coral)</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorAccent}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorBg}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorBg: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Near-Black App Background</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorBg}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorSurface}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorSurface: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Surface / Card Container Background</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorSurface}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.colorText}
                    onChange={(e) => setThemeForm(t => ({ ...t, colorText: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Primary Text Base</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.colorText}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Public Theme Palette */}
            <div className="border-t border-white/5 pt-5">
              <h4 className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-3">Public Website Colors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.publicBg}
                    onChange={(e) => setThemeForm(t => ({ ...t, publicBg: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Public Background Base</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.publicBg}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <input 
                    type="color" 
                    value={themeForm.publicText}
                    onChange={(e) => setThemeForm(t => ({ ...t, publicText: e.target.value }))}
                    className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="text-gray-400 font-semibold block">Public Text Base</label>
                    <span className="text-[10px] text-gray-600 font-mono">{themeForm.publicText}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Typography & Geometry */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <h4 className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Typography & Geometry Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Heading Typography Font</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Playfair Display"
                    value={themeForm.fontHeading}
                    onChange={(e) => setThemeForm(t => ({ ...t, fontHeading: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Body Typography Font</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Inter"
                    value={themeForm.fontBody}
                    onChange={(e) => setThemeForm(t => ({ ...t, fontBody: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold">Containers Border Radius (px)</label>
                  <input 
                    type="number" 
                    placeholder="12"
                    value={themeForm.borderRadius}
                    onChange={(e) => setThemeForm(t => ({ ...t, borderRadius: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>

              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-gold text-black hover:bg-amber-500 disabled:opacity-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {loading ? <Spinner /> : "Save Theme Configurations"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
