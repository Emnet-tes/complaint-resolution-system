import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Organizations from '../components/Organizations';
import RoleBasedComplaints from '../components/RoleBasedComplaints';
import ComplaintDetail from '../components/ComplaintDetail';
import Users from '../components/Users';
import Settings from '../components/Settings';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<MainLayout />}>
            {/* Redirect root to login; home component can refine role-based landing later */}
            <Route index element={<Navigate to="/login" />} />

            {/* System Admin Routes */}
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

            {/* Org Admin / Employee Routes */}
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
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['OrgAdmin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
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
            element={<div className="p-20 text-center font-bold">403 - Unauthorized Access</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;
