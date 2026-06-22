import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Check, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        const items = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });

        if (items.length === 0) {
          // Fallback mock
          setBookings([
            { id: "b1", clientName: "Rahul Verma", clientPhone: "9494387387", eventDate: "2026-07-15", packageName: "Royal Wedding Package", venueAddress: "A-Convention, Vijayawada", status: "pending" },
            { id: "b2", clientName: "Sneha Reddy", clientPhone: "9988776655", eventDate: "2026-08-20", packageName: "Pre-Wedding Cinematic", venueAddress: "Krishna River Sunrise Point", status: "approved" }
          ]);
        } else {
          setBookings(items);
        }
      } catch (err) {
        console.error("Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleApprove = async (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'approved' });
    } catch (err) {
      console.error("Firestore status update failed:", err);
    }
  };

  const handleComplete = async (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'completed' });
    } catch (err) {
      console.error("Firestore status update failed:", err);
    }
  };

  const handleDelete = async (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.error("Firestore delete booking error:", err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Event Bookings Manager</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Approve dates, review comments, and log venue coordinates.</p>
      </div>

      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/20 text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Shoot Date</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Venue Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <AnimatePresence>
                {bookings.map((b) => (
                  <motion.tr 
                    key={b.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-serif font-bold text-white">{b.clientName}</td>
                    <td className="px-6 py-4 font-mono">{b.clientPhone}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold" /> {b.eventDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-gold">{b.packageName}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /> {b.venueAddress}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold inline-flex items-center gap-1
                        ${b.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : b.status === 'approved' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'bg-amber-500/10 text-brand-gold border border-brand-gold/20'}`}
                      >
                        {b.status === 'completed' && <ShieldCheck className="w-3 h-3" />}
                        {b.status === 'approved' && <Check className="w-3 h-3" />}
                        {b.status === 'pending' && <Clock className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {b.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(b.id)}
                          className="px-2.5 py-1.5 bg-brand-gold text-black uppercase font-bold text-[9px] tracking-wider rounded-lg hover:bg-amber-500 transition-colors"
                          title="Approve Shoot"
                        >
                          Approve
                        </button>
                      )}
                      {b.status === 'approved' && (
                        <button 
                          onClick={() => handleComplete(b.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 text-white uppercase font-bold text-[9px] tracking-wider rounded-lg hover:bg-emerald-700 transition-colors"
                          title="Mark Completed"
                        >
                          Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-950/40 border border-white/5 hover:border-red-900/50 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                        title="Remove Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
