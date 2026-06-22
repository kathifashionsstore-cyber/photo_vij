import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  getDocs 
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { 
  Image as ImageIcon, 
  Upload as UploadIcon, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";

// Inline helper components
const BookingSelector = ({ value, onChange }) => {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snap = await getDocs(collection(db, "bookings"));
        const list = [];
        snap.forEach(d => {
          const data = d.data();
          if (data.status !== "cancelled") {
            list.push({ id: d.id, ...data });
          }
        });
        list.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        setBookings(list);
      } catch (err) {
        console.error("Failed to load bookings selector:", err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="space-y-1.5 text-xs font-sans max-w-sm">
      <label className="text-gray-500 uppercase tracking-wider font-semibold">Select Customer Event Gallery</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none text-white focus:border-brand-gold cursor-pointer"
      >
        <option value="">-- Choose Booking --</option>
        {bookings.map(b => (
          <option key={b.id} value={b.id}>
            {b.clientName} - {b.eventType} ({b.eventDate})
          </option>
        ))}
      </select>
    </div>
  );
};

const DropZone = ({ onFiles, uploading, progress }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
    }
  };

  return (
    <label 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center py-10 cursor-pointer transition-all bg-black/20 group relative overflow-hidden text-center p-6
        ${dragActive ? "border-brand-gold bg-brand-gold/5" : "border-white/10 hover:border-brand-gold/40"}`}
    >
      {uploading ? (
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xs">
          <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider">
            Uploading Assets to CDN ({progress}%)
          </span>
          <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
            <div className="h-full bg-brand-gold" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          <UploadIcon className="w-8 h-8 text-gray-600 group-hover:text-brand-gold transition-colors mb-3" />
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Drag & Drop or Click to Upload</span>
          <span className="text-[9px] text-gray-600 mt-1">Accepts multiple images up to 10MB each</span>
        </>
      )}
      <input 
        type="file" 
        multiple
        disabled={uploading} 
        onChange={handleChange} 
        accept="image/*" 
        className="hidden" 
      />
    </label>
  );
};

const CATEGORIES = ["Wedding", "Pre-Wedding", "Birthday", "Corporate", "Events", "BTS"];

export const Gallery = () => {
  const [bookingId, setBookingId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [publicMeta, setPublicMeta] = useState({
    description: "",
    category: "Wedding",
    showInPublic: true,
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // REAL-TIME subscription to gallery photos
  useEffect(() => {
    if (!bookingId) {
      setPhotos([]);
      return;
    }
    const unsub = onSnapshot(
      query(
        collection(db, "galleries", bookingId, "photos"),
        orderBy("uploadedAt", "desc")
      ),
      (snap) => {
        setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Gallery real-time query error:", err);
      }
    );
    return unsub; // cleanup on unmount
  }, [bookingId]);

  const uploadFiles = async (files) => {
    if (!bookingId) return;
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    const fileArray = Array.from(files);
    let done = 0;

    for (const file of fileArray) {
      try {
        // Upload to ImgBB
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(
          "https://api.imgbb.com/1/upload?key=106aa1744e58f8a5770cb8b1dee136ad",
          { method: "POST", body: formData }
        );
        const json = await res.json();
        
        if (!json.success) {
          console.error("ImgBB failed for:", file.name);
          continue;
        }

        const photoPayload = {
          fileName: file.name,
          imageUrl: json.data.url,           // FULL resolution display URL
          thumbUrl: json.data.thumb?.url || json.data.medium?.url || json.data.url, // thumbnail
          deleteHash: json.data.delete_hash || "", // for deletion later
          size: file.size,
          type: file.type,
          status: "raw",                     // raw | selected | editing | final
          isSelected: false,
          isFavorited: false,
          isMustEdit: false,
          description: publicMeta.description,
          category: publicMeta.category,
          showInPublic: publicMeta.showInPublic,
          uploadedAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.uid || "admin"
        };

        await addDoc(collection(db, "galleries", bookingId, "photos"), photoPayload);

        if (publicMeta.showInPublic) {
          await addDoc(collection(db, "gallery"), {
            ...photoPayload,
            bookingId,
            source: "admin_gallery",
          });
        }

        done++;
        setUploadProgress(Math.round((done / fileArray.length) * 100));
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    if (done > 0) {
      setSuccessMsg(`${done} of ${fileArray.length} photos uploaded to gallery!`);
    } else {
      setErrorMsg("Failed to upload selected photos.");
    }
  };

  const deletePhoto = async (photo) => {
    if (!window.confirm("Are you sure you want to delete this photo from the gallery?")) return;
    try {
      await deleteDoc(doc(db, "galleries", bookingId, "photos", photo.id));
      setSuccessMsg("Photo deleted from gallery.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete photo error:", err);
      setErrorMsg("Failed to remove photo.");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Gallery Assets Manager</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">
          Upload photos to ImgBB CDN and organize client review galleries.
        </p>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl p-6 space-y-6 shadow-2xl max-w-4xl">
        <BookingSelector value={bookingId} onChange={setBookingId} />

        {errorMsg && (
          <div className="p-3.5 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {bookingId ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 md:grid-cols-[1fr_180px_170px]">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold uppercase tracking-wider text-gray-500">Photo description</label>
                <input
                  value={publicMeta.description}
                  onChange={(e) => setPublicMeta((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Shown on the public portfolio overlay"
                  className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-brand-gold"
                />
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold uppercase tracking-wider text-gray-500">Category</label>
                <select
                  value={publicMeta.category}
                  onChange={(e) => setPublicMeta((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-white/5 bg-black/90 px-4 py-3 text-xs text-white outline-none focus:border-brand-gold"
                >
                  {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={publicMeta.showInPublic}
                  onChange={(e) => setPublicMeta((prev) => ({ ...prev, showInPublic: e.target.checked }))}
                  className="h-4 w-4 accent-brand-gold"
                />
                Show on public website
              </label>
            </div>

            {/* Drag & Drop Upload Zone */}
            <DropZone onFiles={uploadFiles} uploading={uploading} progress={uploadProgress} />

            {/* GALLERY GRID — subscribes to real-time Firestore */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-white font-serif font-bold text-base flex items-center gap-1.5 mb-4">
                <ImageIcon className="w-4 h-4 text-brand-gold" /> Uploaded Assets ({photos.length})
              </h3>
              
              {photos.length === 0 && !uploading ? (
                <div className="text-center py-20 text-white/20 border border-dashed border-white/5 rounded-2xl">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-15" />
                  <p className="text-xs">No photos uploaded yet for this booking</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02, duration: 0.25 }}
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 shadow-md"
                    >
                      {/* Use thumbUrl for grid display (fast loading) */}
                      <img
                        src={photo.thumbUrl || photo.imageUrl}
                        alt={photo.fileName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = photo.imageUrl;
                        }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <a 
                          href={photo.imageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] uppercase font-bold tracking-wider text-black bg-brand-gold hover:bg-amber-500 px-3 py-1.5 rounded-xl w-full text-center flex items-center justify-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Full Size
                        </a>
                        <button
                          onClick={() => deletePhoto(photo)}
                          className="text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl w-full flex items-center justify-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                      
                      {/* Status badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono
                          ${photo.status === 'final' ? 'bg-emerald-500 text-black' :
                            photo.status === 'editing' ? 'bg-purple-500 text-white' :
                            photo.status === 'selected' ? 'bg-blue-500 text-white' :
                            'bg-black/80 text-gray-400 border border-white/5'}`}>
                          {photo.status}
                        </span>
                      </div>
                      {photo.showInPublic && (
                        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/80 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-brand-gold">
                          Public - {photo.category}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-white/20 border border-dashed border-white/5 rounded-3xl">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-15" />
            <p className="text-xs">Choose a customer event booking to begin managing gallery assets.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
