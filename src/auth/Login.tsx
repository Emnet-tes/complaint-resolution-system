import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to your FastAPI backend
      const response = await axios.post('http://localhost:8000/auth/login', formData);

      if (response.status === 200) {
        // Handle successful login
        const token = response.data.access_token; 
        if (token) localStorage.setItem('token', token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle errors (Invalid credentials, server down, etc.)
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative">
      <div className="w-full max-w-[400px] flex flex-col">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#005a43] mb-10">Login</h1>

        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Mail size={20} />
              </span>
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: abc@example.com"
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Your Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Lock size={20} />
              </span>
              <input
                required
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
            <div className="pt-1">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-semibold text-[#005a43] underline decoration-1 underline-offset-2"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005a43] text-white font-bold py-4 rounded-2xl hover:bg-[#004835] transition-colors mt-4 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;