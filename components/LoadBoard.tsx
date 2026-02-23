
import React, { useState } from 'react';
import { MOCK_LOADS, MOCK_TRUCKS, MOCK_DRIVERS } from '../constants';
import { Load, LoadStatus, FleetStatus } from '../types';
import { getDispatchAdvice } from '../services/geminiService';
import { downloadFile, convertToCSV } from '../src/utils/download';

const LoadBoard: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>(MOCK_LOADS);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAddingLoad, setIsAddingLoad] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);

  const handleDownloadLoads = () => {
    const csv = convertToCSV(loads);
    downloadFile(csv, 'load_board_export.csv', 'text/csv');
  };

  // Form State for new load
  const [newLoad, setNewLoad] = useState<Partial<Load>>({
    status: LoadStatus.PENDING,
    pickupDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });

  const handleAiDispatch = async (load: Load) => {
    setSelectedLoad(load);
    setIsAiLoading(true);
    setAiAdvice(null);
    
    const availableTrucks = MOCK_TRUCKS.filter(t => t.status === FleetStatus.ACTIVE);
    const availableDrivers = MOCK_DRIVERS.filter(d => d.status === FleetStatus.ACTIVE);
    
    const advice = await getDispatchAdvice(load, availableTrucks, availableDrivers);
    setAiAdvice(advice || "No advice found.");
    setIsAiLoading(false);
  };

  const handleEditLoad = (load: Load) => {
    setEditingLoad(load);
    setNewLoad(load);
  };

  const handleDeleteLoad = (id: string) => {
    if (window.confirm('Are you sure you want to delete this load?')) {
      setLoads(loads.filter(l => l.id !== id));
    }
  };

  const handleSaveLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoad) {
      setLoads(loads.map(l => l.id === editingLoad.id ? { ...editingLoad, ...newLoad } as Load : l));
      setEditingLoad(null);
    } else {
      const loadToSave: Load = {
        ...newLoad as Load,
        id: `ld-${Date.now()}`,
        loadNumber: newLoad.loadNumber || `L-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      setLoads([loadToSave, ...loads]);
      setIsAddingLoad(false);
    }
    setNewLoad({
      status: LoadStatus.PENDING,
      pickupDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
  };

  const getStatusColor = (status: LoadStatus) => {
    switch (status) {
      case LoadStatus.IN_TRANSIT: return 'bg-blue-100 text-blue-700';
      case LoadStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case LoadStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700';
      case LoadStatus.CANCELLED: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search loads..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadLoads}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setIsAddingLoad(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            + Add New Load
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Load ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loads.map((load) => (
              <tr key={load.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{load.loadNumber}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm text-slate-600 font-medium">{load.customer}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm">
                    <p className="font-black text-slate-800">{load.origin}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">to {load.destination}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm text-slate-500 font-medium">{load.pickupDate}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(load.status)}`}>
                    {load.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-slate-900">${load.rate.toLocaleString()}</span>
                </td>
                <td className="px-8 py-5 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleAiDispatch(load)}
                    className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm"
                  >
                    ✨ AI Dispatch
                  </button>
                  <button 
                    onClick={() => handleEditLoad(load)}
                    className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteLoad(load.id)}
                    className="text-[10px] bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New/Edit Load Modal */}
      {(isAddingLoad || editingLoad) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{editingLoad ? 'Edit Load' : 'Create New Load'}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Global Freight Entry Hub</p>
              </div>
              <button onClick={() => { setIsAddingLoad(false); setEditingLoad(null); }} className="text-white/40 hover:text-white text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSaveLoad} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Global Logistics"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.customer || ''}
                    onChange={(e) => setNewLoad({...newLoad, customer: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Number (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if blank"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.loadNumber || ''}
                    onChange={(e) => setNewLoad({...newLoad, loadNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin City, ST</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Chicago, IL"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.origin || ''}
                    onChange={(e) => setNewLoad({...newLoad, origin: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination City, ST</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Los Angeles, CA"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.destination || ''}
                    onChange={(e) => setNewLoad({...newLoad, destination: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.pickupDate}
                    onChange={(e) => setNewLoad({...newLoad, pickupDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.deliveryDate}
                    onChange={(e) => setNewLoad({...newLoad, deliveryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Rate ($)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0.00"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.rate || ''}
                    onChange={(e) => setNewLoad({...newLoad, rate: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loaded Miles</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.miles || ''}
                    onChange={(e) => setNewLoad({...newLoad, miles: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadhead Miles</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.deadheadMiles || ''}
                    onChange={(e) => setNewLoad({...newLoad, deadheadMiles: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                    value={newLoad.status}
                    onChange={(e) => setNewLoad({...newLoad, status: e.target.value as LoadStatus})}
                  >
                    {Object.values(LoadStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                >
                  {editingLoad ? 'Update Load Entry' : 'Create Load Entry'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsAddingLoad(false); setEditingLoad(null); }}
                  className="px-8 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLoad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div>
                <h3 className="text-xl font-black tracking-tight">✨ AI Dispatch Intelligence</h3>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mt-0.5">Analyzing Load {selectedLoad.loadNumber}</p>
              </div>
              <button onClick={() => setSelectedLoad(null)} className="text-white/60 hover:text-white text-3xl font-light">&times;</button>
            </div>
            <div className="p-10 space-y-4">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-inner"></div>
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest animate-pulse">Gemini 3 Pro Analysing Fleet Logic...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 text-slate-700 text-sm whitespace-pre-line leading-relaxed shadow-inner font-medium">
                    {aiAdvice}
                  </div>
                  <div className="mt-8 flex gap-4">
                    <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                      Apply Assignment
                    </button>
                    <button 
                      onClick={() => setSelectedLoad(null)}
                      className="px-8 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadBoard;
