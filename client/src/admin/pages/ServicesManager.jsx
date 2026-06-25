import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Edit, Eye, EyeOff, Loader2, Save, Upload, X } from "lucide-react";
import { auth, db } from "../../firebase";
import { mergeServiceWithDefault } from "../../data/services";
import { compressAndUploadImage } from "../../utils/imageUpload";
import { seedDefaultServices, watchServices } from "../../utils/servicesStore";

const inputClass =
  "w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-gold";

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    seedDefaultServices().catch((err) => {
      console.warn("Service seed skipped:", err);
      setError("Could not seed default services. Check admin permissions.");
    });

    const unsubscribe = watchServices(
      (nextServices) => {
        setServices(nextServices);
        setLoading(false);
      },
      (err) => {
        console.error("Services manager listener failed:", err);
        setError("Could not load services from Firestore.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const updateService = async (serviceId, values) => {
    const current = services.find((service) => service.id === serviceId);
    const payload = mergeServiceWithDefault({ ...current, ...values, id: serviceId });
    await setDoc(doc(db, "services", serviceId), {
      ...payload,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid || "admin",
    }, { merge: true });
  };

  const toggleActive = async (service) => {
    try {
      await updateService(service.id, { active: service.active === false });
      flash(`${service.label} ${service.active === false ? "shown" : "hidden"} on public site.`);
    } catch (err) {
      console.error("Service toggle failed:", err);
      setError("Could not update service visibility.");
    }
  };

  const openEditor = (service) => {
    const normalized = mergeServiceWithDefault(service);
    setEditing(normalized);
    setDraft(normalized);
    setError("");
  };

  const uploadThumbnail = async (file) => {
    if (!file || !draft?.id) return;
    setUploading(true);
    setError("");
    try {
      const { uploaded } = await compressAndUploadImage(file);
      const imageUrl = uploaded.url;
      const nextDraft = { ...draft, imageUrl, image: imageUrl };
      setDraft(nextDraft);
      await updateService(draft.id, nextDraft);
      flash("Thumbnail uploaded.");
    } catch (err) {
      console.error("Service thumbnail upload failed:", err);
      setError(err.message || "Thumbnail upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveDraft = async (event) => {
    event.preventDefault();
    if (!draft?.id) return;
    setSaving(true);
    setError("");
    try {
      await updateService(draft.id, {
        ...draft,
        label: draft.label.trim(),
        title: draft.label.trim(),
        shortTitle: draft.label.trim(),
        description: draft.description.trim(),
        summary: draft.description.trim(),
      });
      setEditing(null);
      setDraft(null);
      flash("Service saved.");
    } catch (err) {
      console.error("Service save failed:", err);
      setError("Could not save service changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Services Manager</h1>
          <p className="mt-1 text-xs text-gray-500">Manage the 12 fixed service circles shown on the public site.</p>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          {services.length || 12} fixed services
        </span>
      </div>

      {(message || error) && (
        <div className={`rounded-[8px] border p-4 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>
          {error || message}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[8px] border border-white/10 bg-brand-card text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-gold" />
          Loading services
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="rounded-[8px] border border-white/10 bg-brand-card p-5">
              <div className="grid gap-4 sm:grid-cols-[88px_1fr_auto] sm:items-start">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-brand-gold/30 bg-black/40 text-3xl">
                  {service.imageUrl ? <img src={service.imageUrl} alt={service.label} className="h-full w-full object-cover" /> : <span>{service.icon}</span>}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{service.label}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${service.active === false ? "bg-white/10 text-gray-400" : "bg-emerald-500/10 text-emerald-300"}`}>
                      {service.active === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-gray-500">{service.description || "No description added yet."}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-gray-600">{service.id}</p>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button type="button" onClick={() => openEditor(service)} style={actionStyle("#c9a227")} title="Edit service">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => toggleActive(service)} style={actionStyle(service.active === false ? "#22c55e" : "#f59e0b")} title={service.active === false ? "Show on public site" : "Hide from public site"}>
                    {service.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && draft && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/78 p-4" onClick={(event) => event.target === event.currentTarget && setEditing(null)}>
          <form onSubmit={saveDraft} className="w-full max-w-2xl rounded-[8px] border border-white/10 bg-[#0f0f12] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Edit {editing.label}</h2>
                <p className="mt-1 text-xs text-gray-500">Service ID: {editing.id}</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="text-gray-500 transition-colors hover:text-white" aria-label="Close editor">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[180px_1fr]">
              <div className="space-y-4">
                <div className="grid aspect-square place-items-center overflow-hidden rounded-full border border-brand-gold/30 bg-black/40 text-5xl">
                  {draft.imageUrl ? <img src={draft.imageUrl} alt={draft.label} className="h-full w-full object-cover" /> : <span>{draft.icon}</span>}
                </div>
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-4 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading" : "Upload Thumbnail"}
                  <input type="file" accept="image/*" disabled={uploading} onChange={(event) => { uploadThumbnail(event.target.files?.[0]); event.target.value = ""; }} className="hidden" />
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-400">
                  <input type="checkbox" checked={draft.active !== false} onChange={(event) => setDraft((prev) => ({ ...prev, active: event.target.checked }))} />
                  Active on public site
                </label>
              </div>

              <div className="space-y-4">
                <Field label="Display Name">
                  <input required value={draft.label} onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))} className={inputClass} />
                </Field>
                <Field label="Description">
                  <textarea required rows={8} value={draft.description || ""} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} className={`${inputClass} resize-none leading-6`} />
                </Field>
                <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
  </label>
);

const actionStyle = (color) => ({
  color,
  border: `1px solid ${color}33`,
  background: `${color}14`,
  borderRadius: 8,
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});
