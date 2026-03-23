import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to update password goes here
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px] flex flex-col">
        <button 
          onClick={() => navigate('/verify-code')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        <h1 className="text-3xl font-bold text-[#005a43] mb-4">Reset Password</h1>
        <p className="text-gray-800 text-lg leading-tight mb-10">
          Set your new password to login into your account!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Enter New Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Lock size={20} />
              </span>
              <input
                type="password"
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Lock size={20} />
              </span>
              <input
                type="password"
                placeholder="........."
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#005a43] text-white font-bold py-4 rounded-2xl hover:bg-[#004835] transition-colors text-lg mt-4"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;