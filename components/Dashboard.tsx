
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_LOADS, MOCK_TRUCKS, MOCK_DRIVERS, MOCK_MAINTENANCE, MOCK_REMINDERS } from '../constants';
import { FleetStatus, LoadStatus, Driver } from '../types';
import { downloadFile } from '../src/utils/download';

const data = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

type RiskLevel = 'RED' | 'YELLOW' | 'GREEN';

const Dashboard: React.FC = () => {
  const activeTrucks = MOCK_TRUCKS.filter(t => t.status === FleetStatus.ACTIVE).length;
  const maintenanceTrucks = MOCK_TRUCKS.filter(t => t.status === FleetStatus.MAINTENANCE).length;
  const activeLoads = MOCK_LOADS.filter(l => l.status === LoadStatus.IN_TRANSIT).length;

  const handleDownloadSummary = () => {
    const summary = `
SwiftLink Logistics LLC - Dashboard Summary
Date: ${new Date().toLocaleDateString()}

Active Fleet: ${activeTrucks}/40
Monthly Revenue: $142,850
Revenue per Mile: $2.48
Throughput: 84 Loads

Maintenance Spend: $${MOCK_MAINTENANCE.reduce((acc, m) => acc + m.cost, 0).toLocaleString()}
Active Loads: ${activeLoads}
    `.trim();
    downloadFile(summary, 'dashboard_summary.txt');
  };
  
  const monthlyMaintSpend = useMemo(() => {
    return MOCK_MAINTENANCE.reduce((acc, m) => acc + m.cost, 0);
  }, []);

  const driverCompliance = useMemo(() => {
    const today = new Date();
    const processed = MOCK_DRIVERS.map(driver => {
      const cdlExp = new Date(driver.cdlExpiration);
      const medExp = new Date(driver.medicalCardExpiration);
      
      const diffDaysCDL = Math.ceil((cdlExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffDaysMed = Math.ceil((medExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let risk: RiskLevel = 'GREEN';
      let reason = 'All documents valid';

      if (diffDaysCDL <= 0 || diffDaysMed <= 0) {
        risk = 'RED';
        reason = diffDaysCDL <= 0 ? 'CDL Expired' : 'Medical Card Expired';
      } else if (diffDaysCDL <= 7 || diffDaysMed <= 7) {
        risk = 'RED';
        reason = diffDaysCDL <= 7 ? 'CDL Expires < 7d' : 'Medical Expires < 7d';
      } else if (diffDaysCDL <= 30 || diffDaysMed <= 30) {
        risk = 'YELLOW';
        reason = diffDaysCDL <= 30 ? 'CDL Expires soon' : 'Medical Expires soon';
      }

      return { ...driver, risk, reason };
    });

    return {
      all: processed,
      red: processed.filter(d => d.risk === 'RED'),
      yellow: processed.filter(d => d.risk === 'YELLOW'),
    };
  }, []);

  const companyInfo = {
    name: "SwiftLink Logistics LLC",
    tagline: "Driven by Precision, Sustained by Reliability",
    usdot: "3948572",
    mc: "1029384",
    address: "2302 Foster Ave, Wheeling, IL 60090",
    phone: "(847) 555-0123",
    email: "ops@swiftlinktms.com"
  };

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(companyInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 pb-12">
      {/* Branding & Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Branding Label Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-slate-200 ring-4 ring-white">🚛</div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{companyInfo.name}</h3>
                <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">{companyInfo.tagline}</p>
              </div>
              <button 
                onClick={handleDownloadSummary}
                className="ml-auto bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Download Summary
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">USDOT</p>
                <p className="text-sm font-black text-slate-800">{companyInfo.usdot}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MC Authority</p>
                <p className="text-sm font-black text-slate-800">{companyInfo.mc}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-center items-center">
                 <span className="text-[10px] font-bold text-emerald-600 uppercase">Safety Rating</span>
                 <span className="text-xs font-black text-emerald-700">SATISFACTORY</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">📍</span>
                <p className="text-slate-600 font-medium">{companyInfo.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">📞</span>
                <p className="text-slate-600 font-bold">{companyInfo.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 h-48 md:h-auto bg-slate-100 relative border-l border-slate-100">
            <iframe 
              width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
              src={mapUrl} allowFullScreen title="Location" loading="lazy"
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Maintenance Snapshot */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fleet Maintenance</h3>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">MAY 2024</span>
           </div>
           <div className="flex-1 flex flex-col justify-center text-center">
              <p className="text-slate-400 text-sm mb-1">Monthly Fixing Spend</p>
              <p className="text-4xl font-black text-white mb-2">${monthlyMaintSpend.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-bold bg-rose-400/10 py-1.5 rounded-full">
                 <span>⚠ +$1,200 vs last month</span>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Maint Cost / Mile</p>
                 <p className="text-lg font-bold text-blue-400">$0.18</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Repairs</p>
                 <p className="text-lg font-bold text-amber-400">{maintenanceTrucks}</p>
              </div>
           </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Fleet', value: `${activeTrucks}/40`, icon: '🚛', color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Utilization: 92%' },
          { label: 'Monthly Revenue', value: '$142,850', icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Target: $150k' },
          { label: 'Revenue / Mile', value: '$2.48', icon: '📈', color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Avg last 30d' },
          { label: 'Throughput', value: '84 Loads', icon: '📦', color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Delivered MTD' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 rounded-xl ${stat.bg} ${stat.color} text-xl shadow-sm transition-transform group-hover:scale-110`}>{stat.icon}</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">HEALTHY</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle Grid: Revenue vs Compliance Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
             <div className="flex gap-2">
                <button className="text-[10px] font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">WEEKLY</button>
                <button className="text-[10px] font-bold bg-blue-600 px-3 py-1.5 rounded-lg text-white">MONTHLY</button>
             </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Reminders Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Compliance Hub</h3>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Urgent Alerts</span>
           </div>
           <div className="space-y-4 flex-1 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
              {MOCK_REMINDERS.slice(0, 3).map((rem) => (
                <div key={rem.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      rem.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rem.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{rem.nextDueDate}</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 leading-tight">{rem.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{rem.description}</p>
                </div>
              ))}
           </div>
           <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
             Manage All Tasks
           </button>
        </div>
      </div>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Expiring Documents</h3>
           <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
              {[...driverCompliance.red, ...driverCompliance.yellow].map((driver, i) => (
                <div key={driver.id} className="flex gap-4 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${driver.risk === 'RED' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800 truncate">{driver.name}</p>
                    <p className="text-[10px] text-rose-600 font-bold uppercase tracking-tighter mt-0.5">{driver.reason}</p>
                    <button className="mt-2 text-[10px] text-blue-600 font-black hover:underline uppercase">Process Renewal ↗</button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
