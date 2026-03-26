import { useEffect, useState } from 'react';
import { Building2, Users as UsersIcon, Clock, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { orgAdminApi } from '../api/orgadmin';
import { StatCard } from '../components/OrgComponents';

// Update interface to match the backend response
interface OrgAdminAnalytics {
  summary: {
    totalDepartments: number;
    totalAdmins: number;
    totalResolved: number;
    totalPending: number;
  };
  departments: {
    departmentId: string;
    name: string;
    total: number;
    resolved: number;
    pending: number;
    resolvedPercentage: number;
  }[];
}

const OrgDashboard = () => {
  const [stats, setStats] = useState<OrgAdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orgAdminApi.getAnalytics();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  // Fallback to 0 if stats is null
  const summary = stats?.summary || { totalDepartments: 0, totalAdmins: 0, totalResolved: 0, totalPending: 0 };
  const totalTickets = summary.totalResolved + summary.totalPending;
  const successRate = totalTickets > 0 ? ((summary.totalResolved / totalTickets) * 100).toFixed(1) : "0";

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div>
        <nav className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-tighter">Organization / Overview</nav>
        <h1 className="text-3xl font-black text-slate-800">Dashboard Metrics</h1>
      </div>

      {/* Overview Cards - Now using summary data directly */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Departments" 
          value={summary.totalDepartments} 
          subValue="Active Units" 
          icon={Building2} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Dept Admins" 
          value={summary.totalAdmins} 
          subValue="Staff Members" 
          icon={UsersIcon} 
          color="bg-[#006B5D]" 
        />
        <StatCard 
          title="Total Resolved" 
          value={summary.totalResolved} 
          subValue={`${successRate}% Success Rate`} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Total Pending" 
          value={summary.totalPending} 
          subValue="Awaiting Action" 
          icon={Clock} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Performance Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Department Breakdown</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-slate-400 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center text-emerald-600">Resolved</th>
                <th className="px-6 py-4 text-center text-amber-600">Pending</th>
                <th className="px-6 py-4 text-right">Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.departments.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{dept.name}</td>
                  <td className="px-6 py-4 text-center font-mono text-slate-500">{dept.total}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600">{dept.resolved}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-amber-500">{dept.pending}</td>
                  <td className="px-6 py-4 text-right">
                     <span className='text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100'>
                       {dept.resolvedPercentage}%
                     </span>
                  </td>
                </tr>
              ))}
              {stats?.departments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-bold uppercase text-xs">
                    No department data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;