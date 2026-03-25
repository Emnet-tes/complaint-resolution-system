import { useEffect, useState } from 'react';
import { Search, X, UserPlus, Shield, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orgAdminApi, type Department } from '../api/orgadmin';

// Reusable Modal
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md z-10 relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Users = () => {
  const { user: currentUser } = useAuth();
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
  });

  const isOrgAdmin = currentUser?.role === 'OrgAdmin';

  // Fetch departments when OrgAdmin opens page
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!currentUser || !isOrgAdmin) return;
      setIsDeptLoading(true);
      setDeptError('');
      try {
        const res = await orgAdminApi.listDepartments();
        setDepartments(res.data as Department[]);
      } catch (err: any) {
        const msg = err.response?.data?.message;
        setDeptError(typeof msg === 'string' ? msg : 'Failed to load departments.');
      } finally {
        setIsDeptLoading(false);
      }
    };

    fetchDepartments();
  }, [currentUser, isOrgAdmin]);

  // HANDLE DEPARTMENT CREATE (OrgAdmin)
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeptLoading(true);
    setDeptError('');
    try {
      const res = await orgAdminApi.createDepartment(deptForm);
      const created = res.data as Department;
      setDepartments([created, ...departments]);
      setDeptForm({ name: '', code: '', description: '', head: '' });
      alert('Department created successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setDeptError(typeof msg === 'string' ? msg : 'Failed to create department. Please try again.');
    } finally {
      setIsDeptLoading(false);
    }
  };

  const handleDeactivateDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await orgAdminApi.deactivateDepartment(id);
      setDepartments(departments.map((d) => (d._id === id ? { ...d, isActive: false } : d)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate department.');
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className="flex-1 p-6">
         <div className="flex justify-between items-end">
            <div>
              <nav className="text-xs text-slate-400 mb-1">Organization / Departments</nav>
              <h1 className="text-2xl font-bold text-slate-800">Department Management</h1>
            </div>
            
            {isOrgAdmin && (
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all"
              >
                <UserPlus size={18} className="mr-2" />
                Add Department
              </button>
            )}
         </div>

        <div className="flex gap-4 mt-6">
           <div className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center">
             <Search size={18} className="text-slate-400 mr-3" />
             <input placeholder={`Search by name or email...`} className="w-full text-sm outline-none" />
           </div>
           <button className="bg-white px-6 border border-gray-100 rounded-xl text-xs font-bold text-slate-600 flex items-center hover:bg-gray-50">
             All Roles <ChevronDown size={14} className="ml-4"/>
           </button>
        </div>
         
         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-slate-400 font-medium border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Name</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Code</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Head</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {departments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-slate-800">{dept.name}</td>
                      <td className="px-6 py-4 text-slate-500">{dept.code}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {typeof dept.head === 'string'
                          ? dept.head || '—'
                          : dept.head?.fullName || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                          dept.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-gray-50 border-gray-100'
                        }`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {dept.isActive && (
                          <button
                            onClick={() => handleDeactivateDepartment(dept._id)}
                            className="ml-2 text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg border border-red-100 text-red-500 bg-red-50 hover:bg-red-100"
                          >
                            <Trash2 size={12} /> Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* DEPARTMENTS MODAL (OrgAdmin) */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="create new department"
      >
        <div className="space-y-6">
          {deptError && (
            <div className="p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100">
              {typeof deptError === 'string' ? deptError : JSON.stringify(deptError)}
            </div>
          )}  

          <form onSubmit={handleCreateDepartment} className="space-y-3 ">

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Name</label>
              <input
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10"
                placeholder="EEP - Customer Service"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Code</label>
              <input
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10"
                placeholder="CS_EEP"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Description</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10 min-h-[70px]"
                placeholder="Handles billing, outages, meter issues, and general complaints."
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Head</label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10"
                placeholder="Full name of department head"
                value={deptForm.head}
                onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isDeptLoading}
              className="w-full bg-[#006B5D] text-white py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all disabled:opacity-50"
            >
              {isDeptLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Shield className="mr-2" size={18} />
                  Create Department
                </>
              )}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Users;