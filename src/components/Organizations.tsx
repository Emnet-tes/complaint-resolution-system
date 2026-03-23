import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, X, ExternalLink, Users, BarChart } from 'lucide-react';
import Modal from './Modal';

const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [orgs, setOrgs] = useState([
    { id: 'ORG-001', name: 'Water Department', category: 'Utilities', complaints: 1240, rate: '88%', status: 'Active', icon: '💧', bg: 'bg-blue-50' },
    { id: 'ORG-002', name: 'Road Maintenance', category: 'Infrastructure', complaints: 2305, rate: '45%', status: 'Warning', icon: '🛣️', bg: 'bg-orange-50' },
    { id: 'ORG-005', name: 'Waste Management', category: 'Sanitation', complaints: 3120, rate: '91%', status: 'Active', icon: '♻️', bg: 'bg-emerald-50' },
    { id: 'ORG-009', name: 'Electricity Authority', category: 'Utilities', complaints: 890, rate: '72%', status: 'Active', icon: '⚡', bg: 'bg-yellow-50' },
  ]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this organization?")) {
      setOrgs(orgs.filter(o => o.id !== id));
      if(selectedOrg?.id === id) setSelectedOrg(null);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main List Area */}
      <div className={`flex-1 transition-all duration-300 ${selectedOrg ? 'mr-100' : 'mr-0'} p-6 space-y-6`}>
        <div className="flex justify-between items-end">
          <div>
            <nav className="text-xs text-slate-400 mb-1">System Admin / Governance</nav>
            <h1 className="text-2xl font-bold text-slate-800">Organization Management</h1>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e]"
          >
            <Plus size={18} className="mr-2"/> Register Org
          </button>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <Search size={18} className="text-slate-400 mr-3" />
          <input placeholder="Search organizations by name, ID or category..." className="w-full text-sm outline-none" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Organization</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Category</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest text-center">Complaints</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Performance</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgs.map((org) => (
                <tr 
                  key={org.id} 
                  onClick={() => setSelectedOrg(org)}
                  className={`group cursor-pointer transition-all ${selectedOrg?.id === org.id ? 'bg-teal-50/50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 shadow-sm border border-white ${org.bg}`}>{org.icon}</div>
                      <div>
                        <p className="font-bold text-slate-800">{org.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{org.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                      {org.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-700">{org.complaints.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold ${org.status === 'Warning' ? 'text-orange-500' : 'text-emerald-500'}`}>{org.rate}</span>
                      <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${org.status === 'Warning' ? 'bg-orange-400' : 'bg-emerald-500'}`} style={{ width: org.rate }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                      <button 
                        onClick={(e) => handleDelete(org.id, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Detail Panel */}
      {selectedOrg && (
        <div className="w-100 bg-white border-l border-gray-200 h-full fixed right-0 top-20 bottom-0 animate-in slide-in-from-right duration-300 shadow-2xl z-40 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Organization Detail</h3>
             <button onClick={() => setSelectedOrg(null)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-slate-600"><X size={18}/></button>
          </div>
          
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-4 border-white ${selectedOrg.bg}`}>
                {selectedOrg.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedOrg.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrg.id}</span>
                  <div className={`w-2 h-2 rounded-full ${selectedOrg.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedOrg.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-white transition-all">
                <Users size={14} className="mr-2 text-[#006B5D]"/> Manage Admins
              </button>
              <button className="flex items-center justify-center py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-white transition-all">
                <ExternalLink size={14} className="mr-2 text-[#006B5D]"/> Full Profile
              </button>
            </div>

            <section className="space-y-4">
               <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b pb-2">Compliance Metrics</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100">
                    <p className="text-[10px] font-bold text-teal-600 uppercase">Response Rate</p>
                    <h3 className="text-2xl font-black text-[#006B5D] mt-1">{selectedOrg.rate}</h3>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{selectedOrg.complaints}</h3>
                 </div>
               </div>
            </section>

            <section className="space-y-4">
               <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest border-b pb-2">Active Configuration</h4>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg shadow-sm mr-3"><BarChart size={16} className="text-[#006B5D]"/></div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Auto-Escalation</p>
                      <p className="text-[9px] text-slate-400">Triggered after 48h idle</p>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-[#006B5D] rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
               </div>
            </section>
          </div>

          <div className="p-6 border-t bg-slate-50 flex gap-4">
             <button className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center">
               <Trash2 size={14} className="mr-2"/> Deactivate Org
             </button>
             <button className="flex-1 py-3 bg-[#006B5D] text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-colors">
               Save Settings
             </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Organization">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Organization Name</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" placeholder="Enter name..." />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ID Code</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" placeholder="ORG-XXX" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
                <option>Utilities</option>
                <option>Security</option>
                <option>Infrastructure</option>
              </select>
            </div>
          </div>
          <button className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-teal-900/20 mt-4 hover:bg-[#005a4e] transition-all transform active:scale-[0.98]">
            Complete Registration
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Organizations;