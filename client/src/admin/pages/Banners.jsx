import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../../firebase";
import { Image as ImageIcon, Upload, Trash2, Check, AlertCircle } from "lucide-react";

// Inline helper components
const Spinner = ({ size = 16 }) => (
  <div 
    className="border-2 border-black border-t-transparent rounded-full animate-spin"
    style={{ width: size, height: size }}
  />
);

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const Banners = () => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    title: "", 
    startDate: "", 
    startTime: "00:00",
    endDate: "", 
    endTime: "23:59", 
    isActive: true
  });

  const [banners, setBanners] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Subscribes to banners list
  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setBanners(list);
    });
    return unsub;
  }, []);

  // Handle file selection → show preview immediately
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    setErrorMsg("");
    
    // Show local preview immediately without uploading yet
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Upload to ImgBB and save to Firestore
  const handleSave = async () => {
    if (!imageFile) {
      setErrorMsg("Please select an image first");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setErrorMsg("Please enter both start and end dates");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Step 1: Upload to ImgBB
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const res = await fetch("https://api.imgbb.com/1/upload?key=106aa1744e58f8a5770cb8b1dee136ad", {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (!json.success) throw new Error("Upload failed");
      
      const imageUrl = json.data.url;
      const thumbUrl = json.data.thumb?.url || json.data.url;

      // Step 2: Deactivate all existing banners first (only 1 active at a time)
      if (form.isActive) {
        const existing = await getDocs(query(collection(db, "banners"), where("isActive", "==", true)));
        for (const d of existing.docs) {
          await updateDoc(d.ref, { isActive: false });
        }
      }

      // Step 3: Save banner to Firestore
      const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
      const endDateTime   = new Date(`${form.endDate}T${form.endTime}`);
      
      await addDoc(collection(db, "banners"), {
        title: form.title || "Untitled Offer",
        imageUrl,
        thumbUrl,
        startDate: Timestamp.fromDate(startDateTime),
        endDate:   Timestamp.fromDate(endDateTime),
        isActive:  form.isActive,
        createdAt: serverTimestamp()
      });

      setSuccessMsg("Banner uploaded & saved successfully!");
      setPreview(null); 
      setImageFile(null);
      setForm({ title: "", startDate: "", startTime: "00:00", endDate: "", endTime: "23:59", isActive: true });
    } catch (err) {
      setErrorMsg("Upload failed. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (bannerId, currentActive) => {
    try {
      const nextState = !currentActive;
      if (nextState) {
        // Deactivate others
        const existing = await getDocs(query(collection(db, "banners"), where("isActive", "==", true)));
        for (const d of existing.docs) {
          await updateDoc(d.ref, { isActive: false });
        }
      }
      await updateDoc(doc(db, "banners", bannerId), { isActive: nextState });
      setSuccessMsg("Banner active status updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update banner status");
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", bannerId));
      setSuccessMsg("Banner deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Festival Banners Manager</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Add, schedule, and activate popup graphics on the public site.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2 max-w-2xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2 max-w-2xl">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Form */}
        <div className="bg-[#0f0f12] border border-white/5 p-6 rounded-3xl space-y-5 shadow-2xl">
          <h3 className="text-white font-serif font-bold text-base border-b border-white/5 pb-3">
            Add New Banner Offer
          </h3>
          
          {/* Drag & Drop Image Upload */}
          <label className="block mb-4 cursor-pointer">
            <div className={`border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden
              ${preview ? "border-brand-gold/40" : "border-white/10 hover:border-brand-gold/30"}`}>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Banner preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs">Click to change image</p>
                  </div>
                  {/* Premium gold frame overlay */}
                  <div className="absolute inset-0 border-4 border-[#c9a227]/30 pointer-events-none" />
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Upload className="text-white/30" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-semibold">Drag & drop or click to upload banner</p>
                    <p className="text-white/30 text-[9px] mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Banner Offer Title</label>
            <input
              type="text"
              placeholder="e.g. Diwali Premium Shoot 20% Off"
              value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white text-xs focus:border-brand-gold"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Start Date</label>
              <input 
                type="date" 
                value={form.startDate}
                onChange={e => setForm(f => ({...f, startDate: e.target.value}))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white text-xs focus:border-brand-gold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Start Time</label>
              <input 
                type="time" 
                value={form.startTime}
                onChange={e => setForm(f => ({...f, startTime: e.target.value}))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white text-xs focus:border-brand-gold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">End Date</label>
              <input 
                type="date" 
                value={form.endDate}
                onChange={e => setForm(f => ({...f, endDate: e.target.value}))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white text-xs focus:border-brand-gold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">End Time</label>
              <input 
                type="time" 
                value={form.endTime}
                onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white text-xs focus:border-brand-gold" 
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 py-1 text-xs">
            <button 
              type="button"
              onClick={() => setForm(f => ({...f, isActive: !f.isActive}))}
              className={`w-12 h-6 rounded-full relative flex items-center p-1 transition-colors
                ${form.isActive ? 'bg-brand-gold' : 'bg-white/10'}`}
            >
              <div 
                className="w-4 h-4 bg-black rounded-full transition-transform" 
                style={{ transform: `translateX(${form.isActive ? 24 : 0}px)` }}
              />
            </button>
            <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Activate immediately</span>
          </div>

          <button
            onClick={handleSave}
            disabled={uploading || !imageFile}
            className="w-full py-4 bg-brand-gold text-black hover:bg-amber-500 disabled:opacity-45 disabled:hover:bg-brand-gold text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {uploading ? (
              <>
                <Spinner size={14} /> Uploading & Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Save Banner Offer
              </>
            )}
          </button>
        </div>

        {/* Existing Banners List */}
        <div className="bg-[#0f0f12] border border-white/5 p-6 rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-white font-serif font-bold text-base border-b border-white/5 pb-3">
            Active & Upcoming Banners ({banners.length})
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {banners.length === 0 ? (
              <p className="text-xs text-gray-500 py-12 text-center font-light">No banners registered yet.</p>
            ) : (
              banners.map((item) => (
                <div key={item.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex gap-4 items-start relative group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5">
                    <img 
                      src={item.thumbUrl || item.imageUrl} 
                      alt="Banner thumb" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = item.imageUrl; }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-serif font-bold text-sm truncate pr-4">{item.title}</h4>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-400 transition-all"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                      <p>Start: {formatDate(item.startDate)}</p>
                      <p>End: {formatDate(item.endDate)}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        className={`w-10 h-5 rounded-full relative flex items-center p-0.5 transition-colors
                          ${item.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                      >
                        <div 
                          className="w-4 h-4 bg-black rounded-full transition-transform" 
                          style={{ transform: `translateX(${item.isActive ? 20 : 0}px)` }}
                        />
                      </button>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">
                        {item.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banners;
