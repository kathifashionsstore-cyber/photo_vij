import { useEffect, useMemo, useRef, useState } from "react";
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
import { Eye, EyeOff, Loader2, RefreshCcw, Trash2, Upload } from "lucide-react";
import { auth, db } from "../../firebase";
import { SERVICES, SERVICE_LABELS } from "../../data/services";
import { compressAndUploadImage } from "../../utils/imageUpload";

const ALBUM_OPTIONS = SERVICES.map((service) => ({ id: service.id, label: service.label }));

const categoryLabel = (category) =>
  ALBUM_OPTIONS.find((item) => item.id === category)?.label || SERVICE_LABELS[category] || category || "Uncategorized";

const describePhoto = (fileName, category) => {
  const cleanName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const label = categoryLabel(category);
  const base = cleanName ? `${cleanName} from ${label}` : `${label} moment`;
  return `${base} captured by Snaplica Photography with warm composition and event-focused detail.`;
};

export default function Gallery() {
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(ALBUM_OPTIONS[0]?.id || "engagement");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatuses, setUploadStatuses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draftDescriptions, setDraftDescriptions] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), orderBy("createdAt", "desc")),
      (snap) => setPhotos(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => {
        console.error("Gallery listener failed:", err);
        setError("Could not load gallery assets.");
      },
    );

    return unsubscribe;
  }, []);

  const selectedAlbumLabel = categoryLabel(selectedAlbum);
  const visiblePhotos = useMemo(
    () => photos.filter((photo) => photo.category === selectedAlbum || photo.serviceType === selectedAlbum),
    [photos, selectedAlbum],
  );

  const uploadFiles = async (files) => {
    if (!selectedAlbum) {
      setError("Choose an album before uploading photos.");
      return;
    }

    const fileList = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (fileList.length === 0) {
      setError("Choose image files to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatuses(fileList.map((file) => ({ name: file.name, status: "queued" })));
    setError("");
    setMessage("");
    let done = 0;

    try {
      for (const [index, file] of fileList.entries()) {
        const updateStatus = (status) => {
          setUploadStatuses((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, status } : item)));
        };
        const { compressedFile, uploaded } = await compressAndUploadImage(file, updateStatus);
        await addDoc(collection(db, "gallery"), {
          albumId: selectedAlbum,
          albumName: selectedAlbumLabel,
          category: selectedAlbum,
          serviceType: selectedAlbum,
          description: describePhoto(file.name, selectedAlbum),
          fileName: file.name,
          imageUrl: uploaded.url,
          url: uploaded.url,
          thumbUrl: uploaded.thumb?.url || uploaded.medium?.url || uploaded.url,
          deleteHash: uploaded.delete_hash || "",
          originalSize: file.size,
          compressedSize: compressedFile.size,
          showInPublic: true,
          status: "public",
          source: "admin_gallery",
          uploadedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.uid || "admin",
        });

        done += 1;
        updateStatus("complete");
        setProgress(Math.round((done / fileList.length) * 100));
      }

      setMessage(`${done} photo${done === 1 ? "" : "s"} uploaded to ${selectedAlbumLabel}.`);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const updatePhoto = async (photoId, values) => {
    await updateDoc(doc(db, "gallery", photoId), {
      ...values,
      updatedAt: serverTimestamp(),
    });
  };

  const saveDescription = async (photo) => {
    const description = draftDescriptions[photo.id] ?? photo.description ?? "";
    await updatePhoto(photo.id, { description });
    setDraftDescriptions((prev) => {
      const next = { ...prev };
      delete next[photo.id];
      return next;
    });
  };

  const regenerateDescription = async (photo) => {
    await updatePhoto(photo.id, { description: describePhoto(photo.fileName || "Snaplica photo", photo.category) });
  };

  const togglePublic = async (photo) => {
    const showInPublic = !photo.showInPublic;
    await updatePhoto(photo.id, { showInPublic, status: showInPublic ? "public" : "hidden" });
  };

  const deletePhoto = async (photo) => {
    if (!window.confirm("Delete this gallery image?")) return;
    await deleteDoc(doc(db, "gallery", photo.id));
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Gallery Assets</h1>
          <p className="mt-1 text-xs text-gray-500">Upload compressed photos into fixed service albums and control public portfolio visibility.</p>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-500 disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Images
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { uploadFiles(event.target.files); event.target.value = ""; }} className="hidden" />
      </div>

      {(message || error || uploading) && (
        <div className={`rounded-[8px] border p-4 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>
          {uploading ? `Uploading and compressing images (${progress}%)` : error || message}
        </div>
      )}

      {uploadStatuses.length > 0 && (
        <div className="grid gap-2 rounded-[8px] border border-white/10 bg-black/30 p-4 text-xs text-gray-400 sm:grid-cols-2 lg:grid-cols-4">
          {uploadStatuses.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 rounded-[8px] bg-white/5 px-3 py-2">
              <span className="truncate">{item.name}</span>
              <span className="font-bold uppercase text-brand-gold">{item.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[8px] border border-white/10 bg-brand-card p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Albums</h2>
          <div className="space-y-2">
            {ALBUM_OPTIONS.map((album) => {
              const count = photos.filter((photo) => photo.category === album.id || photo.serviceType === album.id).length;
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[8px] border p-3 text-left transition-colors ${selectedAlbum === album.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                >
                  <span className="truncate text-sm font-bold text-white">{album.label}</span>
                  <span className="text-[11px] text-gray-500">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="rounded-[8px] border border-white/10 bg-brand-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedAlbumLabel}</h2>
              <p className="mt-1 text-xs text-gray-500">Drag images here or use Upload Images. Photos keep this album as their Firestore category.</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-500">{visiblePhotos.length} images</span>
          </div>

          {visiblePhotos.length === 0 && (
            <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }} className="mb-5 flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-white/15 bg-black/20 p-8 text-center">
              <Upload className="mb-4 h-10 w-10 text-brand-gold" />
              <p className="text-sm font-bold text-white">Upload images to {selectedAlbumLabel}</p>
              <p className="mt-2 max-w-md text-xs leading-6 text-gray-500">Images are compressed close to 300KB before uploading to ImgBB.</p>
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { uploadFiles(event.target.files); event.target.value = ""; }} className="hidden" />
            </label>
          )}

          <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePhotos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-black/25">
                <img src={photo.thumbUrl || photo.imageUrl} alt={photo.description || photo.fileName} className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${photo.showInPublic ? "bg-emerald-500/10 text-emerald-300" : "bg-white/10 text-gray-400"}`}>
                      {photo.showInPublic ? "Public" : "Hidden"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">{categoryLabel(photo.category)}</span>
                  </div>
                  <textarea value={draftDescriptions[photo.id] ?? photo.description ?? ""} onChange={(event) => setDraftDescriptions((prev) => ({ ...prev, [photo.id]: event.target.value }))} onBlur={() => saveDescription(photo)} rows={3} className={`${inputClass} resize-none text-xs leading-5`} />
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => regenerateDescription(photo)} style={iconAction("#60a5fa")} title="Regenerate description"><RefreshCcw className="h-4 w-4" /></button>
                    <button onClick={() => togglePublic(photo)} style={iconAction(photo.showInPublic ? "#f59e0b" : "#22c55e")} title={photo.showInPublic ? "Hide image" : "Show image"}>{photo.showInPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => deletePhoto(photo)} style={iconAction("#ef4444")} title="Delete image"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
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
