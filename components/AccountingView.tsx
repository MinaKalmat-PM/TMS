
import React, { useState, useMemo } from 'react';
import { MOCK_INVOICES, MOCK_EXPENSES, MOCK_SETTLEMENTS, MOCK_DRIVERS, MOCK_IFTA_REPORT } from '../constants';
import { InvoiceStatus, DriverType, IFTAStateReport } from '../types';
import { downloadFile, convertToCSV } from '../src/utils/download';

const AccountingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'settlements' | 'ifta'>('invoices');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDownloadInvoices = () => {
    const csv = convertToCSV(MOCK_INVOICES);
    downloadFile(csv, 'invoices_export.csv', 'text/csv');
  };

  const handleDownloadSettlements = () => {
    const csv = convertToCSV(MOCK_SETTLEMENTS);
    downloadFile(csv, 'settlements_export.csv', 'text/csv');
  };

  const handleDownloadIFTA = () => {
    const csv = convertToCSV(MOCK_IFTA_REPORT.states);
    downloadFile(csv, `ifta_${MOCK_IFTA_REPORT.quarter}_${MOCK_IFTA_REPORT.year}.csv`, 'text/csv');
  };

  const totalRevenue = MOCK_INVOICES.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = MOCK_INVOICES.filter(i => i.status === InvoiceStatus.PAID).reduce((acc, inv) => acc + inv.amount, 0);
  const totalExpenses = MOCK_EXPENSES.reduce((acc, exp) => acc + exp.amount, 0);
  const profit = totalPaid - totalExpenses;

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const calculateIFTA = (state: IFTAStateReport, fleetMpg: number) => {
    const taxableGallons = state.totalMiles / fleetMpg;
    const netGallons = taxableGallons - state.taxPaidGallons;
    const taxOwed = netGallons * (state.taxRate + (state.surcharge || 0));
    return { taxableGallons, netGallons, taxOwed };
  };

  const iftaSummary = useMemo(() => {
    const states = MOCK_IFTA_REPORT.states.map(s => {
      const calcs = calculateIFTA(s, MOCK_IFTA_REPORT.fleetMpg);
      return { ...s, ...calcs };
    });
    const totalTaxOwed = states.reduce((sum, s) => sum + s.taxOwed, 0);
    return { states, totalTaxOwed };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Financial Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Accounts Receivable" value={`$${(totalRevenue - totalPaid).toLocaleString()}`} icon="📄" color="blue" />
        <SummaryCard label="Fleet Fixing Costs" value={`$${totalExpenses.toLocaleString()}`} icon="🔧" color="orange" />
        <SummaryCard 
          label="Net Profit (MTD)" 
          value={`$${profit.toLocaleString()}`} 
          icon="📈" 
          color={profit >= 0 ? 'emerald' : 'rose'} 
          subtitle="Revenue minus expenses"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/50 p-1">
          <TabButton active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} label="Invoices" />
          <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} label="Expenses" />
          <TabButton active={activeTab === 'settlements'} onClick={() => setActiveTab('settlements')} label="Settlements" />
          <TabButton active={activeTab === 'ifta'} onClick={() => setActiveTab('ifta')} label="IFTA Calculator" />
          <div className="ml-auto flex items-center pr-4">
            {activeTab === 'invoices' && (
              <button onClick={handleDownloadInvoices} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all">
                Download CSV
              </button>
            )}
            {activeTab === 'settlements' && (
              <button onClick={handleDownloadSettlements} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all">
                Download CSV
              </button>
            )}
            {activeTab === 'ifta' && (
              <button onClick={handleDownloadIFTA} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all">
                Download IFTA CSV
              </button>
            )}
          </div>
        </div>

        <div className="p-0">
          {activeTab === 'settlements' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Driver Entity</th>
                    <th className="px-8 py-5">Gross Revenue</th>
                    <th className="px-8 py-5">Earnings Split Logic</th>
                    <th className="px-8 py-5">Operational Efficiency</th>
                    <th className="px-8 py-5 text-right">Settlement Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {MOCK_SETTLEMENTS.map((set) => {
                    const driver = MOCK_DRIVERS.find(d => d.id === set.driverId)!;
                    const deadheadPercentage = (set.deadheadMiles / set.totalMiles) * 100;
                    
                    return (
                      <tr key={set.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-900">{driver.name}</p>
                          <div className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            driver.driverType === DriverType.OWNER_OPERATOR ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {driver.driverType}
                          </div>
                        </td>
                        <td className="px-8 py-5 font-medium text-slate-500">${set.grossRevenue.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                               <span className="text-slate-400 uppercase">Driver Payout</span>
                               <span className="text-slate-900 font-black">{(driver.payRate * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className={`${driver.driverType === DriverType.OWNER_OPERATOR ? 'bg-purple-500' : 'bg-blue-500'} h-full`} style={{width: `${driver.payRate * 100}%`}}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                             <span className={`text-[10px] font-black px-2 py-1 rounded-lg w-fit ${
                               deadheadPercentage > 15 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                             }`}>
                                {set.deadheadMiles} Empty Miles
                             </span>
                             <span className="text-[10px] text-slate-400 font-medium">{deadheadPercentage.toFixed(1)}% Deadhead</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-lg font-black text-slate-900">${set.driverShare.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Net to Driver</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Invoice Authority</th>
                  <th className="px-8 py-5">Reference Load</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Aging Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900">{inv.id.toUpperCase()}</td>
                    <td className="px-8 py-5 text-blue-600 font-black">{inv.loadNumber}</td>
                    <td className="px-8 py-5 font-black text-slate-900">${inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        inv.status === InvoiceStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'ifta' && (
            <div className="p-8 space-y-8">
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                   <h4 className="text-2xl font-black mb-1">IFTA Automated Engine</h4>
                   <p className="text-slate-400 text-sm">Synchronizing ELD Mileage & Fuel Card Transactions for {MOCK_IFTA_REPORT.quarter} {MOCK_IFTA_REPORT.year}</p>
                </div>
                <div className="flex gap-4 relative z-10">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fleet Avg MPG</p>
                      <p className="text-2xl font-black text-blue-400">{MOCK_IFTA_REPORT.fleetMpg}</p>
                   </div>
                   <button 
                     onClick={handleSyncData}
                     disabled={isSyncing}
                     className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
                   >
                     {isSyncing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : '🔄'} Sync ELD & Fuel
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <MetricCard label="Total Miles" value={MOCK_IFTA_REPORT.totalMiles.toLocaleString()} sub="Verified by ELD" />
                 <MetricCard label="Total Gallons" value={MOCK_IFTA_REPORT.totalGallons.toLocaleString()} sub="Fuel Card Imports" />
                 <MetricCard 
                    label="Net Tax Liability" 
                    value={`$${iftaSummary.totalTaxOwed.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                    sub={iftaSummary.totalTaxOwed > 0 ? "Owed to Jurisdiction" : "Refund/Credit"}
                    accent={iftaSummary.totalTaxOwed > 0 ? 'rose' : 'emerald'}
                 />
                 <MetricCard label="Audited States" value={MOCK_IFTA_REPORT.states.length.toString()} sub="Full Compliance" />
              </div>

              <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-inner">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <tr>
                          <th className="px-8 py-5">Jurisdiction</th>
                          <th className="px-8 py-5">Total Miles</th>
                          <th className="px-8 py-5">Tax Paid Gal.</th>
                          <th className="px-8 py-5">Taxable Gal.</th>
                          <th className="px-8 py-5 text-right">Net Tax/Credit</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                       {iftaSummary.states.map((s) => (
                         <tr key={s.state} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
                                     {s.state}
                                  </div>
                                  <span className="font-black text-slate-900">{s.state} Jurisdiction</span>
                               </div>
                            </td>
                            <td className="px-8 py-5 font-medium text-slate-600">{s.totalMiles.toLocaleString()}</td>
                            <td className="px-8 py-5 font-medium text-slate-600">{s.taxPaidGallons.toLocaleString()}</td>
                            <td className="px-8 py-5 font-medium text-slate-600">{s.taxableGallons.toFixed(1)}</td>
                            <td className="px-8 py-5 text-right">
                               <span className={`font-black text-lg ${s.taxOwed > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {s.taxOwed > 0 ? `$${s.taxOwed.toFixed(2)}` : `($${Math.abs(s.taxOwed).toFixed(2)})`}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
             <div className="p-8 text-center text-slate-400 italic">
                <p>Advanced Expense Filtering Module - Pulling from Unit Fixed Logs</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, sub, accent = 'blue' }: any) => {
  const accentClasses: any = {
    blue: 'text-blue-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600'
  };
  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${accentClasses[accent]}`}>{value}</p>
      <p className="text-[10px] text-slate-500 font-medium mt-1">{sub}</p>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`px-8 py-4 text-xs font-black transition-all rounded-2xl uppercase tracking-widest m-1 ${
      active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
    }`}
  >
    {label}
  </button>
);

const SummaryCard = ({ label, value, icon, color, subtitle }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-125">
         <span className="text-6xl">{icon}</span>
      </div>
      <div className="relative z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};

export default AccountingView;
