
import React, { useState, useMemo } from 'react';
import { MOCK_DRIVERS, MOCK_TRUCKS } from '../constants';
import { Driver, FleetStatus, DriverDocument, OrientationModule } from '../types';
import { downloadFile } from '../src/utils/download';

const DriverView: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'docs' | 'orientation'>('profile');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDownloadDoc = (doc: DriverDocument) => {
    const content = `Document: ${doc.name}\nType: ${doc.type}\nUpload Date: ${doc.uploadDate}\n\nThis is a simulated document content for SwiftLink TMS.`;
    downloadFile(content, `${doc.name.toLowerCase().replace(/\s+/g, '_')}.pdf`, 'application/pdf');
  };

  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_DRIVERS.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.email.toLowerCase().includes(q) || 
      d.licenseNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getStatusBadge = (status: FleetStatus) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1.5";
    switch (status) {
      case FleetStatus.ACTIVE: 
        return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {status}
        </span>;
      case FleetStatus.SUSPENDED: 
        return <span className={`${base} bg-rose-50 text-rose-700 border-rose-100`}>
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> {status}
        </span>;
      case FleetStatus.TERMINATED: 
        return <span className={`${base} bg-slate-800 text-white border-slate-700`}>
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> {status}
        </span>;
      case FleetStatus.OFF_DUTY: 
        return <span className={`${base} bg-slate-100 text-slate-600 border-slate-200`}>
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> {status}
        </span>;
      default: 
        return <span className={`${base} bg-slate-50 text-slate-500 border-slate-100`}>{status}</span>;
    }
  };

  const getTruckUnit = (truckId?: string) => {
    if (!truckId) return 'N/A';
    return MOCK_TRUCKS.find(t => t.id === truckId)?.unitNumber || 'N/A';
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Max 10MB.');
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            setShowUploadModal(false);
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const getOrientationProgress = (driver: Driver) => {
    if (!driver.orientationModules || driver.orientationModules.length === 0) return 0;
    const completed = driver.orientationModules.filter(m => m.isCompleted).length;
    return Math.round((completed / driver.orientationModules.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-96 group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, or CDL#..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 group-hover:bg-white"
          />
          <span className="absolute left-3.5 top-3 text-slate-400">👤</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-300 hover:text-slate-500"
            >
              &times;
            </button>
          )}
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95">
          + Add New Driver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const progress = getOrientationProgress(driver);
          return (
            <div 
              key={driver.id} 
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => {
                setSelectedDriver(driver);
                setActiveTab('profile');
              }}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-50 transition-transform group-hover:scale-110"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white shadow-lg transition-transform group-hover:rotate-3">
                  {driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 truncate tracking-tight">{driver.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{driver.email}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                 {getStatusBadge(driver.status)}
                 <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Training</p>
                    <p className={`text-xs font-black ${progress === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{progress}%</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-700 ease-out shadow-sm ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Assigned Unit</p>
                    <p className="text-slate-900 font-black">{getTruckUnit(driver.assignedTruckId)}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Pay Basis</p>
                    <p className="text-slate-900 font-black">{(driver.payRate * 100).toFixed(0)}% Share</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDrivers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium">No drivers match your search criteria.</p>
          </div>
        )}
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-white/20">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-3xl font-black ring-4 ring-white/5 shadow-2xl">
                   {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">{selectedDriver.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded-lg text-slate-300 font-black uppercase tracking-widest">ID: {selectedDriver.id}</span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{selectedDriver.driverType}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="text-white/40 hover:text-white text-4xl font-light transition-colors relative z-10">&times;</button>
            </div>
            
            <div className="bg-slate-50/50 border-b border-slate-200 flex px-10 gap-2">
               {['profile', 'docs', 'orientation'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)} 
                  className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${
                    activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="p-10 overflow-y-auto max-h-[65vh] bg-white">
              {activeTab === 'profile' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    <section className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200"></span> Personal Detail
                      </h4>
                      <DetailRow label="Phone" value={selectedDriver.phone} />
                      <DetailRow label="Email" value={selectedDriver.email} />
                      <DetailRow label="Hire Date" value={selectedDriver.hireDate} />
                      <DetailRow label="DOB" value={selectedDriver.dob} />
                    </section>
                    <section className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200"></span> Documentation
                      </h4>
                      <DetailRow label="CDL Expiry" value={selectedDriver.cdlExpiration} />
                      <DetailRow label="Med Card" value={selectedDriver.medicalCardExpiration} />
                      <DetailRow label="License #" value={selectedDriver.licenseNumber} />
                      <DetailRow label="Hos Left" value={`${selectedDriver.hosRemaining}h`} />
                    </section>
                    <section className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200"></span> Earnings Basis
                      </h4>
                      <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                         <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mb-12 -mr-12 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                         <p className="text-4xl font-black tracking-tighter">{(selectedDriver.payRate * 100).toFixed(0)}%</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Current Revenue Split</p>
                      </div>
                    </section>
                  </div>

                  <section className="space-y-6 border-t border-slate-50 pt-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-px bg-slate-200"></span> Pay Rate History
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDriver.payRateHistory?.map((p) => (
                        <div key={p.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all">
                           <div>
                              <p className="text-sm font-black text-slate-900">{(p.rate * 100).toFixed(0)}% Revenue Share</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.reason} • {p.effectiveDate}</p>
                           </div>
                           <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">EFFECTIVE</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                       <h4 className="text-lg font-black text-slate-900">Document Vault</h4>
                       <p className="text-xs text-slate-500">Secure storage for driver qualifications and compliance.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setUploadError(null);
                        setShowUploadModal(true);
                      }} 
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                    >
                      + Upload New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDriver.documents?.map((doc) => (
                      <div key={doc.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between hover:border-blue-300 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">📄</div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.type} • {doc.uploadDate}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownloadDoc(doc)}
                          className="text-slate-300 hover:text-blue-600 text-2xl transition-colors"
                        >
                          ⬇
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orientation' && (
                <div className="space-y-10">
                  <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                     <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-2 tracking-tight">Orientation Progress</h4>
                        <p className="text-slate-400 text-sm max-w-md">The driver must complete all mandatory safety and compliance training modules before being assigned to high-value freight.</p>
                     </div>
                     <div className="text-right relative z-10">
                        <p className="text-6xl font-black text-blue-500 mb-2">{getOrientationProgress(selectedDriver)}%</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Certification</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedDriver.orientationModules?.map((module) => (
                      <div key={module.id} className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/30 shadow-sm hover:border-blue-400 hover:bg-white hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              module.category === 'FMCSA' ? 'bg-indigo-100 text-indigo-700' :
                              module.category === 'HOS' ? 'bg-blue-100 text-blue-700' :
                              module.category === 'Safety' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-700'
                           }`}>
                              {module.category}
                           </div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                             module.isCompleted ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-slate-200 text-slate-400'
                           }`}>
                             {module.isCompleted ? '✓' : '•'}
                           </div>
                        </div>
                        <h5 className="text-lg font-black text-slate-900 mb-4">{module.title}</h5>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed italic shadow-inner">
                          "{module.content}"
                        </div>
                        <div className="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
                           <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">Full Protocol ↗</button>
                           {module.isCompleted ? (
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">System Verified</span>
                           ) : (
                             <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all">Mark Complete</button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setSelectedDriver(null)} className="px-8 py-3.5 text-xs font-black text-slate-500 hover:bg-slate-200 rounded-2xl uppercase tracking-widest transition-all">Close Viewer</button>
              <button className="px-10 py-3.5 text-xs font-black bg-slate-900 text-white hover:bg-slate-800 rounded-2xl uppercase tracking-widest shadow-2xl shadow-slate-300 transition-all hover:scale-105 active:scale-95">Update Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black tracking-tight">Upload Driver Qualification</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-3xl font-light text-slate-300 hover:text-slate-600 transition-colors">&times;</button>
            </div>
            <div className="p-8 space-y-6">
              {uploadProgress !== null ? (
                <div className="space-y-6 py-10">
                   <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-blue-600 h-full transition-all duration-300 shadow-lg shadow-blue-200" style={{ width: `${uploadProgress}%` }}></div>
                   </div>
                   <p className="text-center text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">Encoding Data... {uploadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Category</label>
                    <select className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none appearance-none">
                      <option>License / CDL</option>
                      <option>Medical Certificate</option>
                      <option>W9 / Tax ID</option>
                      <option>Background Check</option>
                    </select>
                  </div>
                  
                  <label className="block p-12 bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] text-center group cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all">
                    <input type="file" className="hidden" onChange={handleSimulatedUpload} />
                    <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">☁️</span>
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Select File</p>
                    <p className="text-[10px] text-blue-400 mt-1 font-medium">PDF, JPG, PNG (Max 10MB)</p>
                  </label>

                  {uploadError && (
                    <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 text-center uppercase tracking-widest">
                      ⚠ {uploadError}
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
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
  <div className="flex justify-between items-center text-sm border-b border-slate-50 py-3.5 transition-colors hover:bg-slate-50/50">
    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{label}</span>
    <span className="text-slate-900 font-black tracking-tight">{value}</span>
  </div>
);

export default DriverView;
