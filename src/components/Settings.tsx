import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('settings.security.password_mismatch') || 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({ oldPassword, newPassword });
      setSuccess(t('dept_mgmt.toasts.add_success') || 'Password changed');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('dept_mgmt.toasts.fetch_error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8 p-4 md:p-8">
      <div>
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('settings.title')}
         </h1>
         <p className="text-sm text-slate-500 font-medium">
            {t('settings.subtitle')}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         {/* Settings Content */}
         <div className="md:col-span-9 space-y-8">
            {/* Profile Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-[#006B5D] relative group">
                     <User size={40}/>
                     <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest cursor-pointer">
                        {t('settings.profile.change')}
                     </button>
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-800 tracking-tight">
                        {t('settings.profile.title')}
                     </h3>
                     <p className="text-sm text-slate-500 font-medium">
                        {t('settings.profile.subtitle')}
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {user?.role === 'DeptHead' ? t('dept_complaints.table.department', 'Department') : t('settings.profile.first_name')}
                     </label>
                     <input
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#006B5D]/10 outline-none transition-all"
                       placeholder={user?.role === 'DeptHead' ? (t('sidebar.dept_portal') || 'Department') : 'System'}
                       defaultValue={user?.role === 'DeptHead' ? '' : 'System'}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('settings.profile.last_name')}
                     </label>
                     <input 
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[#006B5D]/10 outline-none transition-all" 
                       placeholder="Last Name"
                       defaultValue={user?.fullname?.split(' ').slice(1).join(' ') || ''} 
                     />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('settings.profile.email')}
                     </label>
                     <input
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
                       value={user?.email || ''}
                       readOnly
                     />
                  </div>
               </div>
            </section>

            {/* Password Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Lock size={20}/></div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                        {t('settings.security.title')}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {t('settings.security.subtitle')}
                    </p>
                  </div>
               </div>

               <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">
                      {success}
                    </div>
                  )}
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('settings.security.current_password')}
                     </label>
                     <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold"
                          placeholder="••••••••"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-slate-400 cursor-pointer hover:text-slate-600">
                            {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('settings.security.new_password')}
                     </label>
                     <input
                       type="password"
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm"
                       placeholder={t('settings.security.placeholder_new')}
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t('settings.security.confirm_password')}
                     </label>
                     <input
                       type="password"
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm"
                       placeholder={t('settings.security.placeholder_confirm')}
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                     />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#006B5D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#005a4e] shadow-lg shadow-teal-900/10 transition-all cursor-pointer active:scale-95 disabled:opacity-70"
                    >
                      {loading ? t('sys_dashboard.loading') : t('settings.actions.update')}
                    </button>
                  </div>
               </form>
            </section>

            {/* Form Actions (profile only, password handled in its own form) */}
            <div className="flex justify-end gap-4">
               <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all cursor-pointer">
                  {t('settings.actions.discard')}
               </button>
               <button className="px-6 py-2.5 bg-[#006B5D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#005a4e] shadow-lg shadow-teal-900/10 transition-all cursor-pointer active:scale-95">
                  {t('settings.actions.update')}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;