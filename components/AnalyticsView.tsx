
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_LOADS, MOCK_TRUCKS, MOCK_MAINTENANCE, MOCK_DRIVERS } from '../constants';
import { LoadStatus, FleetStatus } from '../types';
import { downloadFile, convertToCSV } from '../src/utils/download';

const AnalyticsView: React.FC = () => {
  const metrics = useMemo(() => {
    // Financials
    const deliveredLoads = MOCK_LOADS.filter(l => l.status === LoadStatus.DELIVERED);
    const monthlyGross = deliveredLoads.reduce((acc, l) => acc + l.rate, 0);
    const totalMiles = deliveredLoads.reduce((acc, l) => acc + l.miles, 0);
    const totalDeadhead = deliveredLoads.reduce((acc, l) => acc + l.deadheadMiles, 0);
    const revenuePerMile = totalMiles > 0 ? monthlyGross / totalMiles : 0;
    
    // Maintenance
    const totalMaintCost = MOCK_MAINTENANCE.reduce((acc, m) => acc + m.cost, 0);
    const maintCostPerMile = totalMiles > 0 ? totalMaintCost / (totalMiles + totalDeadhead) : 0;

    // Throughput
    const activeTrucks = MOCK_TRUCKS.filter(t => t.status === FleetStatus.ACTIVE).length;
    const idleTrucks = MOCK_TRUCKS.filter(t => t.status === FleetStatus.IDLE).length;
    
    return {
      monthlyGross,
      revenuePerMile,
      profitPerLoad: deliveredLoads.length > 0 ? monthlyGross / deliveredLoads.length : 0,
      maintCostPerMile,
      totalMaintCost,
      loadsCompleted: deliveredLoads.length,
      activeTrucks,
      idleTrucks,
      deadheadPercentage: totalMiles > 0 ? (totalDeadhead / (totalMiles + totalDeadhead)) * 100 : 0
    };
  }, []);

  const handleExportData = () => {
    const data = [
      { Metric: 'Monthly Gross', Value: metrics.monthlyGross },
      { Metric: 'Revenue per Mile', Value: metrics.revenuePerMile },
      { Metric: 'Profit per Load', Value: metrics.profitPerLoad },
      { Metric: 'Total Maint Cost', Value: metrics.totalMaintCost },
      { Metric: 'Loads Completed', Value: metrics.loadsCompleted },
      { Metric: 'Active Trucks', Value: metrics.activeTrucks },
      { Metric: 'Idle Trucks', Value: metrics.idleTrucks },
      { Metric: 'Deadhead %', Value: metrics.deadheadPercentage },
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, 'analytics_metrics.csv', 'text/csv');
  };

  const chartData = [
    { name: 'Week 1', revenue: 12000, expenses: 8000 },
    { name: 'Week 2', revenue: 15000, expenses: 9500 },
    { name: 'Week 3', revenue: 11000, expenses: 7200 },
    { name: 'Week 4', revenue: 18000, expenses: 10500 },
  ];

  const fleetDistribution = [
    { name: 'Active', value: metrics.activeTrucks, color: '#10b981' },
    { name: 'Idle', value: metrics.idleTrucks, color: '#f59e0b' },
    { name: 'Maint', value: MOCK_TRUCKS.length - metrics.activeTrucks - metrics.idleTrucks, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900">Performance Analytics</h2>
        <button 
          onClick={handleExportData}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all"
        >
          Export Data CSV
        </button>
      </div>

      {/* High-Level Formula Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormulaCard 
          label="Revenue per Mile" 
          value={`$${metrics.revenuePerMile.toFixed(2)}`} 
          formula="Gross Rate / Loaded Miles"
          trend="+4.2%"
        />
        <FormulaCard 
          label="Maintenance / Mile" 
          value={`$${metrics.maintCostPerMile.toFixed(2)}`} 
          formula="Total Repair Cost / Total Miles"
          trend="-1.5%"
          isGood={false}
        />
        <FormulaCard 
          label="Profit per Load" 
          value={`$${metrics.profitPerLoad.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
          formula="Net Income / Total Loads"
          trend="+12%"
        />
        <FormulaCard 
          label="Throughput" 
          value={metrics.loadsCompleted.toString()} 
          formula="Delivered Loads (MTD)"
          trend="+2 loads"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue vs. Operational Cost</h3>
              <p className="text-sm text-slate-500">Margin tracking over the last 30 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-xs font-semibold text-slate-600">Cost</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#cbd5e1" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization Throughput */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Fleet Throughput</h3>
          <p className="text-sm text-slate-500 mb-8">Active vs. Idle capacity</p>
          
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{Math.round((metrics.activeTrucks / MOCK_TRUCKS.length) * 100)}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Utilization</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {fleetDistribution.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-medium text-slate-600">{item.name} Units</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadhead Efficiency */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-slate-200">
         <div className="flex-1">
            <h4 className="text-xl font-bold mb-2">Deadhead Miles Analytics</h4>
            <p className="text-slate-400 text-sm mb-6">Efficiency ratio between empty and loaded miles. Goal: Below 10%.</p>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black text-blue-400">{metrics.deadheadPercentage.toFixed(1)}%</span>
               <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Overall Efficiency</span>
            </div>
         </div>
         <div className="w-full md:w-1/2 space-y-4">
            <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
               <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${metrics.deadheadPercentage}%`}}></div>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
               <span>Optimal (0%)</span>
               <span className="text-blue-400">Current</span>
               <span>Critical (25%)</span>
            </div>
         </div>
      </div>
    </div>
  );
};

const FormulaCard = ({ label, value, formula, trend, isGood = true }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        isGood ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {trend}
      </span>
    </div>
    <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
    <div className="flex flex-col gap-1">
       <p className="text-[10px] text-slate-500 italic font-medium">{formula}</p>
    </div>
  </div>
);

export default AnalyticsView;
