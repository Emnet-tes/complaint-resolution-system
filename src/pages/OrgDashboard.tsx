import { useEffect, useState } from 'react';
import { Building2, Users as UsersIcon, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { orgAdminApi, type OrgAdminAnalytics } from '../api/orgadmin';
import { StatCard } from '../components/OrgComponents';

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

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Analytics...</div>;

  const totalResolved = stats?.departments.reduce((acc, d) => acc + d.resolved, 0) || 0;
  const totalPending = stats?.departments.reduce((acc, d) => acc + d.pending, 0) || 0;
  const totalTickets = stats?.departments.reduce((acc, d) => acc + d.total, 0) || 0;

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div>
        <nav className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-tighter">Organization / Overview</nav>
        <h1 className="text-3xl font-black text-slate-800">Dashboard Metrics</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Departments" value={stats?.departments.length || 0} subValue="Active Units" icon={Building2} color="bg-indigo-500" />
        <StatCard title="Dept Admins" value={stats?.deptAdmins?.length || 0} subValue="Active Admins" icon={UsersIcon} color="bg-[#006B5D]" />
        <StatCard title="Total Resolved" value={totalResolved} subValue={`${((totalResolved / (totalTickets || 1)) * 100).toFixed(1)}% Overall Rate`} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="Total Pending" value={totalPending} subValue="Awaiting Action" icon={Clock} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Department Performance Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-bold text-slate-800">Department Performance</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Resolved</th>
                <th className="px-6 py-4">Pending</th>
                <th className="px-6 py-4 text-right">Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.departments.map((dept) => (
                <tr key={dept.departmentId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-slate-700">{dept.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{dept.total}</td>
                  <td className="px-6 py-4 font-mono text-emerald-600">{dept.resolved}</td>
                  <td className="px-6 py-4 font-mono text-amber-500">{dept.pending}</td>
                  <td className="px-6 py-4 text-right font-bold">
                     <span className='text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg'>{dept.resolvedPercentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;