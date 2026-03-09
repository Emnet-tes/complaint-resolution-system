import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const Users = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const userData = [
    { name: 'Almaz Bekele', email: 'almaz.bekele@addiscity.gov.et', role: 'Org Admin', org: 'Water & Sewage Authority', status: 'Active' },
    { name: 'Solomon Tefera', email: 'solomon.t@tech.gov.et', role: 'System Admin', org: 'City Admin HQ', status: 'Active' },
    { name: 'Hanna Tadesse', email: 'hanna.t@gmail.com', role: 'Citizen', org: '-', status: 'Active' },
    { name: 'Bruk Alemu', email: 'bruk.a@addisroads.gov.et', role: 'Org Admin', org: 'Road Authority', status: 'Active' },
  ];

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'mr-[450px]' : 'mr-0'} p-6`}>
         <div>
           <nav className="text-xs text-slate-400 mb-1">Administration / Users & Roles</nav>
           <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
         </div>

        <div className="flex gap-4 mt-6">
           <div className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center">
             <Search size={18} className="text-slate-400 mr-3" />
             <input placeholder="Search user..." className="w-full text-sm outline-none" />
           </div>
           <button className="bg-white px-6 border border-gray-100 rounded-xl text-xs font-bold text-slate-600 flex items-center hover:bg-gray-50">All Roles <ChevronDown size={14} className="ml-4"/></button>
        </div>
         
         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-slate-400 font-medium border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">User Details</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Role</th>
                     <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Organization</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {userData.map((user, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer transition-colors ${selectedUser?.email === user.email ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
                    >
                       <td className="px-6 py-4">
                         <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-slate-200 mr-3"></div>
                            <div>
                               <p className="font-bold text-slate-800">{user.name}</p>
                               <p className="text-[11px] text-slate-400">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase ${
                           user.role === 'System Admin' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                           user.role === 'Org Admin' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                           'text-slate-500 bg-gray-50 border-gray-100'
                         }`}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{user.org}</td>
                   </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Sliding Drawer */}
      {selectedUser && (
        <div className="w-[450px] bg-white border-l border-gray-200 fixed right-0 top-20 bottom-0 z-50 animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">User Information</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded text-slate-400 hover:text-slate-600"><X size={20}/></button>
           </div>
           
           <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden"></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                       selectedUser.role === 'System Admin' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                       selectedUser.role === 'Org Admin' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                       'text-slate-500 bg-gray-50 border-gray-100'
                     }`}>{selectedUser.role}</span>
                     <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-emerald-100">Active</span>
                    </div>
                 </div>
              </div>

              <section className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Personal Details</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-600">Full Name</label>
                       <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500" defaultValue={selectedUser.name} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-600">Username</label>
                       <input className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-not-allowed" defaultValue={selectedUser.email.split('@')[0]} disabled />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue={selectedUser.email} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Phone Number</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="+251 922 555 123" />
                 </div>
              </section>

              <section className="space-y-4 mt-8">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Role & Access</h4>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Role</label>
                    <div className="relative">
                       <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none">
                          <option selected>{selectedUser.role === 'System Admin' ? 'System Administrator' : selectedUser.role}</option>
                          <option>Organization Administrator</option>
                          <option>Citizen</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-2.5 text-slate-400" size={14}/>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Organization</label>
                    <div className="relative">
                       <select className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm appearance-none ${
                         selectedUser.role === 'System Admin' ? 'text-slate-400 bg-gray-100' : ''
                       }`} disabled={selectedUser.role === 'System Admin'}>
                          <option selected>{selectedUser.org === '-' ? 'Select Organization...' : selectedUser.org}</option>
                          <option>Water & Sewage Authority</option>
                          <option>Road Authority</option>
                          <option>City Admin HQ</option>
                       </select>
                       <ChevronDown className={`absolute right-3 top-2.5 ${selectedUser.role === 'System Admin' ? 'text-slate-300' : 'text-slate-400'}`} size={14}/>
                    </div>
                    {selectedUser.role === 'System Admin' && <p className="text-[10px] text-slate-400 italic">Not required for System Admins</p>}
                 </div>
              </section>

              <section className="space-y-4 mt-8">
                 <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Security</h4>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-slate-700">Account Status</span>
                    <div className="flex bg-white rounded-lg p-0.5 border border-gray-200">
                       <button className="px-3 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">Active</button>
                       <button className="px-3 py-1 text-[10px] font-bold text-slate-400">Locked</button>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Password</span>
                       <button className="text-[#006B5D] font-bold hover:underline">Send Reset Link</button>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-500">Sessions</span>
                       <button className="text-red-500 font-bold hover:underline">Log Out All Devices</button>
                    </div>
                 </div>
              </section>
           </div>
           
           <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-100">Cancel</button>
              <button className="flex-1 py-2.5 bg-[#006B5D] text-white rounded-xl text-sm font-bold hover:bg-[#005a4e] shadow-lg shadow-teal-900/10">Save Changes</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Users;