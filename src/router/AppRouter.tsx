import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Dashboard from '../components/Dashboard'; 
import RoleBasedComplaints from '../components/RoleBasedComplaints';
import ComplaintDetail from '../components/ComplaintDetail';
import Settings from '../components/Settings';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Auth
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Organizations from '../components/Organizations';
import OrgDashboard from '../pages/OrgDashboard';
import DepartmentManagement from '../pages/DepartmentManagement';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/login" />} />

            {/* --- SYSTEM ADMIN ROUTES --- */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['SysAdmin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="organizations"
              element={
                <ProtectedRoute allowedRoles={['SysAdmin']}>
                  <Organizations />
                </ProtectedRoute>
              }
            />

            {/* --- ORG ADMIN ROUTES --- */}
            <Route
              path="org-dashboard"
              element={
                <ProtectedRoute allowedRoles={['OrgAdmin']}>
                  <OrgDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['OrgAdmin']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />

            {/* --- SHARED COMPLAINT ROUTES --- */}
            <Route
              path="complaints"
              element={
                <ProtectedRoute allowedRoles={['OrgAdmin', 'DeptAdmin']}>
                  <RoleBasedComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['OrgAdmin', 'DeptAdmin']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />

            {/* --- COMMON ROUTES --- */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['SysAdmin', 'OrgAdmin', 'DeptAdmin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/unauthorized"
            element={<div className="flex items-center justify-center h-screen font-black text-slate-400 uppercase tracking-widest">403 | Unauthorized</div>}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;