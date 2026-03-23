import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
  

const ForgotPassword = () => {
  const navigate = useNavigate();

  // FIX: Added the handleSubmit logic to the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to trigger the email sending would go here
    
    // Smooth navigation to the next step
    navigate('/verify-code'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-[400px] flex flex-col">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/login')}
          className="mb-8 w-fit p-1 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft size={28} className="text-black" />
        </button>

        {/* Header Section */}
        <h1 className="text-3xl font-bold text-[#005a43] mb-4">
          Forgot Password?
        </h1>
        <p className="text-gray-800 text-lg leading-tight mb-10">
          Recover you password if you have forgot the password!
        </p>

        {/* FIX: Attached onSubmit here */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#005a43]">
                <Mail size={20} />
              </span>
              <input
                required
                type="email"
                placeholder="Ex: abc@example.com"
                className="w-full py-4 pl-12 pr-4 border-2 border-[#005a43] rounded-2xl focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>

          {/* Submit Button */}
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

export default ForgotPassword;