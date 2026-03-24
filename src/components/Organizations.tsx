import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, ExternalLink, Users, BarChart, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { sysAdminApi } from '../api/sysadmin';

const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false);

  // Data States
  const [admins, setAdmins] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  
  // Logic States
  const [isInitialLoading, setIsInitialLoading] = useState(false); // For list fetching
  const [isSubmitting, setIsSubmitting] = useState(false);       // For form posting
  const [error, setError] = useState('');

  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    organization: '',
  });

  // 1. Fetch data on page load
  const fetchData = async () => {
    setIsInitialLoading(true);
    setError('');
    try {
      // listUsers returns all users; filter for OrgAdmins
      const res = await sysAdminApi.listUsers();
      const data = res.data as any[];
      const orgAdmins = data.filter((u) => u.role === 'OrgAdmin');
      setAdmins(orgAdmins);

      const derivedOrgs = orgAdmins.map((admin) => ({
        id: admin.organization,
        name: admin.organization,
        fullName: admin.fullName || admin.organization ,
        complaints: 0,
        rate: '—',
        icon: admin.organization === 'EEP' ? '⚡' : '🏛️',
        bg: admin.organization === 'EEP' ? 'bg-yellow-50' : 'bg-blue-50',
      }));

      setOrgs(derivedOrgs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Clear errors when modals open/close
  useEffect(() => {
    if (!isAddModalOpen && !isAdminsModalOpen) {
      setError('');
      setIsSubmitting(false);
    }
  }, [isAddModalOpen, isAdminsModalOpen]);

  const handleCreateOrgAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        fullName: adminForm.fullName,
        email: adminForm.email,
        password: adminForm.password,
        organization: adminForm.organization,
      };
      const res = await sysAdminApi.createOrgAdmin(payload);
      const createdUser = res.data;
      
      // Update local state immediately for a smooth UI
      setAdmins((prev) => [createdUser, ...prev]);
      
      // Reset form and close
      setAdminForm({ fullName: '', email: '', password: '', organization: '' });
      setIsAddModalOpen(false);
      setIsAdminsModalOpen(false);
      alert("Org Admin added successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <input placeholder="Search organizations..." className="w-full text-sm outline-none" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 uppercase text-[10px]">Organization</th>
                <th className="px-6 py-4 uppercase text-[10px]">Full Name</th>
                <th className="px-6 py-4 uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isInitialLoading ? (
                <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading...</td></tr>
              ) : orgs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No organizations registered yet.</td></tr>
              ) : (
                orgs.map((org) => (
                  <tr key={org.id} onClick={() => setSelectedOrg(org)} className={`group cursor-pointer transition-all ${selectedOrg?.id === org.id ? 'bg-teal-50/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-5 font-bold text-slate-800">{org.name}</td>
                    <td className="px-6 py-5">{org.fullName}</td>
                    <td className="px-6 py-5 text-right">
                       <button onClick={(e) => handleDelete(org.id, e)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Detail Panel (Simplified for brevity, keep your existing logic) */}
      {selectedOrg && (
        <div className="w-100 bg-white border-l border-gray-200 h-full fixed right-0 top-20 z-40 flex flex-col shadow-2xl">
           {/* ... Header and Info ... */}
           <div className="p-8 space-y-4">
              <button 
                onClick={() => setIsAdminsModalOpen(true)}
                className="w-full flex items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                <Users size={14} className="mr-2 text-[#006B5D]"/> Manage Admins
              </button>
           </div>
        </div>
      )}

      {/* Register / Create Admin Modal */}
      <Modal 
        isOpen={isAddModalOpen || isAdminsModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setIsAdminsModalOpen(false);
        }} 
        title={isAdminsModalOpen ? `Manage Admins • ${selectedOrg?.name}` : "Register New Org Admin"}
      >
        <form className="space-y-4" onSubmit={handleCreateOrgAdmin}>
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
            <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" value={adminForm.fullName} onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
            <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
            <input type="password" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Organization Name</label>
            <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none" placeholder="e.g. EEP" value={adminForm.organization} onChange={(e) => setAdminForm({ ...adminForm, organization: e.target.value })} />
          </div>

          <button
            type="submit"
            className="w-full bg-[#006B5D] text-white py-3 rounded-xl font-bold text-sm shadow-xl mt-2 hover:bg-[#005a4e] disabled:opacity-60 flex items-center justify-center transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18}/>
                Saving...
              </>
            ) : 'Register Org Admin'}
          </button>

          {/* List existing admins for that org if needed (optional) */}
          {isAdminsModalOpen && (
            <div className="mt-6 pt-4 border-t">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Existing Admins</h4>
               <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {admins.filter(a => a.organization === selectedOrg?.name).map(a => (
                    <li key={a._id} className="text-xs p-2 bg-slate-50 rounded flex justify-between">
                      <span className="font-bold">{a.fullName}</span>
                      <span className="text-slate-400">{a.email}</span>
                    </li>
                  ))}
               </ul>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Organizations;