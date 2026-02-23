
import React from 'react';

const SystemSchemaView: React.FC = () => {
  const tables = [
    {
      name: 'Loads',
      fields: 'ID, Load#, Customer, Origin, Destination, PickupDate, DeliveryDate, Status, Rate, Miles, DeadheadMiles, DriverID, TruckID, Tolls, FuelCost'
    },
    {
      name: 'Trucks',
      fields: 'ID, Unit#, VIN, Make, Model, Year, Status, Address, Miles, Plate#, IRP_Exp, Title#, Lease_URL, Rental_URL, Permits_JSON'
    },
    {
      name: 'Drivers',
      fields: 'ID, Name, Phone, Email, License#, CDL_Exp, Med_Exp, HireDate, Status, DriverType, PayRate, TruckID, Docs_JSON, Training_JSON'
    },
    {
      name: 'Maintenance',
      fields: 'ID, TruckID, Date, RepairType, Cost, Description, InvoiceURL'
    },
    {
      name: 'Settlements',
      fields: 'ID, DriverID, LoadID, Date, GrossRevenue, DriverShare, CompanyShare, TotalMiles, DeadheadMiles'
    }
  ];

  const formulas = [
    { label: 'Revenue per Mile (Loaded)', formula: '[Rate] / [Miles]' },
    { label: 'Profit per Load', formula: '[Rate] - ([Rate] * [DriverPayRate]) - [FuelCost] - [Tolls]' },
    { label: 'Maint. Cost / Mile (MCPM)', formula: 'SUM(SELECT(Maintenance[Cost], [TruckID] = [_THISROW].[TruckID])) / [TotalMiles]' },
    { label: 'Deadhead Efficiency %', formula: '[DeadheadMiles] / ([Miles] + [DeadheadMiles])' },
    { label: 'Permit Expiring Soon?', formula: 'MIN(SELECT(Permits[ExpDate], [TruckID] = [_THISROW].[TruckID])) < TODAY() + 30' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
        <h3 className="text-2xl font-black mb-2">Google Sheets & AppSheet Strategy</h3>
        <p className="text-blue-100 text-sm max-w-2xl opacity-90 leading-relaxed">
          Use these table structures and virtual column formulas to sync your TMS data with a Google Sheets backend for mobile AppSheet usage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table Schema */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Database Tables</h4>
          </div>
          <div className="divide-y divide-slate-100">
            {tables.map((table) => (
              <div key={table.name} className="p-6 hover:bg-slate-50 transition-colors">
                <p className="text-blue-600 font-black text-sm mb-1">{table.name}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{table.fields}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Virtual Column Formulas (Excel Style)</h4>
           </div>
           <div className="p-6 space-y-4">
              {formulas.map((item) => (
                <div key={item.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">{item.label}</p>
                   <code className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block mt-2">
                     {item.formula}
                   </code>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* View Strategy */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">AppSheet Dashboard Strategy</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ViewCard title="Ops Command" desc="Map view + Active Loads table" icon="📍" />
            <ViewCard title="P&L Summary" desc="Gross vs Expenses Charts" icon="💰" />
            <ViewCard title="Maint. Health" desc="Inspection schedule alerts" icon="🔧" />
            <ViewCard title="Compliance" desc="Plate/IRP/Permit expiration red-zone" icon="🛡️" />
         </div>
      </div>
    </div>
  );
};

const ViewCard = ({ title, desc, icon }: any) => (
  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:bg-white transition-all">
    <span className="text-2xl mb-3 block">{icon}</span>
    <p className="font-black text-slate-900 text-sm mb-1">{title}</p>
    <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
  </div>
);

export default SystemSchemaView;
