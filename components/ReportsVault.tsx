
import React, { useState } from 'react';
import { MOCK_REPORTS } from '../constants';
import { ReportFile } from '../types';
import { downloadFile } from '../src/utils/download';

const ReportsVault: React.FC = () => {
  const [reports] = useState<ReportFile[]>(MOCK_REPORTS);
  const [filter, setFilter] = useState('All');

  const handleDownload = (report: ReportFile) => {
    // Simulate downloading the report content
    const content = `Report: ${report.name}\nCategory: ${report.category}\nDate: ${report.date}\nSize: ${report.size}\n\nThis is a simulated ${report.type.toUpperCase()} file content for SwiftLink TMS.`;
    const mimeType = report.type === 'pdf' ? 'application/pdf' : 'text/csv';
    const fileName = `${report.name.toLowerCase().replace(/\s+/g, '_')}.${report.type}`;
    downloadFile(content, fileName, mimeType);
  };

  const filteredReports = filter === 'All' 
    ? reports 
    : reports.filter(r => r.category === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports Vault</h2>
          <p className="text-slate-500 mt-1">Stored audit records, IFTA filings, and financial summaries.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {['All', 'IFTA', 'Accounting', 'Fleet', 'Drivers'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-blue-600">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-50 transition-colors">
                {report.type === 'pdf' ? '📄' : '📊'}
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                {report.category}
              </span>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-black text-slate-900 truncate mb-1">{report.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Generated: {report.date} • {report.size}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleDownload(report)}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Download
              </button>
              <button className="px-4 py-3 border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                👁️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsVault;
