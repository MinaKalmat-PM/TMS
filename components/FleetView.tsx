
import React, { useState } from 'react';
import { MOCK_TRUCKS, MOCK_MAINTENANCE } from '../constants';
import { FleetStatus, MaintenanceRecord, Truck } from '../types';
import { downloadFile } from '../src/utils/download';

const FleetView: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'permits' | 'maint'>('general');

  const handleDownloadDoc = (docName: string, truckUnit: string) => {
    const content = `Document: ${docName}\nTruck Unit: ${truckUnit}\n\nThis is a simulated document content for SwiftLink TMS.`;
    downloadFile(content, `${docName.toLowerCase().replace(/\s+/g, '_')}_${truckUnit}.pdf`, 'application/pdf');
  };

  const getTruckMaintenance = (id: string) => MOCK_MAINTENANCE.filter(m => m.truckId === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-black text-slate-900">Fleet Management</h2>
            <p className="text-sm text-slate-500">Managing 40 operational units</p>
         </div>
         <div className="flex gap-3">
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200">
               + Add New Unit
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_TRUCKS.map((truck) => {
          const maintenance = getTruckMaintenance(truck.id);
          const totalSpend = maintenance.reduce((sum, m) => sum + m.cost, 0);
          
          return (
            <div 
              key={truck.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedTruck(truck);
                setActiveTab('general');
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{truck.unitNumber}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{truck.make} {truck.model} • {truck.year}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Plate: {truck.plateNumber}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    truck.status === FleetStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                    truck.status === FleetStatus.MAINTENANCE ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {truck.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="text-lg">📍</span>
                    <p className="truncate font-medium">{truck.currentLocation.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">IRP Expiration</p>
                       <p className={`text-sm font-black ${new Date(truck.irpExpiration) < new Date() ? 'text-rose-600' : 'text-slate-800'}`}>
                         {truck.irpExpiration}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Maint Spend</p>
                       <p className="text-sm font-black text-blue-600">${totalSpend.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
                <button className="flex-1 text-[11px] font-black py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors uppercase tracking-wider">
                  Details
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTruck(truck);
                    setShowLogModal(true);
                  }}
                  className="flex-1 text-[11px] font-black py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider shadow-lg shadow-blue-100"
                >
                  Log Fixing
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Truck Details Modal */}
      {selectedTruck && !showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Unit {selectedTruck.unitNumber} - Fleet Detail</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedTruck.make} {selectedTruck.model} • {selectedTruck.vin}</p>
              </div>
              <button onClick={() => setSelectedTruck(null)} className="text-white/60 hover:text-white text-3xl font-light">&times;</button>
            </div>

            <div className="bg-slate-50 border-b border-slate-200 flex px-8">
               <button onClick={() => setActiveTab('general')} className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Registration</button>
               <button onClick={() => setActiveTab('permits')} className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'permits' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>State Permits (NY, KY, OR, NJ)</button>
               <button onClick={() => setActiveTab('maint')} className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'maint' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Maintenance History</button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {activeTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Registration</h4>
                    <DetailRow label="Plate Number" value={selectedTruck.plateNumber} />
                    <DetailRow label="IRP Expiration" value={selectedTruck.irpExpiration} />
                    <DetailRow label="Title Number" value={selectedTruck.titleNumber} />
                    <DetailRow label="Current Odometer" value={`${selectedTruck.totalMiles?.toLocaleString()} mi`} />
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lease & Rental Files</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-3">
                           <span className="text-xl">📄</span>
                           <span className="text-xs font-black text-slate-800">Lease Agreement</span>
                        </div>
                        <button 
                          onClick={() => handleDownloadDoc('Lease Agreement', selectedTruck.unitNumber)}
                          className="text-blue-600 font-bold text-[10px] uppercase hover:underline"
                        >
                          Download ⬇
                        </button>
                      </div>
                      {selectedTruck.rentalAgreementUrl && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-3">
                             <span className="text-xl">📄</span>
                             <span className="text-xs font-black text-slate-800">Rental Agreement</span>
                          </div>
                          <button 
                            onClick={() => handleDownloadDoc('Rental Agreement', selectedTruck.unitNumber)}
                            className="text-blue-600 font-bold text-[10px] uppercase hover:underline"
                          >
                            Download ⬇
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'permits' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTruck.permits.map((permit) => (
                        <div key={permit.state} className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm">
                                {permit.state}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-900">{permit.permitNumber}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase">Expires: {permit.expirationDate}</p>
                              </div>
                           </div>
                           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                             permit.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                           }`}>
                             {permit.status}
                           </span>
                        </div>
                      ))}
                   </div>
                   <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Permit Compliance Tip</p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Oregon and New Mexico require monthly weight-distance reporting. Ensure your miles-per-state logs are accurate before the 15th of each month to avoid penalties.
                      </p>
                   </div>
                </div>
              )}

              {activeTab === 'maint' && (
                <div className="space-y-4">
                   {getTruckMaintenance(selectedTruck.id).map((m) => (
                      <div key={m.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center">
                         <div>
                            <p className="text-xs font-black text-slate-900">{m.repairType}</p>
                            <p className="text-[10px] text-slate-400">{m.date} • {m.description}</p>
                         </div>
                         <p className="text-sm font-black text-slate-900">${m.cost.toLocaleString()}</p>
                      </div>
                   ))}
                   {getTruckMaintenance(selectedTruck.id).length === 0 && (
                     <div className="text-center py-12 text-slate-400 italic text-sm">No maintenance records found for this unit.</div>
                   )}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setSelectedTruck(null)} className="px-6 py-3 text-sm font-black text-slate-500 hover:bg-slate-200 rounded-2xl uppercase tracking-widest transition-colors">Close</button>
              <button className="px-6 py-3 text-sm font-black bg-slate-900 text-white hover:bg-slate-800 rounded-2xl uppercase tracking-widest shadow-xl shadow-slate-200 transition-all">Upload New Document</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Log Modal */}
      {showLogModal && selectedTruck && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black">Record Fleet Maintenance</h3>
                    <p className="text-slate-400 text-xs">Unit: {selectedTruck.unitNumber}</p>
                 </div>
                 <button onClick={() => setShowLogModal(false)} className="text-white/60 hover:text-white text-3xl font-light">&times;</button>
              </div>
              <div className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Date</label>
                       <input type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repair Cost ($)</label>
                       <input type="number" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Category</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                       <option>Engine / Powertrain</option>
                       <option>Brakes / Suspension</option>
                       <option>Tires / Wheels</option>
                       <option>Electrical / Lighting</option>
                       <option>Body / Interior</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea placeholder="Work performed details..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm h-24 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"></textarea>
                 </div>
                 
                 <div className="p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-center group cursor-pointer hover:bg-blue-100 transition-colors">
                    <span className="text-2xl mb-2 block">📄</span>
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Attach Invoice or Receipt</p>
                    <p className="text-[10px] text-blue-400 mt-1 font-medium">Click to upload JPG, PNG or PDF</p>
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowLogModal(false)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                       Save Record
                    </button>
                    <button onClick={() => setShowLogModal(false)} className="px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400 hover:bg-slate-50">
                       Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-50 py-3">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className="text-slate-900 font-black">{value}</span>
  </div>
);

export default FleetView;
