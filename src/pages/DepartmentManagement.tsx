
import { useEffect, useState } from 'react';
import { UserPlus, Shield, LayoutGrid, Users, Search, Filter, Edit3, Power, AlertTriangle, Loader2 } from 'lucide-react';
import { orgAdminApi, type Department, type DeptAdmin } from '../api/orgadmin';
import { Table, type Column } from '../components/Table';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast'; 
import { useTranslation } from 'react-i18next';

const DepartmentManagement = () => {
  const { t } = useTranslation();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'depts' | 'admins'>('depts');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<DeptAdmin[]>([]);

  // Tracking State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingHeadId, setEditingHeadId] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; type: 'dept' | 'head' } | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  // Form States
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', head: '' });
  const [adminForm, setAdminForm] = useState({ fullName: '', email: '', password: '', departmentId: '', isActive: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, adminRes] = await Promise.all([
        orgAdminApi.listDepartments(),
        orgAdminApi.listDeptHeads()
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

  // --- Filtering Logic ---
  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter((admin) => {
    const normalizedName = admin.fullName.toLowerCase();
    const normalizedDept = (
      typeof admin.department === 'object' ? admin.department?.name : admin.department
    )?.toLowerCase() || '';

    const nameMatches = normalizedName.includes(searchTerm.toLowerCase());
    const unitMatches = normalizedDept.includes(unitFilter.toLowerCase());

    return nameMatches && unitMatches;
  });


  // --- Handlers ---
  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadId = toast.loading(t('dept_mgmt.toasts.creating_dept'));
    try {
      if (editingDeptId) {
        const res = await orgAdminApi.updateDepartment(editingDeptId, {
          name: deptForm.name,
          code: deptForm.code,
          description: deptForm.description
        });
        setDepartments(departments.map((d) => d._id === editingDeptId ? res.data : d));
      } else {
        const res = await orgAdminApi.createDepartment(deptForm);
        setDepartments([res.data, ...departments]);
      }
      setIsDeptModalOpen(false);
      setEditingDeptId(null);
      setDeptForm({ name: '', code: '', description: '', head: '' });
      toast.success(editingDeptId ? t('dept_mgmt.toasts.dept_updated') : t('dept_mgmt.toasts.dept_success'), { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.generic_error'), { id: loadId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadId = toast.loading(t('dept_mgmt.toasts.registering_admin'));
    try {
      if (editingHeadId) {
        const res = await orgAdminApi.updateDeptHead(editingHeadId, {
          fullName: adminForm.fullName,
          email: adminForm.email,
          departmentId: adminForm.departmentId,
          isActive: adminForm.isActive
        });
        setAdmins(admins.map((a) => a._id === editingHeadId ? res.data : a));
      } else {
        const res = await orgAdminApi.createDeptHead({
          fullName: adminForm.fullName,
          email: adminForm.email,
          password: adminForm.password,
          departmentId: adminForm.departmentId
        });
        setAdmins([res.data, ...admins]);
      }
      setIsAdminModalOpen(false);
      setEditingHeadId(null);
      setAdminForm({ fullName: '', email: '', password: '', departmentId: '', isActive: true });
      toast.success(editingHeadId ? t('dept_mgmt.toasts.admin_updated') : t('dept_mgmt.toasts.admin_success'), { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.generic_error'), { id: loadId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateTarget) return;

    setSubmitting(true);
    const loadId = toast.loading(t('dept_mgmt.toasts.deactivating'));
    try {
      if (deactivateTarget.type === 'dept') {
        await orgAdminApi.deactivateDepartment(deactivateTarget.id);
        setDepartments(departments.map((d) => d._id === deactivateTarget.id ? { ...d, isActive: false } : d));
      } else {
        await orgAdminApi.deactivateDeptHead(deactivateTarget.id);
        setAdmins(admins.map((a) => a._id === deactivateTarget.id ? { ...a, isActive: false } : a));
      }
      setIsDeactivateModalOpen(false);
      setDeactivateTarget(null);
      toast.success(t('dept_mgmt.toasts.deactivated'), { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'), { id: loadId });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Columns ---
  const deptColumns: Column<Department>[] = [
    { header: t('dept_mgmt.table.dept'), key: 'name', className: 'font-bold text-slate-800' },
    { header: t('dept_mgmt.table.code'), key: 'code', className: 'font-mono text-xs text-slate-500 uppercase' },
    { 
      header: t('dept_mgmt.table.status'), 
      key: 'isActive',
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${row.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          {row.isActive ? t('dept_mgmt.table.active') : t('dept_mgmt.table.inactive')}
        </span>
      )
    },
    {
      header: t('dept_mgmt.table.actions'),
      key: 'actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingDeptId(row._id);
              setDeptForm({
                name: row.name,
                code: row.code,
                description: row.description,
                head: row.head || ''
              });
              setIsDeptModalOpen(true);
            }}
            className="p-2 text-slate-300 hover:text-slate-600 cursor-pointer"
          >
            <Edit3 size={16} />
          </button>
          {row.isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeactivateTarget({ id: row._id, type: 'dept' });
                setIsDeactivateModalOpen(true);
              }}
              className="p-2 text-slate-300 hover:text-red-500 cursor-pointer"
            >
              <Power size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const headColumns: Column<DeptAdmin>[] = [
    { header: t('dept_mgmt.table.name'), key: 'fullName', className: 'font-bold text-slate-800' },
    { header: t('dept_mgmt.table.email'), key: 'email', className: 'text-slate-500 text-xs' },
    { 
      header: t('dept_mgmt.table.unit'), 
      key: 'department',
      render: (row) => (
        <span className="text-[10px] font-bold text-[#006B5D] bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
          {typeof row.department === 'object' ? row.department?.name : (row.department || t('dept_mgmt.table.unassigned'))}
        </span>
      )
    },
    { header: t('dept_mgmt.table.role'), key: 'role', className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest' },
    {
      header: t('dept_mgmt.table.status'),
      key: 'isActive',
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${(row.isActive ?? true) ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          {(row.isActive ?? true) ? t('dept_mgmt.table.active') : t('dept_mgmt.table.inactive')}
        </span>
      )
    },
    {
      header: t('dept_mgmt.table.actions'),
      key: 'actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingHeadId(row._id);
              setAdminForm({
                fullName: row.fullName,
                email: row.email,
                password: '',
                departmentId: typeof row.department === 'object' ? row.department?._id || '' : '',
                isActive: row.isActive ?? true
              });
              setIsAdminModalOpen(true);
            }}
            className="p-2 text-slate-300 hover:text-slate-600 cursor-pointer"
          >
            <Edit3 size={16} />
          </button>
          {(row.isActive ?? true) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeactivateTarget({ id: row._id, type: 'head' });
                setIsDeactivateModalOpen(true);
              }}
              className="p-2 text-slate-300 hover:text-red-500 cursor-pointer"
            >
              <Power size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dept_mgmt.nav')}</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('dept_mgmt.title')}</h1>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { setEditingDeptId(null); setDeptForm({ name: '', code: '', description: '', head: '' }); setIsDeptModalOpen(true); }} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center hover:bg-slate-900 transition-all cursor-pointer shadow-lg">
                <Shield size={16} className="mr-2" /> {t('dept_mgmt.buttons.add_dept')}
            </button>
            <button onClick={() => { setEditingHeadId(null); setAdminForm({ fullName: '', email: '', password: '', departmentId: '', isActive: true }); setIsAdminModalOpen(true); }} className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all cursor-pointer">
                <UserPlus size={16} className="mr-2" /> {t('dept_mgmt.buttons.add_admin')}
            </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 w-fit shadow-sm">
            <button onClick={() => {setActiveTab('depts'); setSearchTerm(''); setUnitFilter('');}} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'depts' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={14} /> {t('dept_mgmt.tabs.depts')}
            </button>
            <button onClick={() => {setActiveTab('admins'); setSearchTerm(''); setUnitFilter('');}} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'admins' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'}`}>
                <Users size={14} /> {t('dept_mgmt.tabs.admins')}
            </button>
        </div>

        
      </div>
<div className="flex-1 flex flex-col sm:flex-row gap-2 w-1/2">
          
            {activeTab === 'admins' && (
              <>
               <div className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#006B5D]/10 transition-all">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    placeholder={t('dept_mgmt.filters.search_name')}
                    className="w-full text-sm outline-none font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#006B5D]/10 transition-all animate-in fade-in slide-in-from-left-2">
                    <Filter size={18} className="text-slate-400 mr-2" />
                    <input 
                        placeholder={t('dept_mgmt.filters.search_unit')}
                        className="w-full text-sm outline-none font-medium"
                        value={unitFilter}
                        onChange={(e) => setUnitFilter(e.target.value)}
                    />
                </div>
              </>
               
                
            )}
        </div>
      {activeTab === 'depts' ? (
        <Table<Department>
          loading={loading}
          data={filteredDepartments}
          columns={deptColumns}
          noDataMessage={t('dept_mgmt.table.no_data')}
        />
      ) : (
        <Table<DeptAdmin>
          loading={loading}
          data={filteredAdmins}
          columns={headColumns}
          noDataMessage={t('dept_mgmt.table.no_data')}
        />
      )}

      {/* Modal: New Department */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={editingDeptId ? t('dept_mgmt.modals.edit_dept', 'Edit Department') : t('dept_mgmt.modals.new_dept')}>
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.name')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#006B5D]/10 outline-none" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.code')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono uppercase outline-none" value={deptForm.code} onChange={e => setDeptForm({...deptForm, code: e.target.value})} />
          </div>
          {!editingDeptId && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.head')}</label>
              <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={deptForm.head} onChange={e => setDeptForm({...deptForm, head: e.target.value})} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.desc')}</label>
            <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm min-h-[80px] outline-none" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-all">
            {submitting ? <Loader2 className="animate-spin mx-auto" /> : editingDeptId ? t('dept_mgmt.buttons.update_dept') : t('dept_mgmt.buttons.submit_dept')}
          </button>
        </form>
      </Modal>

      {/* Modal: New Admin */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title={editingHeadId ? t('dept_mgmt.modals.edit_admin') : t('dept_mgmt.modals.new_admin')}>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.full_name')}</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.email')}</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
          </div>
          {!editingHeadId && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.password')}</label>
              <input required type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dept_mgmt.modals.labels.unit')}</label>
            <select required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer" value={adminForm.departmentId} onChange={e => setAdminForm({...adminForm, departmentId: e.target.value})}>
                <option value="">{t('dept_mgmt.modals.placeholders.choose', 'Select Unit')}</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          {editingHeadId && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                checked={adminForm.isActive}
                onChange={(e) => setAdminForm({ ...adminForm, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#006B5D]"
              />
              <label className="text-xs font-bold text-slate-600">{t('dept_mgmt.modals.labels.status_active')}</label>
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] cursor-pointer shadow-xl transition-all">
             {submitting ? <Loader2 className="animate-spin mx-auto" /> : editingHeadId ? t('dept_mgmt.buttons.update_admin') : t('dept_mgmt.buttons.submit_admin')}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title={t('dept_mgmt.modals.deactivate_title')}>
        <form onSubmit={handleDeactivate} className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              {deactivateTarget?.type === 'dept'
                ? t('dept_mgmt.modals.deactivate_dept_msg')
                : t('dept_mgmt.modals.deactivate_head_msg')}
            </p>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 cursor-pointer">
            {submitting ? <Loader2 className="animate-spin mx-auto" /> : t('dept_mgmt.buttons.deactivate')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;