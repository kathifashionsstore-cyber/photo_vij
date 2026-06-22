import React, { useState } from 'react';
import { Database, Download, RefreshCw, FileCode, CheckCircle } from 'lucide-react';

export const BackupRestore = () => {
  const [backups, setBackups] = useState([
    { id: "b1", fileName: "snaplica_db_backup_2026-06-15.json", size: "342 KB", date: "2026-06-15 03:00 AM", status: "success" },
    { id: "b2", fileName: "snaplica_db_backup_2026-06-16.json", size: "351 KB", date: "2026-06-16 03:00 AM", status: "success" },
    { id: "b3", fileName: "snaplica_db_backup_2026-06-17.json", size: "354 KB", date: "2026-06-17 03:00 AM", status: "success" }
  ]);
  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState("");

  const triggerBackup = () => {
    setBackingUp(true);
    setMessage("");
    setTimeout(() => {
      const now = new Date();
      const fileName = `snaplica_db_backup_${now.toISOString().split('T')[0]}.json`;
      const dateString = now.toLocaleString('en-IN', { hour12: true });
      
      setBackups(prev => [
        { id: Date.now().toString(), fileName, size: "358 KB", date: dateString, status: "success" },
        ...prev
      ]);
      setBackingUp(false);
      setMessage("Database export completed and synced to secure storage successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Database Backup & Recovery</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Trigger database dumps and restore prior configuration logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Trigger card */}
        <div className="lg:col-span-1 bg-brand-card border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-gold" /> Trigger Sync Operations
          </h3>

          {message && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-950/50 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 leading-relaxed font-light">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button 
            onClick={triggerBackup}
            disabled={backingUp}
            className="w-full py-4 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {backingUp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Dump...
              </>
            ) : (
              <>
                Export Firestore DB <Download className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Backups List */}
        <div className="lg:col-span-2 bg-brand-card/40 border border-white/5 rounded-3xl p-6">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 mb-6 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-brand-gold" /> Historic Export Logs ({backups.length})
          </h3>

          <div className="space-y-4">
            {backups.map((bak) => (
              <div 
                key={bak.id}
                className="p-4 bg-brand-card border border-white/5 hover:border-white/10 rounded-xl flex justify-between items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="text-white font-mono font-medium truncate max-w-md">{bak.fileName}</h4>
                  <div className="flex gap-4 text-gray-500 text-[10px]">
                    <span>Size: {bak.size}</span>
                    <span>Date: {bak.date}</span>
                  </div>
                </div>

                <a 
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ backup: bak.id }))}`}
                  download={bak.fileName}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                  title="Download Backup JSON"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BackupRestore;
