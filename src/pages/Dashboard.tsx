import { useEffect, useState } from 'react';
import { 
  FileText, Clock, CheckCircle, BarChart3, Share2, 
  FilePieChart, Loader2, Building2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { sysAdminApi, type SysAdminAnalytics } from '../api/sysadmin';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<SysAdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await sysAdminApi.getAnalytics();
        setAnalytics(res.data);
      } catch (err: any) {
        console.error('Failed to load system statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCsv = () => {
    if (!analytics || !analytics.organizations?.length) return;

    const headers = [
      'organization_name',
      'organization_total',
      'organization_resolved',
      'organization_pending',
      'organization_resolution_percentage',
      'overall_total',
      'overall_resolved',
      'overall_pending',
      'overall_resolved_percentage',
      'exported_at',
    ];

    const escapeCsvValue = (value: string | number) => {
      const stringValue = String(value ?? '');
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const exportedAt = new Date().toISOString();

    const rows = analytics.organizations.map((org) => [
      org.name,
      org.total,
      org.resolved,
      org.total - org.resolved,
      ((org.resolved / (org.total || 1)) * 100).toFixed(1),
      analytics.overall.total,
      analytics.overall.resolved,
      analytics.overall.pending,
      analytics.overall.resolvedPercentage.toFixed(1),
      exportedAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const dateLabel = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_analytics_${dateLabel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-bold text-xs uppercase tracking-widest italic">Syncing Global Data...</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = analytics?.organizations.map(org => ({
    name: org.name,
    Total: org.total,
    Resolved: org.resolved
  })) || [];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          System Administration / Overview
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global Analytics</h1>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Global Complaints" 
          value={analytics?.overall.total.toLocaleString()} 
          subValue="All Organizations" 
          icon={FileText} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Pending Resolution" 
          value={analytics?.overall.pending.toLocaleString()} 
          subValue={`${analytics?.overall.resolvedPercentage.toFixed(1)}% Global Rate`} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="System Resolved" 
          value={analytics?.overall.resolved.toLocaleString()} 
          subValue="Completed Cases" 
          icon={CheckCircle} 
          color="bg-[#006B5D]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECHARTS BAR CHART SECTION */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-teal-50 rounded-lg text-[#006B5D]">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Organization Distribution</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume vs Resolution Breakdown</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                  // Truncate long names for mobile
                  tickFormatter={(str) => (str.length > 12 ? `${str.substring(0, 12)}...` : str)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Bar 
                  dataKey="Total" 
                  fill="#94a3b8" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
                <Bar 
                  dataKey="Resolved" 
                  fill="#006B5D" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">System Insights</h4>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                The current system resolution rate is <span className="text-white font-black">{analytics?.overall.resolvedPercentage.toFixed(1)}%</span>. 
                Keep track of individual organization performance via the distribution chart.
              </p>
              <button
                onClick={handleExportCsv}
                disabled={!analytics?.organizations?.length}
                className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 size={16} /> Export Report
              </button>
            </div>
            <FilePieChart className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-black text-slate-800 mb-5 text-[10px] uppercase tracking-[0.2em]">Monitoring Summary</h4>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-[#006B5D]" />
                  <span className="text-xs font-bold text-slate-600">Connected Orgs</span>
               </div>
               <span className="text-lg font-black text-slate-800">{analytics?.organizations.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;