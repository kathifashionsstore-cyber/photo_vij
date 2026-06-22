import React, { useState, useEffect } from 'react';
import { Calendar, Download, Eye, FileText, CheckCircle, Clock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SEOHead from '../components/SEOHead';

export const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [booking, setBooking] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated logged-in customer info or query from URL/Auth
    const fetchPortalData = async () => {
      setLoading(true);
      try {
        // Set mock data as default for local workspace builds
        setBooking({
          clientName: "Rahul Verma",
          packageName: "Royal Wedding Package",
          eventDate: "2026-07-15",
          venueAddress: "A-Convention Hall, Vijayawada",
          status: "approved",
          photoStatus: "editing" // uploading, editing, delivered
        });

        setInvoices([
          { id: "inv-1", invoiceNumber: "INV-2026-001", clientName: "Rahul Verma", packageName: "Royal Wedding Package", amount: 150000, advancePaid: 45000, status: "partial", createdAt: "2026-06-10" }
        ]);

        setPhotos([
          { id: 1, url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600", tag: "Ceremonies" },
          { id: 2, url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", tag: "Candid Portraits" },
          { id: 3, url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600", tag: "Groom Preparation" },
          { id: 4, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600", tag: "Mandap Moments" }
        ]);
      } catch (err) {
        console.error("Failed loading portal databases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 font-sans">
      <SEOHead 
        title="Customer Dashboard" 
        description="View your booking progress, select client photos for photobooks, and pay invoices in the Snaplica customer portal." 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Welcome card */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-start gap-4">
            <img src="/logo.webp" alt="Snaplica Photography" className="h-14 w-14 rounded-2xl object-contain ring-1 ring-white/10" />
            <div>
              <span className="text-brand-gold text-[10px] uppercase tracking-widest font-semibold">
                Client Portal
              </span>
              <h1 className="text-3xl font-serif text-white font-bold mt-1">
                Welcome, {booking?.clientName || "Valued Client"}
              </h1>
              <p className="text-gray-500 text-xs mt-1 font-light leading-relaxed">
                Log coordinates, review final album sheets, and process payments securely.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === 'overview' ? 'bg-brand-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("gallery")}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === 'gallery' ? 'bg-brand-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              Photos ({photos.length})
            </button>
            <button 
              onClick={() => setActiveTab("billing")}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === 'billing' ? 'bg-brand-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              Billing
            </button>
          </div>
        </div>

        {/* Tab content wrappers */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left booking info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-gold" /> Active Booking Info
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block uppercase tracking-wider font-semibold">Package Name</span>
                    <span className="text-white font-medium">{booking?.packageName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase tracking-wider font-semibold">Shoot Date</span>
                    <span className="text-white font-medium">{booking?.eventDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block uppercase tracking-wider font-semibold">Venue Address</span>
                    <span className="text-white font-medium">{booking?.venueAddress}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Timeline Progress */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3">
                  Photo Delivery Timeline
                </h3>
                
                <div className="relative pl-6 border-l border-white/10 space-y-6 text-xs">
                  <div className="relative">
                    <div className="absolute -left-[30px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-brand-dark" />
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider">Completed</span>
                    <h4 className="text-white font-serif font-bold text-sm mt-1">Shoot Capture Completed</h4>
                    <p className="text-gray-500 font-light mt-0.5">Crew completed Mandap and Traditional coverage on {booking?.eventDate}.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] w-3 h-3 rounded-full bg-brand-gold border-2 border-brand-dark animate-pulse" />
                    <span className="text-brand-gold font-semibold uppercase tracking-wider">In Progress</span>
                    <h4 className="text-white font-serif font-bold text-sm mt-1">Photo Selection & Color Grading</h4>
                    <p className="text-gray-500 font-light mt-0.5">Specialists are editing candid raw files. Deliveries expected within 5 days.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] w-3 h-3 rounded-full bg-gray-700 border-2 border-brand-dark" />
                    <span className="text-gray-500 font-semibold uppercase tracking-wider">Pending</span>
                    <h4 className="text-gray-400 font-serif font-bold text-sm mt-1">Photobook Album Print</h4>
                    <p className="text-gray-600 font-light mt-0.5">We print leather photobook albums after your selections are finalized in this portal.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-center">
                <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-white font-serif font-bold text-lg">Current Status</h3>
                <div className="inline-block px-3 py-1.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-xs uppercase tracking-widest font-bold rounded-full">
                  Editing Assets
                </div>
                <p className="text-gray-500 text-xs font-light leading-relaxed">
                  Sonu and team are curating the event shoot. You will get a WhatsApp alert when files are ready for select.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-white font-serif font-bold text-xl">Deliverables Preview</h3>
                <p className="text-gray-500 text-xs mt-0.5 font-light">Preview selections. You can click 'Download' to save high-resolution copies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {photos.map((ph) => (
                <div key={ph.id} className="group bg-brand-card rounded-2xl overflow-hidden border border-white/5 relative aspect-square">
                  <img src={ph.url} alt="Deliverable" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity">
                    <span className="px-2 py-1 bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-[9px] uppercase tracking-wider font-bold rounded-md">
                      {ph.tag}
                    </span>
                    <div className="flex gap-2">
                      <a href={ph.url} target="_blank" rel="noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white border border-white/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </a>
                      <a href={ph.url} download className="w-8 h-8 bg-brand-gold text-black rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-white font-serif font-bold text-xl">Billing & Invoices</h3>
              <p className="text-gray-500 text-xs mt-0.5 font-light">Process pending advances or trace your historic payment receipts.</p>
            </div>

            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black/20 text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                      <th className="px-6 py-4">Invoice No</th>
                      <th className="px-6 py-4">Package</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Advance Paid</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-serif font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 text-gray-300">{inv.packageName}</td>
                        <td className="px-6 py-4 text-white font-medium">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-white font-medium">₹{inv.advancePaid.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-amber-500/10 text-brand-gold border border-brand-gold/20 rounded-full text-[9px] uppercase tracking-wider font-bold">
                            {inv.status === 'partial' ? 'Partial Paid' : inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-brand-gold hover:text-white transition-colors bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg">
                            <FileText className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
