import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Loader2, X, Edit3, Power, ChevronRight, AlertTriangle
} from 'lucide-react';
import Modal from '../components/Modal';
import { sysAdminApi, type Organization, type OrgAdmin, type OrgHead } from '../api/sysadmin';
import toast from 'react-hot-toast';

const Organizations = () => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allAdmins, setAllAdmins] = useState<OrgAdmin[]>([]);
  const [allHeads, setAllHeads] = useState<OrgHead[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Control
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  
  // Tracking
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [accountModalRole, setAccountModalRole] = useState<'admin' | 'head'>('admin');
  const [sideViewFilter, setSideViewFilter] = useState<'all' | 'admin' | 'head'>('all');
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string, type: 'org' | 'admin' | 'head' } | null>(null);

  // Form States
  const [orgForm, setOrgForm] = useState({ name: '', code: '', isActive: true });
  const [adminForm, setAdminForm] = useState({ fullName: '', email: '', password: '' });
  const [deactivateReason, setDeactivateReason] = useState('');

  const fetchData = async () => {
    try {
      const [orgRes, adminRes, headRes] = await Promise.all([
        sysAdminApi.listOrganizations(),
        sysAdminApi.listOrgAdmins(),
        sysAdminApi.listOrgHeads()
      ]);
      setOrganizations(orgRes.data);
      setAllAdmins(adminRes.data);
      setAllHeads(headRes.data);
    } catch (err) { toast.error(t('toasts.fetch_error', 'Failed to sync system data.')); }    
  };

  useEffect(() => { fetchData(); }, []);

  const selectedOrgAdmins = allAdmins.filter(a => a.organization?._id === selectedOrg?._id);
  const selectedOrgHeads = allHeads.filter(h => h.organization?._id === selectedOrg?._id);
  const selectedOrgMembers = [
    ...selectedOrgAdmins.map((admin) => ({ ...admin, accountType: 'admin' as const })),
    ...selectedOrgHeads.map((head) => ({ ...head, accountType: 'head' as const }))
  ];

  const visibleOrgMembers = selectedOrgMembers.filter(member => {
    if (sideViewFilter === 'all') return true;
    return member.accountType === sideViewFilter;
  });

  // --- HANDLERS ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setSubmitting(true);
    try {
      if (editingAdminId) {
        if (accountModalRole === 'admin') {
          const res = await sysAdminApi.updateOrgAdmin(editingAdminId, { fullName: adminForm.fullName, email: adminForm.email });
          const updatedAdmin = { ...res.data, organization: typeof res.data.organization === 'string' ? selectedOrg : res.data.organization };
          setAllAdmins(allAdmins.map(a => a._id === editingAdminId ? updatedAdmin : a));
          toast.success(t('toasts.admin_updated', 'Admin updated successfully!'));
        } else {
          const res = await sysAdminApi.updateOrgHead(editingAdminId, {
            fullName: adminForm.fullName,
            email: adminForm.email,
            organizationId: selectedOrg._id
          });
          const updatedHead = { ...res.data, organization: typeof res.data.organization === 'string' ? selectedOrg : res.data.organization };
          setAllHeads(allHeads.map(h => h._id === editingAdminId ? updatedHead : h));
          toast.success(t('orgs.toasts.head_updated', 'Head updated successfully!'));
        }
      } else if (accountModalRole === 'head') {
        const res = await sysAdminApi.createOrgHead({ ...adminForm, organizationId: selectedOrg._id });
        const newHead = { ...res.data, organization: typeof res.data.organization === 'string' ? selectedOrg : res.data.organization };
        setAllHeads([newHead, ...allHeads]);
        toast.success(t('orgs.toasts.head_created', 'Head created successfully!'));
      } else {
        const res = await sysAdminApi.createOrgAdmin({ ...adminForm, organizationId: selectedOrg._id });
        const newAdmin = { ...res.data, organization: typeof res.data.organization === 'string' ? selectedOrg : res.data.organization };
        setAllAdmins([newAdmin, ...allAdmins]);
        toast.success(t('toasts.admin_created', 'Admin created successfully!'));
      }
      setIsAdminModalOpen(false);
      setEditingAdminId(null);
    } catch (err: any) { toast.error(err.response?.data?.message || t('toasts.error', 'Action failed.')); }
    finally { setSubmitting(false); }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOrgId) {
        const res = await sysAdminApi.updateOrganization(editingOrgId, orgForm);
        setOrganizations(organizations.map(o => o._id === editingOrgId ? res.data : o));
        if (selectedOrg?._id === editingOrgId) setSelectedOrg(res.data);
        toast.success(t('toasts.org_updated', 'Organization updated successfully!'));
      } else {
        const res = await sysAdminApi.createOrganization({ name: orgForm.name, code: orgForm.code });
        setOrganizations([res.data, ...organizations]);
        toast.success(t('toasts.org_created', 'Organization created successfully!'));
      }
      setIsOrgModalOpen(false);
      setEditingOrgId(null);
    } catch (err: any) { toast.error(err.response?.data?.message || t('toasts.error', 'Action failed.')); }
    finally { setSubmitting(false); }
  };

  const handleDeactivateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateTarget) return;
    setSubmitting(true);
    try {
      if (deactivateTarget.type === 'org') {
        await sysAdminApi.deactivateOrganization(deactivateTarget.id, { message: deactivateReason });
        setOrganizations(organizations.map(o => o._id === deactivateTarget.id ? { ...o, isActive: false } : o));
        if (selectedOrg?._id === deactivateTarget.id) setSelectedOrg({ ...selectedOrg, isActive: false });
      } else if (deactivateTarget.type === 'admin') {
        await sysAdminApi.deactivateOrgAdmin(deactivateTarget.id, { message: deactivateReason });
        setAllAdmins(allAdmins.map(a => a._id === deactivateTarget.id ? { ...a, isActive: false } : a));
      } else {
        await sysAdminApi.deactivateOrgHead(deactivateTarget.id, { message: deactivateReason });
        setAllHeads(allHeads.map(h => h._id === deactivateTarget.id ? { ...h, isActive: false } : h));
      }
      setIsDeactivateModalOpen(false);
      setDeactivateReason('');
      toast.success(t('toasts.deactivated', 'Deactivated successfully'));
    } catch (err) { toast.error(t('toasts.error', 'Action failed.')); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-gray-50/30">
      <div className={`flex-1 transition-all duration-500 ${selectedOrg ? 'mr-[400px]' : 'mr-0'} p-8`}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('orgs.title')}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('orgs.subtitle')}</p>
          </div>
          <button onClick={() => { setEditingOrgId(null); setOrgForm({name:'', code:'', isActive: true}); setIsOrgModalOpen(true); }} className="bg-[#006B5D] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center shadow-lg shadow-teal-900/20 hover:bg-[#005a4e] transition-all cursor-pointer">
            <Plus size={18} className="mr-2"/> {t('orgs.btn_new')}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">{t('orgs.table.name')}</th>
                <th className="px-8 py-5">{t('orgs.table.code')}</th>
                <th className="px-8 py-5">{t('orgs.table.status')}</th>
                <th className="px-8 py-5 text-right">{t('orgs.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {organizations.map((org) => (
                <tr key={org._id} className={`transition-all ${selectedOrg?._id === org._id ? 'bg-teal-50/40' : 'hover:bg-gray-50'}`}>
                  <td className="px-8 py-5 font-bold text-slate-800">{org.name}</td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-500">{org.code}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${org.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {org.isActive ? t('orgs.table.active') : t('orgs.table.inactive')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => setSelectedOrg(org)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-[#006B5D] hover:bg-[#006B5D] hover:text-white transition-all shadow-sm cursor-pointer">
                       {t('orgs.table.details')} <ChevronRight size={12}/>
                    </button>
                    <button onClick={() => { setEditingOrgId(org._id); setOrgForm({name: org.name, code: org.code, isActive: org.isActive}); setIsOrgModalOpen(true); }} className="p-2 text-slate-300 hover:text-slate-600 cursor-pointer"><Edit3 size={16}/></button>
                    {org.isActive && (
                      <button onClick={() => { setDeactivateTarget({id: org._id, type:'org'}); setIsDeactivateModalOpen(true); }} className="p-2 text-slate-300 hover:text-red-500 cursor-pointer"><Power size={16}/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Detail Panel */}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-100 shadow-2xl z-50 transform transition-transform duration-500 flex flex-col ${selectedOrg ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedOrg && (
          <>
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-xl font-black text-slate-800">{selectedOrg.name}</h2>
              <button onClick={() => setSelectedOrg(null)} className="p-2 text-slate-400 hover:bg-white rounded-xl cursor-pointer"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.side.accounts', 'Accounts')}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingAdminId(null); setAccountModalRole('admin'); setAdminForm({fullName:'', email:'', password:''}); setIsAdminModalOpen(true); }} className="text-[10px] font-black text-[#006B5D] uppercase cursor-pointer">+ {t('orgs.side.create_admin', 'Admin')}</button>
                  <button onClick={() => { setEditingAdminId(null); setAccountModalRole('head'); setAdminForm({fullName:'', email:'', password:''}); setIsAdminModalOpen(true); }} className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">+ {t('orgs.side.create_head', 'Head')}</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSideViewFilter('all')} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${sideViewFilter === 'all' ? 'bg-[#006B5D] text-white border-[#006B5D]' : 'bg-white text-slate-500 border-gray-200 hover:border-[#006B5D] hover:text-[#006B5D]'}`}>
                  {t('orgs.side.filter_all', 'All')}
                </button>
                <button onClick={() => setSideViewFilter('admin')} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${sideViewFilter === 'admin' ? 'bg-[#006B5D] text-white border-[#006B5D]' : 'bg-white text-slate-500 border-gray-200 hover:border-[#006B5D] hover:text-[#006B5D]'}`}>
                  {t('orgs.side.filter_admin', 'Admins')}
                </button>
                <button onClick={() => setSideViewFilter('head')} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${sideViewFilter === 'head' ? 'bg-[#006B5D] text-white border-[#006B5D]' : 'bg-white text-slate-500 border-gray-200 hover:border-[#006B5D] hover:text-[#006B5D]'}`}>
                  {t('orgs.side.filter_head', 'Heads')}
                </button>
              </div>
              <div className="space-y-3">
                {visibleOrgMembers.map(member => (
                  <div key={`${member.accountType}-${member._id}`} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.fullName}</p>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                          {member.accountType === 'admin' ? t('orgs.side.filter_admin', 'Admins') : t('orgs.side.filter_head', 'Heads')}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${member.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {member.isActive ? t('orgs.table.active') : t('orgs.table.inactive')}
                        </span>
                      </div>
                    </div>
                    {member.accountType === 'admin' ? (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingAdminId(member._id); setAccountModalRole('admin'); setAdminForm({fullName: member.fullName, email: member.email, password: ''}); setIsAdminModalOpen(true); }} className="flex-1 bg-white border border-gray-100 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-gray-100 flex items-center justify-center gap-1 cursor-pointer"><Edit3 size={12}/> {t('orgs.side.edit')}</button>
                        {member.isActive && (
                          <button onClick={() => { setDeactivateTarget({id: member._id, type:'admin'}); setIsDeactivateModalOpen(true); }} className="flex-1 bg-white border border-red-50 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer"><Power size={12}/> {t('orgs.side.suspend')}</button>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingAdminId(member._id); setAccountModalRole('head'); setAdminForm({fullName: member.fullName, email: member.email, password: ''}); setIsAdminModalOpen(true); }} className="flex-1 bg-white border border-gray-100 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-gray-100 flex items-center justify-center gap-1 cursor-pointer"><Edit3 size={12}/> {t('orgs.side.edit')}</button>
                        {member.isActive && (
                          <button onClick={() => { setDeactivateTarget({id: member._id, type:'head'}); setIsDeactivateModalOpen(true); }} className="flex-1 bg-white border border-red-50 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer"><Power size={12}/> {t('orgs.side.suspend')}</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} title={editingOrgId ? t('orgs.modals.org_edit') : t('orgs.modals.org_new')}>
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.name')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.code')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono uppercase outline-none" value={orgForm.code} onChange={e => setOrgForm({ ...orgForm, code: e.target.value })} />
          </div>
          {editingOrgId && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
               <input type="checkbox" checked={orgForm.isActive} onChange={e => setOrgForm({...orgForm, isActive: e.target.checked})} className="w-4 h-4 accent-[#006B5D]"/>
               <label className="text-xs font-bold text-slate-600">{t('orgs.labels.status_active')}</label>
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer">{submitting ? <Loader2 className="animate-spin mx-auto"/> : t('orgs.btns.save')}</button>
        </form>
      </Modal>

      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title={editingAdminId ? (accountModalRole === 'head' ? t('orgs.modals.head_edit', 'Edit Head') : t('orgs.modals.admin_edit')) : accountModalRole === 'head' ? t('orgs.modals.head_new', 'New Head') : t('orgs.modals.admin_new')}>
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.full_name')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.email')}</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
          </div>
          {!editingAdminId && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.password')}</label>
              <input required type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer">{submitting ? <Loader2 className="animate-spin mx-auto"/> : t('orgs.btns.confirm')}</button>
        </form>
      </Modal>

      <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title={t('orgs.modals.deactivate_title')}>
        <form onSubmit={handleDeactivateConfirm} className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <AlertTriangle className="text-amber-600 shrink-0" size={24}/>
             <p className="text-xs font-bold text-amber-800 leading-relaxed">
               {t('orgs.modals.warning', { type: deactivateTarget?.type === 'org' ? t('orgs.modals.type_org') : t('orgs.modals.type_admin') })}
             </p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('orgs.labels.reason')}</label>
            <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none" placeholder={t('orgs.labels.reason_placeholder')} value={deactivateReason} onChange={e => setDeactivateReason(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 cursor-pointer">
            {submitting ? <Loader2 className="animate-spin mx-auto"/> : t('orgs.btns.deactivate')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Organizations;