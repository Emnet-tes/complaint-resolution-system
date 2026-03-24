import { useState } from 'react';
import { Search, X, ChevronDown, UserPlus, Shield, Loader2, Trash2 } from 'lucide-react';
import { useAuth, type Role } from '../context/AuthContext';
import { authApi } from '../api/api';

// Reusable Modal for Registration
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Local state for the user list (to simulate CRUD updates locally)
  const [users, setUsers] = useState([
    { name: 'Almaz Bekele', email: 'almaz.bekele@addiscity.gov.et', role: 'OrgAdmin' as Role, org: 'Water & Sewage Authority', status: 'Active' },
    { name: 'Solomon Tefera', email: 'solomon.t@tech.gov.et', role: 'SysAdmin' as Role, org: 'City Admin HQ', status: 'Active' },
    { name: 'Bruk Alemu', email: 'bruk.a@addisroads.gov.et', role: 'DeptAdmin' as Role, org: 'Road Authority', status: 'Active' },
  ]);

  // Form State for POST /auth/register
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: (currentUser?.role === 'SysAdmin' ? 'OrgAdmin' : 'DeptAdmin') as Role,
  });

  const isSystemAdmin = currentUser?.role === 'SysAdmin';

  // HANDLE POST (Register)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // API call to register endpoint
      await authApi.register(formData);
      
      // Update local state for UI feedback
      const newUser = {
        name: formData.fullname,
        email: formData.email,
        role: (isSystemAdmin ? 'OrgAdmin' : 'DeptAdmin') as Role,
        org: isSystemAdmin ? 'Pending Assignment' : '-',
        status: 'Active'
      };
      setUsers([newUser, ...users]);
      
      setIsAddModalOpen(false);
      setFormData({ ...formData, fullname: '', email: '', password: '' });
      alert('User registered successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE DELETE
  const handleDelete = (email: string) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
        setUsers(users.filter(u => u.email !== email));
        setSelectedUser(null);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'mr-112.5' : 'mr-0'} p-6`}>
         <div className="flex justify-between items-end">
            <div>
              <nav className="text-xs text-slate-400 mb-1">
                {isSystemAdmin ? 'Administration / Users' : 'Organization / Employees'}
              </nav>
              <h1 className="text-2xl font-bold text-slate-800">
                {isSystemAdmin ? 'User Management' : 'Employee Management'}
              </h1>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#006B5D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all"
            >
              <UserPlus size={18} className="mr-2" />
              {isSystemAdmin ? 'Add Org Admin' : 'Add Employee'}
            </button>
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
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Details</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Role</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Organization</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {users.map((user, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer transition-colors ${selectedUser?.email === user.email ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                    >
                       <td className="px-6 py-4">
                         <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-[#006B5D] font-bold border border-teal-100 mr-3">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{user.name}</p>
                               <p className="text-[11px] text-slate-400">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                           user.role === 'SysAdmin' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                           user.role === 'OrgAdmin' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                           'text-slate-500 bg-gray-50 border-gray-100'
                         }`}>
                           {user.role === 'SysAdmin' ? 'System Admin' : user.role === 'OrgAdmin' ? 'Org Admin' : 'Employee'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{user.org}</td>
                   </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* READ / UPDATE Drawer */}
      {selectedUser && (
        <div className="w-112.5 bg-white border-l border-gray-200 fixed right-0 top-20 bottom-0 z-50 animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded text-slate-400 hover:text-slate-600"><X size={20}/></button>
           </div>
           
           <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-3xl font-bold text-[#006B5D]">
                   {selectedUser.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                 </div>
              </div>

              {/* Editable Fields for UPDATE */}
              <section className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Control</h4>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Full Name</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue={selectedUser.name} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue={selectedUser.email} />
                 </div>
              </section>

              <button 
                onClick={() => handleDelete(selectedUser.email)}
                className="mt-10 w-full flex items-center justify-center gap-2 py-3 text-red-500 border border-red-100 bg-red-50 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> Deactivate Account
              </button>
           </div>
           
           <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-100">Cancel</button>
              <button className="flex-1 py-2.5 bg-[#006B5D] text-white rounded-xl text-sm font-bold hover:bg-[#005a4e] shadow-lg shadow-teal-900/10">Save Changes</button>
           </div>
        </div>
      )}

      {/* CREATE Modal (uses auth/register) */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={isSystemAdmin ? "Register Org Admin" : "Register Employee"}
      >
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
              placeholder="e.g. Abebe Bikila"
              value={formData.fullname}
              onChange={e => setFormData({...formData, fullname: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
            <input 
              type="email" required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
              placeholder="name@city.gov.et"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Temp Password</label>
            <input 
              type="password" required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#006B5D]/10" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#006B5D] text-white py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-teal-900/10 hover:bg-[#005a4e] transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Shield className="mr-2" size={18} />}
              Confirm & Register
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;