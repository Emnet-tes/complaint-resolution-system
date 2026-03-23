import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Organizations from '../components/Organizations';
import Complaints from '../components/Complaints';
import ComplaintDetail from '../components/ComplaintDetail';
import Users from '../components/Users';
import Settings from '../components/Settings';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import Login from '../auth/Login';
import ForgotPassword from '../auth/ForgotPassword';
import Verification from '../auth/Verification';
import ResetPassword from '../auth/ResetPassword';
import { LanguageProvider } from '../context/LanguageContext';


const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        
        <main className="p-4 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRouter = () => {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-code" element={<Verification />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
    </LanguageProvider>

  );
};

export default AppRouter;
