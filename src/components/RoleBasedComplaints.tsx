import DepartmentComplaints from './DepartmentComplaints';
import OrgHeadComplaints from './OrgHeadComplaints';
import { useAuth } from '../context/AuthContext';

const RoleBasedComplaints = () => {
  const { user } = useAuth();

  if (!user) return null; // ProtectedRoute already ensures authentication

  if (user.role === 'DeptAdmin') return <DepartmentComplaints />;
  if (user.role === 'OrgHead') return <OrgHeadComplaints />;

  return <div className="p-4 font-semibold text-center">Unauthorized for complaints</div>;
};

export default RoleBasedComplaints;
