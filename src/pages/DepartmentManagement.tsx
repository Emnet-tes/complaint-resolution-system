import { useEffect, useState } from 'react';
import { UserPlus, Shield, Loader2, User } from 'lucide-react';
import { orgAdminApi, type Department, type DeptAdmin } from '../api/orgadmin';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast'; 
import { useTranslation } from 'react-i18next';

const DepartmentManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'depts' | 'admins'>('depts');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<DeptAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', head: '' });
  const [adminForm, setAdminForm] = useState({ fullName: '', email: '', password: '', departmentId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, adminRes] = await Promise.all([
        orgAdminApi.listDepartments(),
        orgAdminApi.listDeptAdmins()
      ]);
      setDepartments(deptRes.data);
      setAdmins(adminRes.data);
    } catch (err: any) {
      toast.error(t('dept_mgmt.toasts.fetch_error')); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(t('dept_mgmt.toasts.creating_dept'));
    setLoading(true);
    try {
      const res = await orgAdminApi.createDepartment(deptForm);
      setDepartments([res.data, ...departments]);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', head: '' });
      toast.success(t('dept_mgmt.toasts.dept_success'), { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error', { id: loadingToast });
    } finally { setLoading(false); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(t('dept_mgmt.toasts.registering_admin'));
    setLoading(true);
    try {
      const res = await orgAdminApi.createDeptAdmin(adminForm);
      setAdmins([res.data, ...admins]);
      setIsAdminModalOpen(false);
      setAdminForm({ fullName: '', email: '', password: '', departmentId: '' });
      toast.success(t('dept_mgmt.toasts.admin_success'), { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error', { id: loadingToast });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dept_mgmt.nav')}</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('dept_mgmt.title')}</h1>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setIsDeptModalOpen(true)} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center hover:bg-slate-900 transition-all cursor-pointer shadow-lg">
                <Shield size={16} className="mr-2" /> {t('dept_mgmt.buttons.add_dept')}
            </button>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all cursor-pointer">
                <UserPlus size={16} className="mr-2" /> {t('dept_mgmt.buttons.add_admin')}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button onClick={() => setActiveTab('depts')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'depts' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>
          {t('dept_mgmt.tabs.depts')}
        </button>
        <button onClick={() => setActiveTab('admins')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'admins' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>
          {t('dept_mgmt.tabs.admins')}
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase font-black text-slate-400 tracking-tighter border-b border-gray-100">
            {activeTab === 'depts' ? (
              <tr>
                <th className="px-8 py-5">{t('dept_mgmt.table.dept')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.code')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.head')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.status')}</th>
              </tr>
            ) : (
              <tr>
                <th className="px-8 py-5">{t('dept_mgmt.table.name')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.email')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.unit')}</th>
                <th className="px-8 py-5">{t('dept_mgmt.table.role')}</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeTab === 'depts' ? (
              departments.map(dept => (
                <tr key={dept._id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-5 font-bold text-slate-800">{dept.name}</td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-500">{dept.code}</td>
                  <td className="px-8 py-5 text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-300" />
                       {dept.head || '—'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${dept.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {dept.isActive ? t('dept_mgmt.table.active') : t('dept_mgmt.table.inactive')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              admins.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-5 font-bold text-slate-800">{admin.fullName}</td>
                  <td className="px-8 py-5 text-slate-500 text-xs">{admin.email}</td>
                  <td className="px-8 py-5">
                      <span className="text-[10px] font-bold text-[#006B5D] bg-teal-50 px-2 py-1 rounded-lg">
                        {admin.department}
                      </span>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{admin.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE DEPARTMENT MODAL */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={t('dept_mgmt.modals.new_dept')}>
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.name')}</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" 
                placeholder={t('dept_mgmt.modals.placeholders.name')}
                value={deptForm.name} 
                onChange={e => setDeptForm({...deptForm, name: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.code')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono uppercase" placeholder={t('dept_mgmt.modals.placeholders.code')} value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.head')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm" placeholder={t('dept_mgmt.modals.placeholders.head')} value={deptForm.head} onChange={e => setDeptForm({...deptForm, head: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.desc')}</label>
            <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm min-h-[80px]" placeholder={t('dept_mgmt.modals.placeholders.desc')} value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : t('dept_mgmt.buttons.submit_dept')}
          </button>
        </form>
      </Modal>

      {/* CREATE ADMIN MODAL */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title={t('dept_mgmt.modals.new_admin')}>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.full_name')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder={t('dept_mgmt.modals.placeholders.holder')} value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.email')}</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.password')}</label>
            <input required type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.unit')}</label>
            <select required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm" value={adminForm.departmentId} onChange={e => setAdminForm({...adminForm, departmentId: e.target.value})}>
                <option value="">{t('dept_mgmt.modals.placeholders.choose')}</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e]">
             {loading ? <Loader2 className="animate-spin mx-auto" /> : t('dept_mgmt.buttons.submit_admin')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;