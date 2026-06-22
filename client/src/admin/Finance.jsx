import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Calendar, FileText, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const Finance = () => {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "Equipment",
    date: ""
  });

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'invoices'));
        const items = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });

        if (items.length === 0) {
          setInvoices([
            { id: "i1", invoiceNumber: "INV-2026-001", clientName: "Rahul Verma", packageName: "Royal Wedding Package", amount: 150000, advancePaid: 45000, status: "partial" },
            { id: "i2", invoiceNumber: "INV-2026-002", clientName: "Sneha Reddy", packageName: "Pre-Wedding Cinematic", amount: 35000, advancePaid: 35000, status: "paid" }
          ]);
        } else {
          setInvoices(items);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };
    fetchFinance();
    setExpenses([
      { id: "e1", title: "Sony FE 85mm GM Lens", amount: 140000, category: "Equipment", date: "2026-06-12" },
      { id: "e2", title: "Travel to Outstation Shoot", amount: 12000, category: "Travel", date: "2026-06-15" }
    ]);
  }, []);

  const handleAddExpense = (e) => {
    e.preventDefault();
    setExpenses(prev => [...prev, { id: Date.now().toString(), ...newExpense }]);
    setShowAddExpense(false);
    setNewExpense({
      title: "",
      amount: "",
      category: "Equipment",
      date: ""
    });
  };

  const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.advancePaid || curr.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Finance & Ledger</h1>
          <p className="text-xs text-gray-500 mt-1 font-light">Trace cash inflows, invoice collections, and crew expenses.</p>
        </div>
        <button 
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2.5 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Expense
        </button>
      </div>

      {/* Finance KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Revenue Inflow</span>
            <ArrowUpRight className="text-emerald-400 w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-white">₹{totalRevenue.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-gray-500 mt-2 block">Total advance deposits logged</span>
        </div>

        <div className="bg-brand-card border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Outgoing Expenses</span>
            <ArrowDownRight className="text-red-400 w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-white">₹{totalExpenses.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-gray-500 mt-2 block">Logged purchases and travel stubs</span>
        </div>

        <div className="bg-brand-card border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Net Studio Profit</span>
            <TrendingUp className="text-brand-gold w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-white">₹{netProfit.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-gray-500 mt-2 block">Ledger profit after expense deductions</span>
        </div>
      </div>

      {/* Invoices and Expenses columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Invoices List */}
        <div className="bg-brand-card border border-white/5 rounded-3xl p-6">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-gold" /> Client Invoices log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase font-semibold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 font-serif font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="py-3">{inv.clientName}</td>
                    <td className="py-3 text-white font-medium">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold
                        ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-brand-gold border border-brand-gold/20'}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-brand-card border border-white/5 rounded-3xl p-6">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-gold" /> Studio Expenses
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase font-semibold">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="py-3 font-serif font-bold text-white">{exp.title}</td>
                    <td className="py-3">{exp.category}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" /> {exp.date}
                      </span>
                    </td>
                    <td className="py-3 text-right text-red-400 font-medium">-₹{exp.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Expense Overlay Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-white font-serif font-bold text-lg">Record Business Expense</h3>
                <button onClick={() => setShowAddExpense(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider">Item/Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Memory card replacement"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider">Amount (INR)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="e.g. 5000"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider">Category</label>
                    <select 
                      value={newExpense.category}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    >
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel & Fuel</option>
                      <option value="Studio Rent">Studio Rent</option>
                      <option value="Salary">Staff Crew Salary</option>
                      <option value="Marketing">Marketing & Ads</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider">Purchase Date</label>
                  <input 
                    required
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-gold text-black hover:bg-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Save Expense
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Finance;
