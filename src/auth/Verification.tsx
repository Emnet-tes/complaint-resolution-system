import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to verify code goes here
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px] flex flex-col">
        <button 
          onClick={() => navigate('/forgot-password')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        <h1 className="text-3xl font-bold text-[#005a43] mb-4">Verify Code</h1>
        <p className="text-gray-800 text-lg leading-tight mb-10">
          We have sent an email to your email account with a verification code!
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Verification Code</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="EX: 123456"
                className="w-full py-4 px-6 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300 text-center tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#005a43] text-white font-bold py-4 rounded-2xl hover:bg-[#004835] transition-colors text-lg"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verification;