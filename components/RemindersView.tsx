
import React, { useState } from 'react';
import { MOCK_REMINDERS } from '../constants';
import { Reminder, ReminderCategory, ReminderFrequency } from '../types';
import { downloadFile, convertToCSV } from '../src/utils/download';

const RemindersView: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);

  const handleDownloadReminders = () => {
    const csv = convertToCSV(reminders);
    downloadFile(csv, 'reminders_export.csv', 'text/csv');
  };

  const handleMarkComplete = (id: string) => {
    // In a real app, this would recalculate the nextDueDate based on frequency
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getFrequencyIcon = (freq: ReminderFrequency) => {
    switch (freq) {
      case ReminderFrequency.QUARTERLY: return '📅';
      case ReminderFrequency.ANNUAL: return '🎆';
      case ReminderFrequency.FIVE_WEEKS: return '♻️';
      default: return '🔔';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Compliance & Recurring Tasks</h2>
          <p className="text-slate-500 mt-1">Automatic reminders for IFTA, state permits, and tax filings.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={handleDownloadReminders}
            className="px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Export CSV
          </button>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">
            + Create Custom Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-100">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Next Critical Deadline</p>
          <p className="text-2xl font-black">IFTA Q2 Filing</p>
          <div className="mt-4 flex justify-between items-center bg-white/10 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-blue-100">DUE IN</p>
              <p className="text-xl font-black">12 Days</p>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Filing Hub ↗</button>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Permit Audit Cycle</p>
          <p className="text-2xl font-black">State Perm Audit</p>
          <div className="mt-4 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-slate-400 italic">"Ensure all IRP & NY-HUT decals match active units. Every 5 weeks."</p>
          </div>
        </div>

        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-xl shadow-emerald-100">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Compliance Health</p>
          <p className="text-4xl font-black">94%</p>
          <p className="text-xs font-bold mt-2">All Annual Filings (Form 2290) are current.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Reminder Queue</h4>
        </div>
        <div className="divide-y divide-slate-50">
          {reminders.map((rem) => (
            <div key={rem.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  {getFrequencyIcon(rem.frequency)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h5 className="text-lg font-black text-slate-900 tracking-tight">{rem.title}</h5>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(rem.priority)}`}>
                      {rem.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 max-w-xl">{rem.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">
                      {rem.category}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Cycle: {rem.frequency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Due Date</p>
                  <p className={`text-lg font-black ${new Date(rem.nextDueDate) < new Date() ? 'text-rose-600' : 'text-slate-900'}`}>
                    {rem.nextDueDate}
                  </p>
                </div>
                <button 
                  onClick={() => handleMarkComplete(rem.id)}
                  className="bg-white border-2 border-slate-200 text-slate-900 p-4 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all hover:scale-105"
                  title="Mark as Completed"
                >
                  ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemindersView;
