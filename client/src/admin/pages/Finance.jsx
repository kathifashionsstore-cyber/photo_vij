import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Calendar, ClipboardList, Plus, X } from "lucide-react";
import { db } from "../../firebase";

const CATEGORIES = ["Client Follow-up", "Crew Payout Note", "Equipment", "Travel", "Studio", "Vendor", "Other"];
const STATUSES = ["Open", "In Review", "Completed"];

const EMPTY = {
  title: "",
  category: "Client Follow-up",
  date: "",
  person: "",
  status: "Open",
  notes: "",
};

export default function Finance() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "financeLogs"), orderBy("createdAt", "desc")),
      (snap) => setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Finance log listener failed:", err),
    );
    return unsub;
  }, []);

  const counts = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = logs.filter((item) => item.status === status).length;
      return acc;
    }, {});
  }, [logs]);

  const saveLog = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "financeLogs"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      alert("Failed to save log: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Studio Operations Log</h1>
          <p className="mt-1 text-xs font-light text-gray-500">
            Internal non-financial notes for follow-ups, crew coordination, vendors, and studio tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-amber-500"
        >
          <Plus className="h-4 w-4" />
          Add Log
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border border-white/5 bg-brand-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{status}</p>
            <p className="mt-2 text-3xl font-bold text-white">{counts[status] || 0}</p>
            <p className="mt-1 text-[10px] text-gray-600">entries</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/5 bg-brand-card p-6">
        <h3 className="mb-5 flex items-center gap-2 border-b border-white/5 pb-3 text-lg font-bold text-white">
          <ClipboardList className="h-5 w-5 text-brand-gold" />
          Recent Notes
        </h3>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/5 py-16 text-center text-xs text-gray-600">
            No operational notes yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((item) => (
              <div key={item.id} className="grid grid-cols-1 gap-3 py-4 text-xs text-gray-400 md:grid-cols-[1fr_150px_120px]">
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 leading-6 text-gray-500">{item.notes || "No notes added."}</p>
                  {item.person && <p className="mt-1 text-[10px] uppercase tracking-wider text-brand-gold">{item.person}</p>}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-gray-600" />
                  {item.date || "No date"}
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <span className="rounded-full border border-brand-gold/20 bg-brand-gold/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                    {item.category}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[99000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <form onSubmit={saveLog} className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#0F1117] p-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white">Add Operations Log</h3>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-500 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Field label="Title">
              <input required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} placeholder="Follow up with album vendor" />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputClass}>
                  {STATUSES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Date">
                <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Person / Vendor">
                <input value={form.person} onChange={(e) => setForm((prev) => ({ ...prev, person: e.target.value }))} className={inputClass} placeholder="Name" />
              </Field>
            </div>

            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={4} className={`${inputClass} resize-none leading-6`} placeholder="Add internal context..." />
            </Field>

            <button type="submit" disabled={saving} className="flex w-full items-center justify-center rounded-xl bg-brand-gold py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-amber-500 disabled:opacity-50">
              {saving ? "Saving..." : "Save Log"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
    {children}
  </label>
);

const inputClass = "w-full rounded-xl border border-white/5 bg-black/45 px-4 py-3 text-xs text-white outline-none transition-colors focus:border-brand-gold";
