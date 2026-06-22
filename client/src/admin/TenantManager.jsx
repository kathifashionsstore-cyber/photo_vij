import React, { useState } from 'react';
import { Shield, Building, Globe, Database, ToggleLeft, ToggleRight } from 'lucide-react';

export const TenantManager = () => {
  const [tenants, setTenants] = useState([
    { id: "tnt1", name: "Vijayawada Studio Base", domain: "vj.snaplica.com", storage: "8.4 GB / 20 GB", active: true, plan: "Pro SaaS" },
    { id: "tnt2", name: "Guntur Studio Branch", domain: "gnt.snaplica.com", storage: "1.2 GB / 10 GB", active: true, plan: "Starter SaaS" },
    { id: "tnt3", name: "Hyderabad Shoot Crew", domain: "hyd.snaplica.com", storage: "0.0 GB / 20 GB", active: false, plan: "Pro SaaS (Trial)" }
  ]);

  const toggleTenant = (id) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">SaaS Tenant Manager</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Super-admin controls regulating branches and logical storage limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tenants.map((t) => (
          <div key={t.id} className="bg-brand-card border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between h-48 hover:border-white/10 transition-colors">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building className="text-brand-gold w-5 h-5" />
                  <h3 className="text-white font-serif font-bold text-base">{t.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold
                  ${t.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                >
                  {t.active ? 'Active' : 'Suspended'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-600" />
                  <span>{t.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-gray-600" />
                  <span>Storage: {t.storage}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
              <span className="text-[10px] text-brand-gold font-sans font-semibold uppercase">
                Plan: {t.plan}
              </span>
              <button 
                onClick={() => toggleTenant(t.id)}
                className="p-1 text-gray-500 hover:text-brand-gold transition-all"
                title={t.active ? "Suspend Tenant" : "Activate Tenant"}
              >
                {t.active ? <ToggleRight className="w-6 h-6 text-brand-gold" /> : <ToggleLeft className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantManager;
