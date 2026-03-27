import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });

      // Redirect based on role
      if (user.role === 'SysAdmin') {
        navigate('/dashboard');
      } else if (user.role === 'OrgAdmin') {
        navigate('/org-dashboard');
      } else {
        // Fallback
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-medium">Please enter your details to sign in</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-bold shadow-lg shadow-teal-900/20 hover:bg-[#005a4e] transition-all transform active:scale-[0.98]">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;