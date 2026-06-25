import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Trash2, Upload } from "lucide-react";
import { auth, db } from "../../firebase";
import { compressAndUploadImage } from "../../utils/imageUpload";

const inputClass =
  "w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-gold";

const describePhoto = (fileName) => {
  const cleanName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${cleanName || "Highlight"} captured by Snaplica Photography.`;
};

export default function Highlights() {
  const inputRef = useRef(null);
  const [highlights, setHighlights] = useState([]);
  const [caption, setCaption] = useState("");
  const [drafts, setDrafts] = useState({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "homeHighlights"), orderBy("order", "asc")),
      (snap) => setHighlights(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => {
        console.error("Home highlights listener failed:", err);
        setError("Could not load highlights.");
      },
    );
    return unsubscribe;
  }, []);

  const uploadFiles = async (files) => {
    const fileList = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (fileList.length === 0) {
      setError("Choose image files for the home highlight gallery.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setMessage("");
    let done = 0;

    try {
      for (const [index, file] of fileList.entries()) {
        const { compressedFile, uploaded } = await compressAndUploadImage(file);
        await addDoc(collection(db, "homeHighlights"), {
          caption: caption.trim() || describePhoto(file.name),
          fileName: file.name,
          imageUrl: uploaded.url,
          thumbUrl: uploaded.thumb?.url || uploaded.medium?.url || uploaded.url,
          deleteHash: uploaded.delete_hash || "",
          originalSize: file.size,
          compressedSize: compressedFile.size,
          order: Date.now() + index,
          active: true,
          uploadedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.uid || "admin",
        });
        done += 1;
        setProgress(Math.round((done / fileList.length) * 100));
      }
      setCaption("");
      setMessage(`${done} highlight photo${done === 1 ? "" : "s"} uploaded.`);
    } catch (err) {
      console.error("Highlight upload failed:", err);
      setError(err.message || "Highlight upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const saveCaption = async (photo) => {
    const nextCaption = drafts[photo.id] ?? photo.caption ?? "";
    await updateDoc(doc(db, "homeHighlights", photo.id), {
      caption: nextCaption,
      updatedAt: serverTimestamp(),
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[photo.id];
      return next;
    });
  };

  const moveHighlight = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= highlights.length) return;
    const current = highlights[index];
    const target = highlights[nextIndex];
    await Promise.all([
      updateDoc(doc(db, "homeHighlights", current.id), { order: target.order ?? nextIndex, updatedAt: serverTimestamp() }),
      updateDoc(doc(db, "homeHighlights", target.id), { order: current.order ?? index, updatedAt: serverTimestamp() }),
    ]);
  };

  const deleteHighlight = async (photo) => {
    if (!window.confirm("Remove this home highlight photo?")) return;
    await deleteDoc(doc(db, "homeHighlights", photo.id));
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Highlights</h1>
          <p className="mt-1 text-xs text-gray-500">Curated photos shown directly below the public Home hero.</p>
        </div>
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500 disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Highlights
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => uploadFiles(event.target.files)} onClick={(event) => { event.currentTarget.value = ""; }} className="hidden" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input value={caption} onChange={(event) => setCaption(event.target.value)} className={inputClass} placeholder="Caption for the next uploaded highlight photos" />
        <div className={`rounded-[8px] border px-4 py-3 text-xs ${error ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-white/10 bg-black/30 text-gray-400"}`}>
          {uploading ? `Compressing/uploading (${progress}%)` : error || message || `${highlights.length} highlights live`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {highlights.length === 0 && <div className="rounded-[8px] border border-dashed border-white/10 p-8 text-center text-xs text-gray-600 md:col-span-2 xl:col-span-4">No home highlights uploaded yet.</div>}
        {highlights.map((photo, index) => (
          <article key={photo.id} className="overflow-hidden rounded-[8px] border border-brand-gold/25 bg-black/25">
            <img src={photo.thumbUrl || photo.imageUrl} alt={photo.caption || photo.fileName} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-3 p-4">
              <textarea value={drafts[photo.id] ?? photo.caption ?? ""} onChange={(event) => setDrafts((prev) => ({ ...prev, [photo.id]: event.target.value }))} onBlur={() => saveCaption(photo)} rows={2} className={`${inputClass} resize-none text-xs leading-5`} placeholder="Highlight caption" />
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => moveHighlight(index, -1)} disabled={index === 0} style={iconAction("#c9a227")} title="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => moveHighlight(index, 1)} disabled={index === highlights.length - 1} style={iconAction("#c9a227")} title="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => updateDoc(doc(db, "homeHighlights", photo.id), { active: !photo.active, updatedAt: serverTimestamp() })} style={iconAction(photo.active ? "#f59e0b" : "#22c55e")} title={photo.active ? "Hide" : "Show"}>{photo.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => deleteHighlight(photo)} style={iconAction("#ef4444")} title="Delete highlight"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const iconAction = (color) => ({
  color,
  border: `1px solid ${color}33`,
  background: `${color}14`,
  borderRadius: 8,
  padding: "10px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});
