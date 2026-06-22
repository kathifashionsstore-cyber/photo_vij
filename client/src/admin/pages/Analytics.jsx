import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart as ChartIcon, Trophy } from 'lucide-react';

export const Analytics = () => {
  const performanceData = [
    { name: 'Jan', shoots: 14, conversions: 8 },
    { name: 'Feb', shoots: 18, conversions: 11 },
    { name: 'Mar', shoots: 22, conversions: 15 },
    { name: 'Apr', shoots: 25, conversions: 18 },
    { name: 'May', shoots: 30, conversions: 21 },
    { name: 'Jun', shoots: 28, conversions: 19 }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Monthly Analytics</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Trace historical conversion logs and crew deliverables.</p>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl p-6">
        <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 mb-6 flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-brand-gold" /> Performance Ratios
        </h3>

        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
              <YAxis tick={{ fill: '#4B5563' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0C0E14', borderColor: 'rgba(255,255,255,0.08)' }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Legend />
              <Bar dataKey="shoots" fill="#6366F1" radius={[4, 4, 0, 0]} name="Total Shoots Booked" />
              <Bar dataKey="conversions" fill="#C9A227" radius={[4, 4, 0, 0]} name="Successful Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
