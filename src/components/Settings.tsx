import { useEffect, useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changePasswordThunk, selectAuthError, selectAuthSubmitting } from '../store/slices/authSlice';

const Settings = () => {
    console.log('Rendering Settings component');
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { user, refreshProfile } = useAuth();
    
    if (!user) {
        console.log('Settings: User is null, showing loading');
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    console.log('Settings: User role is', user.role);
  const loading = useAppSelector(selectAuthSubmitting);
  const authError = useAppSelector(selectAuthError);
  const [showPwd, setShowPwd] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await dispatch(changePasswordThunk({ oldPassword, newPassword })).unwrap();
      setSuccess(t('dept_mgmt.toasts.add_success') || 'Password changed');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.message || authError || t('dept_mgmt.toasts.fetch_error');
      setError(msg);
    }
  };

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    void refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto space-y-8 p-4 md:p-8" id="settings-page">
      <div>
         <h1 className="text-2xl font-black text-slate-800 tracking-tight" data-testid="settings-title">
            {t('settings.title', 'Account Settings')}
         </h1>
         <p className="text-sm text-slate-500 font-medium">
            {t('settings.subtitle', 'Manage your account settings and security.')}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         {/* Settings Content */}
         <div className="md:col-span-9 space-y-8">
            {/* Profile Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-[#006B5D] relative overflow-hidden border border-teal-100/50">
                     {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <User size={40}/>
                     )}
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
                     <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {t('settings.profile.full_name', 'Full Name')}
                        </label>
                        <input
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
                          value={user?.fullname ?? ''}
                          readOnly
                        />
                     </div>
                     <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {t('settings.profile.email')}
                        </label>
                        <input
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
                          value={user?.email ?? ''}
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
                        <button type="button" onClick={(e) => { e.preventDefault(); setShowPwd(!showPwd); }} className="absolute right-3 top-2.5 text-slate-400 cursor-pointer hover:text-slate-600">
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
                      {loading ? t('sys_dashboard.loading') : t('settings.actions.update_password', 'Update Password')}
                    </button>
                  </div>
               </form>
            </section>

         </div>
      </div>
    </div>
  );
};

export default Settings;