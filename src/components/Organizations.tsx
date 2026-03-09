import { Search, ExternalLink, Users, X, Plus } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState<any>(null); // State for side panel
  const [isAddOpen, setIsAddOpen] = useState(false); // State for modal
  
  const orgData = [
    { name: 'Water Department', id: 'ORG-001', cat: 'Utilities', count: '1,240', rate: '88%', color: 'bg-emerald-500', bg: 'bg-blue-50', icon: '💧' },
    { name: 'Road Maintenance', id: 'ORG-002', cat: 'Infrastructure', count: '2,305', rate: '45%', color: 'bg-red-500', bg: 'bg-orange-50', icon: '🛣️' },
    { name: 'Waste Management', id: 'ORG-005', cat: 'Sanitation', count: '3,120', rate: '91%', color: 'bg-emerald-500', bg: 'bg-emerald-50', icon: '♻️' },
  ];

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${selectedOrg ? 'mr-96' : 'mr-0'} p-6 space-y-6`}>
        <div className="flex justify-between items-end">
          <div>
            <nav className="text-xs text-slate-400 mb-2">Home &gt; Organizations</nav>
            <h1 className="text-2xl font-bold text-slate-800">Organization Management</h1>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#006B5D] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md hover:bg-[#005a4e]"
          >
            <Plus size={16} className="mr-2"/> Add Organization
          </button>
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center">
          <Search size={18} className="text-slate-400 mr-3" />
          <input placeholder="Search organizations by name or ID..." className="w-full text-sm outline-none" />
        </div>

        {/* Table - Row click updates selectedOrg */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-400 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Organization</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Category</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider text-center">Complaints</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Response Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgData.map((org, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedOrg(org)}
                  className={`cursor-pointer transition-colors ${selectedOrg?.id === org.id ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-4 ${org.bg}`}>{org.icon}</div>
                      <div>
                        <p className="font-bold text-slate-800">{org.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">ID: {org.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-slate-600 font-medium">{org.cat}</span></td>
                  <td className="px-6 py-5 text-center font-bold text-slate-700">{org.count}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${org.rate === '45%' ? 'text-red-500' : 'text-emerald-500'}`}>{org.rate}</span>
                      <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${org.color}`} style={{ width: org.rate }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Detail Panel - Only renders if selectedOrg exists */}
      {selectedOrg && (
        <div className="w-96 bg-white border-l border-gray-200 h-full fixed right-0 top-20 bottom-0 animate-in slide-in-from-right duration-300 shadow-xl z-10 overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Org Details</h3>
             <button onClick={() => setSelectedOrg(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          <div className="p-6 space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">{selectedOrg.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedOrg.name}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedOrg.id}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-gray-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center hover:bg-gray-50"><ExternalLink size={14} className="mr-2"/> View Profile</button>
              <button className="flex-1 py-2 border border-gray-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center hover:bg-gray-50"><Users size={14} className="mr-2"/> Manage Admins</button>
            </div>

            <section>
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-wider">Performance Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-medium text-slate-500">Resolved complaints</p>
                  <h3 className="text-xl font-bold text-slate-800 my-1">126</h3>
                  <p className="text-[10px] text-emerald-500 font-bold">▲ 12%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-medium text-slate-500">In progress</p>
                  <h3 className="text-xl font-bold text-slate-800 my-1">50</h3>
                </div>
              </div>
            </section>

            <section className="p-4 border border-gray-100 rounded-xl">
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3"><Users size={16}/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Auto-Assign</p>
                      <p className="text-[10px] text-slate-400">Route complaints to nearest unit</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
               </div>
            </section>

            <section>
               <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-wider">Recent Audit Log</h4>
               <div className="space-y-6">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-1 before:bottom-0 before:w-px before:bg-gray-100">
                    <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-xs font-bold text-slate-800">SLA Config Updated</p>
                    <p className="text-[10px] text-slate-400">Changed from 48h to 24h by Admin User</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">2 hours ago</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-xs font-bold text-slate-800">New Admin Added</p>
                    <p className="text-[10px] text-slate-400">Sarah J. added as Manager</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Yesterday</p>
                  </div>
               </div>
            </section>
          </div>
        </div>
      )}

      {/* Add Org Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Department">
         <form className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button className="w-full bg-[#006B5D] text-white py-2.5 rounded-xl font-bold mt-2">Submit Organization</button>
         </form>
      </Modal>
    </div>
  );
};

export default Organizations;