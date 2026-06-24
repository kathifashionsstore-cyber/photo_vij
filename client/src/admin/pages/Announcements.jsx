import { useEffect, useState } from "react";
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
import { Bell, Save, Trash2 } from "lucide-react";
import { db } from "../../firebase";

const EMPTY = {
  text: "",
  href: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

export const Announcements = () => {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "announcements"), orderBy("createdAt", "desc")),
      (snap) => setAlerts(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
      (err) => console.error("Announcements listener failed:", err),
    );
    return unsubscribe;
  }, []);

  const reset = () => {
    setForm(EMPTY);
    setEditingId("");
  };

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    if (!form.text.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        text: form.text.trim(),
        href: form.href.trim(),
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, "announcements", editingId), payload);
        setMessage("Announcement updated.");
      } else {
        await addDoc(collection(db, "announcements"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMessage("Announcement created.");
      }
      reset();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const editAnnouncement = (item) => {
    setEditingId(item.id);
    setForm({
      text: item.text || "",
      href: item.href || "",
      startsAt: item.startsAt || "",
      endsAt: item.endsAt || "",
      active: item.active !== false && item.isActive !== false,
    });
  };

  const removeAnnouncement = async (item) => {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", item.id));
    if (editingId === item.id) reset();
  };

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">Top Alert Announcements</h1>
        <p className="mt-1 text-xs font-light text-gray-500">Create, edit, schedule, and enable the public top announcement bar.</p>
      </div>

      <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3 text-xs text-brand-gold">
        <strong>Always included:</strong> Website crafted by WayzenTech - Contact 9398724704.
      </div>

      {message && <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-gray-300">{message}</div>}

      <form onSubmit={saveAnnouncement} className="space-y-5 rounded-3xl border border-white/5 bg-brand-card p-6">
        <h3 className="flex items-center gap-2 border-b border-white/5 pb-3 text-lg font-bold text-white">
          <Bell className="h-5 w-5 text-brand-gold" />
          {editingId ? "Edit Announcement" : "New Announcement"}
        </h3>
        <Field label="Announcement Text">
          <input
            required
            value={form.text}
            onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
            className={inputClass}
            placeholder="Now booking wedding shoots for July 2026"
          />
        </Field>
        <Field label="Optional Link">
          <input value={form.href} onChange={(e) => setForm((prev) => ({ ...prev, href: e.target.value }))} className={inputClass} placeholder="https://... or tel:9494387387" />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Start Date">
            <input type="date" value={form.startsAt} onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.endsAt} onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))} className={inputClass} />
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-gray-300">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} className="h-4 w-4 accent-brand-gold" />
          Enabled on public site
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-500 disabled:opacity-50">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : editingId ? "Update Announcement" : "Create Announcement"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-brand-gold hover:text-brand-gold">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {alerts.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-gray-600">No announcements saved yet.</p>}
        {alerts.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/20 p-4 text-xs md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-gray-200">{item.text}</p>
              <p className="mt-1 text-gray-600">
                {item.active === false || item.isActive === false ? "Disabled" : "Enabled"}
                {item.startsAt ? ` · Starts ${item.startsAt}` : ""}
                {item.endsAt ? ` · Ends ${item.endsAt}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editAnnouncement(item)} className="rounded-lg border border-brand-gold/30 px-3 py-2 font-bold uppercase tracking-wider text-brand-gold hover:bg-brand-gold hover:text-black">Edit</button>
              <button onClick={() => updateDoc(doc(db, "announcements", item.id), { active: item.active === false, updatedAt: serverTimestamp() })} className="rounded-lg border border-white/10 px-3 py-2 font-bold uppercase tracking-wider text-gray-300 hover:text-white">
                {item.active === false ? "Enable" : "Disable"}
              </button>
              <button onClick={() => removeAnnouncement(item)} className="rounded-lg border border-red-500/30 px-3 py-2 text-red-300 hover:bg-red-500/10" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
  </label>
);

const inputClass =
  "w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white outline-none transition-colors focus:border-brand-gold";

export default Announcements;
