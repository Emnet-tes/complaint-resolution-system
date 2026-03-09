import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="mx-auto space-y-8">
      <div>
         <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
         <p className="text-sm text-slate-500">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        

         {/* Settings Content */}
         <div className="md:col-span-9 space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-[#006B5D] relative group">
                     <User size={40}/>
                     <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">Change</button>
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-800">Profile Photo</h3>
                     <p className="text-sm text-slate-500">Update your photo and personal brand.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600">First Name</label>
                     <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/10 outline-none" defaultValue="System" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600">Last Name</label>
                     <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/10 outline-none" defaultValue="Admin" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                     <label className="text-xs font-bold text-slate-600">Email Address</label>
                     <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" defaultValue="admin@cityvoice.gov.et" />
                  </div>
               </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Lock size={20}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Password Security</h3>
                    <p className="text-sm text-slate-500">Keep your account secure by using a strong password.</p>
                  </div>
               </div>

               <div className="space-y-6 max-w-md">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600">Current Password</label>
                     <div className="relative">
                        <input type={showPwd ? "text" : "password"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10" placeholder="••••••••" />
                        <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-slate-400">{showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600">New Password</label>
                     <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600">Confirm New Password</label>
                     <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Confirm new password" />
                  </div>
               </div>
            </section>

            <div className="flex justify-end gap-4">
               <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white">Discard Changes</button>
               <button className="px-6 py-2.5 bg-[#006B5D] text-white rounded-xl text-sm font-bold hover:bg-[#005a4e] shadow-lg shadow-teal-900/10 transition-all">Update Account</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;