import { useEffect, useState } from 'react';
import { UserPlus, Shield, Loader2, User } from 'lucide-react';
import { orgAdminApi, type Department, type DeptAdmin } from '../api/orgadmin';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast'; 

const DepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState<'depts' | 'admins'>('depts');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<DeptAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms
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
      toast.error('Failed to sync system data'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating department...'); // 3. Loading toast
    setLoading(true);
    try {
      const res = await orgAdminApi.createDepartment(deptForm);
      setDepartments([res.data, ...departments]);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', head: '' });
      toast.success('Department created successfully!', { id: loadingToast }); // 4. Success toast
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error creating department';
      toast.error(msg, { id: loadingToast }); // 5. Error toast
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Registering admin...');
    setLoading(true);
    try {
      const res = await orgAdminApi.createDeptAdmin(adminForm);
      setAdmins([res.data, ...admins]);
      setIsAdminModalOpen(false);
      setAdminForm({ fullName: '', email: '', password: '', departmentId: '' });
      toast.success('Admin registered successfully!', { id: loadingToast });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error creating admin';
      toast.error(msg, { id: loadingToast });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Organization / Management</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Infrastructure</h1>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setIsDeptModalOpen(true)} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center hover:bg-slate-900 transition-all cursor-pointer shadow-lg">
                <Shield size={16} className="mr-2" /> Add Department
            </button>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all cursor-pointer">
                <UserPlus size={16} className="mr-2" /> Add Admin
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button onClick={() => setActiveTab('depts')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'depts' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>Departments</button>
        <button onClick={() => setActiveTab('admins')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'admins' ? 'border-b-2 border-[#006B5D] text-[#006B5D]' : 'text-slate-400'}`}>Staff Admins</button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase font-black text-slate-400 tracking-tighter border-b border-gray-100">
            {activeTab === 'depts' ? (
              <tr>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Code</th>
                <th className="px-8 py-5">Head of Dept</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            ) : (
              <tr>
                <th className="px-8 py-5">Full Name</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5">Assigned Unit</th>
                <th className="px-8 py-5">Role</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && departments.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin inline text-teal-600"/></td></tr>
            ) : activeTab === 'depts' ? (
              departments.map(dept => (
                <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
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
                      {dept.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              admins.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-800">{admin.fullName}</td>
                  <td className="px-8 py-5 text-slate-500 text-xs">{admin.email}</td>
                  <td className="px-8 py-5">
                      <span className="text-[10px] font-bold text-[#006B5D] bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
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
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="New Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Name</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
                placeholder="e.g. Finance" 
                value={deptForm.name} 
                onChange={e => setDeptForm({...deptForm, name: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Code</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[#006B5D]/10 uppercase" 
                placeholder="e.g. FIN_01" 
                value={deptForm.code} 
                onChange={e => setDeptForm({...deptForm, code: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Head Name</label>
            <input 
                required 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
                placeholder="e.g. John Doe" 
                value={deptForm.head} 
                onChange={e => setDeptForm({...deptForm, head: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overview</label>
            <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10 min-h-[80px]" 
                placeholder="Responsibilities..." 
                value={deptForm.description} 
                onChange={e => setDeptForm({...deptForm, description: e.target.value})} 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'create Department'}
          </button>
        </form>
      </Modal>

      {/* CREATE ADMIN MODAL */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="New Dept Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <input required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Account Holder" value={adminForm.fullName} onChange={e => setAdminForm({...adminForm, fullName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" placeholder="admin@org.com" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Password</label>
            <input required type="password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Unit</label>
            <select required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer" value={adminForm.departmentId} onChange={e => setAdminForm({...adminForm, departmentId: e.target.value})}>
                <option value="">Choose Unit</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#005a4e] transition-all shadow-xl shadow-teal-900/20 cursor-pointer">
             {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirm Access'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;