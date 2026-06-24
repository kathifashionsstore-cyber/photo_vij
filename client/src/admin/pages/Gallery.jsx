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
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { auth, db } from "../../firebase";
import { SERVICES, SERVICE_LABELS } from "../../data/services";
import { compressAndUploadImage } from "../../utils/imageUpload";
import { toEmbeddableVideo } from "../../utils/videoLinks";

const CATEGORY_OPTIONS = [
  { id: "founder", label: "Founder" },
  { id: "team", label: "Team" },
  ...SERVICES.map((service) => ({ id: service.id, label: service.title })),
];

const DEFAULT_ALBUM = {
  name: "",
  category: "wedding",
  description: "",
  showInPublic: true,
};

const categoryLabel = (category) =>
  CATEGORY_OPTIONS.find((item) => item.id === category)?.label || SERVICE_LABELS[category] || category || "Uncategorized";

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
  const highlightInputRef = useRef(null);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [videos, setVideos] = useState([]);
  const [albumForm, setAlbumForm] = useState(DEFAULT_ALBUM);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatuses, setUploadStatuses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draftDescriptions, setDraftDescriptions] = useState({});
  const [highlightCaption, setHighlightCaption] = useState("");
  const [highlightDrafts, setHighlightDrafts] = useState({});
  const [highlightUploading, setHighlightUploading] = useState(false);
  const [highlightProgress, setHighlightProgress] = useState(0);
  const [highlightMessage, setHighlightMessage] = useState("");
  const [highlightError, setHighlightError] = useState("");
  const [videoForm, setVideoForm] = useState({ url: "", title: "" });
  const [videoError, setVideoError] = useState("");

  useEffect(() => {
    const unsubscribeAlbums = onSnapshot(
      query(collection(db, "albums"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setAlbums(list);
        setSelectedAlbumId((current) => current || list[0]?.id || "");
      },
      (err) => console.error("Albums listener failed:", err),
    );

    const unsubscribePhotos = onSnapshot(
      query(collection(db, "gallery"), orderBy("createdAt", "desc")),
      (snap) => setPhotos(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => console.error("Gallery listener failed:", err),
    );

    const unsubscribeHighlights = onSnapshot(
      query(collection(db, "homeHighlights"), orderBy("order", "asc")),
      (snap) => setHighlights(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => console.error("Home highlights listener failed:", err),
    );

    const unsubscribeVideos = onSnapshot(
      query(collection(db, "homeVideos"), orderBy("order", "asc")),
      (snap) => setVideos(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => console.error("Home videos listener failed:", err),
    );

    return () => {
      unsubscribeAlbums();
      unsubscribePhotos();
      unsubscribeHighlights();
      unsubscribeVideos();
    };
  }, []);

  const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);
  const visiblePhotos = useMemo(
    () => photos.filter((photo) => photo.albumId === selectedAlbumId),
    [photos, selectedAlbumId],
  );

  const saveAlbum = async (event) => {
    event.preventDefault();
    if (!albumForm.name.trim()) return;

    const docRef = await addDoc(collection(db, "albums"), {
      ...albumForm,
      name: albumForm.name.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || "admin",
    });
    setSelectedAlbumId(docRef.id);
    setAlbumForm(DEFAULT_ALBUM);
  };

  const uploadFiles = async (files) => {
    if (!selectedAlbum) {
      setError("Select an album before uploading photos.");
      return;
    }

    const fileList = Array.from(files).filter((file) => file.type.startsWith("image/"));
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
        const description = describePhoto(file.name, selectedAlbum.category);
        const payload = {
          albumId: selectedAlbum.id,
          albumName: selectedAlbum.name,
          category: selectedAlbum.category,
          serviceType: selectedAlbum.category,
          description,
          fileName: file.name,
          imageUrl: uploaded.url,
          url: uploaded.url,
          thumbUrl: uploaded.thumb?.url || uploaded.medium?.url || uploaded.url,
          deleteHash: uploaded.delete_hash || "",
          originalSize: file.size,
          compressedSize: compressedFile.size,
          showInPublic: Boolean(selectedAlbum.showInPublic),
          status: selectedAlbum.showInPublic ? "public" : "hidden",
          source: "admin_gallery",
          uploadedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          uploadedBy: auth.currentUser?.uid || "admin",
        };

        const photoDoc = await addDoc(collection(db, "gallery"), payload);
        await updateDoc(doc(db, "albums", selectedAlbum.id), {
          coverUrl: selectedAlbum.coverUrl || uploaded.thumb?.url || uploaded.url,
          updatedAt: serverTimestamp(),
          lastPhotoId: photoDoc.id,
        });

        done += 1;
        updateStatus("complete");
        setProgress(Math.round((done / fileList.length) * 100));
      }

      setMessage(`${done} photo${done === 1 ? "" : "s"} uploaded.`);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const triggerAlbumUpload = () => {
    if (!selectedAlbum) {
      setError("Select an album before uploading photos.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDropUpload = (event) => {
    event.preventDefault();
    if (uploading) return;
    uploadFiles(event.dataTransfer.files);
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

  const uploadHighlightFiles = async (files) => {
    const fileList = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileList.length === 0) {
      setHighlightError("Choose image files for the home highlight gallery.");
      return;
    }

    setHighlightUploading(true);
    setHighlightProgress(0);
    setHighlightError("");
    setHighlightMessage("");
    let done = 0;

    try {
      for (const [index, file] of fileList.entries()) {
        const { compressedFile, uploaded } = await compressAndUploadImage(file);
        await addDoc(collection(db, "homeHighlights"), {
          caption: highlightCaption.trim() || describePhoto(file.name, "wedding"),
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
        setHighlightProgress(Math.round((done / fileList.length) * 100));
      }
      setHighlightCaption("");
      setHighlightMessage(`${done} highlight photo${done === 1 ? "" : "s"} uploaded.`);
    } catch (err) {
      console.error("Highlight upload failed:", err);
      setHighlightError(err.message || "Highlight upload failed.");
    } finally {
      setHighlightUploading(false);
      setHighlightProgress(0);
    }
  };

  const saveHighlightCaption = async (photo) => {
    const caption = highlightDrafts[photo.id] ?? photo.caption ?? "";
    await updateDoc(doc(db, "homeHighlights", photo.id), {
      caption,
      updatedAt: serverTimestamp(),
    });
    setHighlightDrafts((prev) => {
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

  const saveVideo = async (event) => {
    event.preventDefault();
    setVideoError("");
    const parsed = toEmbeddableVideo(videoForm.url);
    if (!parsed) {
      setVideoError("Paste a valid YouTube or Vimeo video link.");
      return;
    }

    await addDoc(collection(db, "homeVideos"), {
      title: videoForm.title.trim() || "Snaplica video",
      url: videoForm.url.trim(),
      embedUrl: parsed.embedUrl,
      provider: parsed.provider,
      order: Date.now(),
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || "admin",
    });
    setVideoForm({ url: "", title: "" });
  };

  const deleteVideo = async (video) => {
    if (!window.confirm("Remove this home page video?")) return;
    await deleteDoc(doc(db, "homeVideos", video.id));
  };

  return (
    <div className="space-y-7" onDragOver={(event) => event.preventDefault()} onDrop={handleDropUpload}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Gallery Assets</h1>
          <p className="mt-1 text-xs text-gray-500">Albums, ImgBB uploads, public visibility, and portfolio descriptions.</p>
        </div>
        <button
          type="button"
          onClick={triggerAlbumUpload}
          disabled={uploading}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${selectedAlbum ? "bg-brand-gold text-black hover:bg-amber-500" : "bg-white/10 text-gray-300 hover:text-white"}`}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <form onSubmit={saveAlbum} className="rounded-[8px] border border-white/10 bg-brand-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Plus className="h-4 w-4 text-brand-gold" />
              Create Album
            </h2>
            <div className="space-y-4">
              <Field label="Album Name">
                <input required value={albumForm.name} onChange={(e) => setAlbumForm((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} placeholder="Wedding highlights" />
              </Field>
              <Field label="Category">
                <select value={albumForm.category} onChange={(e) => setAlbumForm((prev) => ({ ...prev, category: e.target.value }))} className={inputClass}>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Album Note">
                <textarea value={albumForm.description} onChange={(e) => setAlbumForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} placeholder="Internal album context" />
              </Field>
              <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-white/10 bg-black/30 p-3 text-xs text-gray-400">
                <input type="checkbox" checked={albumForm.showInPublic} onChange={(e) => setAlbumForm((prev) => ({ ...prev, showInPublic: e.target.checked }))} className="h-4 w-4 accent-brand-gold" />
                New uploads visible publicly
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500">
                <Save className="h-4 w-4" />
                Save Album
              </button>
            </div>
          </form>

          <div className="rounded-[8px] border border-white/10 bg-brand-card p-4">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Albums</h2>
            <div className="space-y-2">
              {albums.length === 0 && <p className="rounded-[8px] border border-dashed border-white/10 p-6 text-center text-xs text-gray-600">No albums yet.</p>}
              {albums.map((album) => {
                const count = photos.filter((photo) => photo.albumId === album.id).length;
                return (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => setSelectedAlbumId(album.id)}
                    className={`flex w-full items-center gap-3 rounded-[8px] border p-3 text-left transition-colors ${
                      selectedAlbumId === album.id ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-[8px] bg-black/40">
                      {album.coverUrl ? <img src={album.coverUrl} alt={album.name} className="h-full w-full object-cover" /> : <ImageIcon className="m-3 h-6 w-6 text-gray-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{album.name}</p>
                      <p className="mt-1 text-[11px] text-gray-500">{categoryLabel(album.category)} · {count} photos</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="rounded-[8px] border border-white/10 bg-brand-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedAlbum?.name || "Select an album"}</h2>
              <p className="mt-1 text-xs text-gray-500">{selectedAlbum ? categoryLabel(selectedAlbum.category) : "Create an album to start uploading."}</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-500">{visiblePhotos.length} images</span>
          </div>

          {selectedAlbum && visiblePhotos.length === 0 && (
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropUpload}
              className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-white/15 bg-black/20 p-8 text-center"
            >
              <Upload className="mb-4 h-10 w-10 text-brand-gold" />
              <p className="text-sm font-bold text-white">Upload images into this album</p>
              <p className="mt-2 max-w-md text-xs leading-6 text-gray-500">Images are compressed close to 300KB before uploading to ImgBB.</p>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  uploadFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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

                  <textarea
                    value={draftDescriptions[photo.id] ?? photo.description ?? ""}
                    onChange={(e) => setDraftDescriptions((prev) => ({ ...prev, [photo.id]: e.target.value }))}
                    onBlur={() => saveDescription(photo)}
                    rows={3}
                    className={`${inputClass} resize-none text-xs leading-5`}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => regenerateDescription(photo)} className={iconAction("#60a5fa")} title="Regenerate description">
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                    <button onClick={() => togglePublic(photo)} className={iconAction(photo.showInPublic ? "#f59e0b" : "#22c55e")} title={photo.showInPublic ? "Hide image" : "Show image"}>
                      {photo.showInPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deletePhoto(photo)} className={iconAction("#ef4444")} title="Delete image">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      <section className="rounded-[8px] border border-white/10 bg-brand-card p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Home Highlight Gallery</h2>
            <p className="mt-1 text-xs text-gray-500">Curated photos shown directly below the public Home hero.</p>
          </div>
          <button
            type="button"
            disabled={highlightUploading}
            onClick={() => highlightInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500 disabled:opacity-50"
          >
            {highlightUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Highlights
          </button>
          <input
            ref={highlightInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={highlightUploading}
            onChange={(e) => uploadHighlightFiles(e.target.files)}
            onClick={(e) => {
              e.currentTarget.value = "";
            }}
            className="hidden"
          />
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={highlightCaption}
            onChange={(e) => setHighlightCaption(e.target.value)}
            className={inputClass}
            placeholder="Caption for the next uploaded highlight photos"
          />
          <div className="rounded-[8px] border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-400">
            {highlightUploading ? `Compressing/uploading (${highlightProgress}%)` : highlightError || highlightMessage || `${highlights.length} highlights live`}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {highlights.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-white/10 p-8 text-center text-xs text-gray-600 md:col-span-2 xl:col-span-4">
              No home highlights uploaded yet.
            </div>
          )}
          {highlights.map((photo, index) => (
            <article key={photo.id} className="overflow-hidden rounded-[8px] border border-brand-gold/25 bg-black/25">
              <img src={photo.thumbUrl || photo.imageUrl} alt={photo.caption || photo.fileName} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-3 p-4">
                <textarea
                  value={highlightDrafts[photo.id] ?? photo.caption ?? ""}
                  onChange={(e) => setHighlightDrafts((prev) => ({ ...prev, [photo.id]: e.target.value }))}
                  onBlur={() => saveHighlightCaption(photo)}
                  rows={2}
                  className={`${inputClass} resize-none text-xs leading-5`}
                  placeholder="Highlight caption"
                />
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => moveHighlight(index, -1)} disabled={index === 0} className={iconAction("#c9a227")} title="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveHighlight(index, 1)} disabled={index === highlights.length - 1} className={iconAction("#c9a227")} title="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => updateDoc(doc(db, "homeHighlights", photo.id), { active: !photo.active, updatedAt: serverTimestamp() })} className={iconAction(photo.active ? "#f59e0b" : "#22c55e")} title={photo.active ? "Hide" : "Show"}>
                    {photo.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteHighlight(photo)} className={iconAction("#ef4444")} title="Delete highlight">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-white/10 bg-brand-card p-5">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Film className="h-5 w-5 text-brand-gold" />
            Home Video Section
          </h2>
          <p className="mt-1 text-xs text-gray-500">Paste embeddable YouTube or Vimeo links. No video files are uploaded.</p>
        </div>

        <form onSubmit={saveVideo} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={videoForm.url}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, url: e.target.value }))}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <input
            value={videoForm.title}
            onChange={(e) => setVideoForm((prev) => ({ ...prev, title: e.target.value }))}
            className={inputClass}
            placeholder="Optional title"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500">
            <LinkIcon className="h-4 w-4" />
            Save Video
          </button>
        </form>
        {videoError && <p className="mt-3 text-xs text-red-300">{videoError}</p>}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videos.length === 0 && (
            <div className="rounded-[8px] border border-dashed border-white/10 p-8 text-center text-xs text-gray-600 md:col-span-2 xl:col-span-3">
              No home videos saved yet.
            </div>
          )}
          {videos.map((video) => (
            <article key={video.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-black/25">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="aspect-video w-full bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{video.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">{video.provider}</p>
                </div>
                <button onClick={() => deleteVideo(video)} className={iconAction("#ef4444")} title="Delete video">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
  </label>
);

const inputClass =
  "w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-gold";

const iconAction = (color) =>
  ({
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
