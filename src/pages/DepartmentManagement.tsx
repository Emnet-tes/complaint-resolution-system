import { useEffect, useState } from 'react';
import { Search, UserPlus, Shield, Loader2, Trash2, ChevronDown, User } from 'lucide-react';
import { orgAdminApi, type Department, type DeptAdmin } from '../api/orgadmin';
import Modal from '../components/Modal';

const DepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState<'depts' | 'admins'>('depts');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<DeptAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forms
  // Note: head is now a simple string for the name
  const [deptForm, setDeptForm] = useState({ 
    name: '', 
    code: '', 
    description: '', 
    head: '' 
  });

  const [adminForm, setAdminForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    departmentId: '' 
  });

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
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // payload: { name, code, description, head (string) }
      const res = await orgAdminApi.createDepartment(deptForm);
      setDepartments([res.data, ...departments]);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', head: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating department');
    } finally { setLoading(false); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await orgAdminApi.createDeptAdmin(adminForm);
      setAdmins([res.data, ...admins]);
      setIsAdminModalOpen(false);
      setAdminForm({ fullName: '', email: '', password: '', departmentId: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating admin');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-tighter">Organization / Management</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Infrastructure</h1>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setIsDeptModalOpen(true)} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center hover:bg-slate-900 transition-all">
                <Shield size={16} className="mr-2" /> Add Department
            </button>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all">
                <UserPlus size={16} className="mr-2" /> Add Admin
            </button>
        </div>
      </div>

    

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button onClick={() => setActiveTab('depts')} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'depts' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>Departments</button>
        <button onClick={() => setActiveTab('admins')} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'admins' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>Department Admins</button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-slate-400">
            {activeTab === 'depts' ? (
              <tr>
                <th className="px-6 py-4">Department Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Head of Dept</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Assigned Dept</th>
                <th className="px-6 py-4">Role</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeTab === 'depts' ? (
              departments.map(dept => (
                <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{dept.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{dept.code}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-300" />
                       {dept.head || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${dept.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {dept.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              admins.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{admin.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{admin.email}</td>
                  <td className="px-6 py-4 font-medium text-[#006B5D] bg-teal-50/50">{admin.department}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{admin.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE DEPARTMENT MODAL */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="New Department">
          {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase">
          {error}
        </div>
      )}
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Department Name</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
                placeholder="e.g. Customer Service" 
                value={deptForm.name} 
                onChange={e => setDeptForm({...deptForm, name: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Department Code</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
                placeholder="e.g. CS_001" 
                value={deptForm.code} 
                onChange={e => setDeptForm({...deptForm, code: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Department Head Name</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
                placeholder="e.g. Johnathan Doe" 
                value={deptForm.head} 
                onChange={e => setDeptForm({...deptForm, head: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
            <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10 min-h-[80px]" 
                placeholder="Briefly describe department responsibilities..." 
                value={deptForm.description} 
                onChange={e => setDeptForm({...deptForm, description: e.target.value})} 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Department'}
          </button>
        </form>
      </Modal>

      {/* CREATE ADMIN MODAL */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="New Department Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="Account Holder Name" value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Email Address</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="admin@organization.com" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">System Password</label>
            <input required type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Assign to Department</label>
            <select required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.departmentId} onChange={e => setAdminForm({...adminForm, departmentId: e.target.value})}>
                <option value="">Choose Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all shadow-lg shadow-teal-900/20">
             {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Register Admin'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;