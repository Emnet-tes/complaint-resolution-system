import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next'; // Import i18n
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
  const { t } = useTranslation();
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
    // CSV logic remains same...
    const headers = ['org_name', 'total', 'resolved', 'pending', 'rate', 'exported_at'];
    const exportedAt = new Date().toISOString();
    const rows = analytics.organizations.map((org) => [
      org.name, org.total, org.resolved, org.total - org.resolved, 
      ((org.resolved / (org.total || 1)) * 100).toFixed(1), exportedAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-black text-[10px] uppercase tracking-[0.2em] italic">
          {t('sys_dashboard.loading')}
        </p>
      </div>
    );
  }

  // Format data for Recharts - localized keys for the Legend
  const chartData = analytics?.organizations.map(org => ({
    name: org.name,
    [t('sys_dashboard.chart.total')]: org.total,
    [t('sys_dashboard.chart.resolved')]: org.resolved
  })) || [];

  const resolutionRate = analytics?.overall.resolvedPercentage.toFixed(1) || "0";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Area */}
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {t('sys_dashboard.breadcrumb')}
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('sys_dashboard.title')}
        </h1>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title={t('sys_dashboard.stats.complaints')} 
          value={analytics?.overall.total.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_orgs')} 
          icon={FileText} 
          color="bg-blue-600" 
        />
        <StatCard 
          title={t('sys_dashboard.stats.pending')} 
          value={analytics?.overall.pending.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_rate', { rate: resolutionRate })} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title={t('sys_dashboard.stats.resolved')} 
          value={analytics?.overall.resolved.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_cases')} 
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
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                {t('sys_dashboard.chart.title')}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t('sys_dashboard.chart.subtitle')}
              </p>
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
                  tickFormatter={(str) => (str.length > 12 ? `${str.substring(0, 12)}...` : str)}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Bar dataKey={t('sys_dashboard.chart.total')} fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey={t('sys_dashboard.chart.resolved')} fill="#006B5D" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">
                {t('sys_dashboard.insights.title')}
              </h4>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                <Trans 
                  i18nKey="sys_dashboard.insights.desc" 
                  values={{ rate: resolutionRate }}
                  components={[<span key="0" className="text-white font-black" />]}
                />
              </p>
              <button
                onClick={handleExportCsv}
                disabled={!analytics?.organizations?.length}
                className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Share2 size={16} /> {t('sys_dashboard.insights.export')}
              </button>
            </div>
            <FilePieChart className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 rotate-12 transition-transform duration-700" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-black text-slate-800 mb-5 text-[10px] uppercase tracking-[0.2em]">
              {t('sys_dashboard.summary.title')}
            </h4>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-[#006B5D]" />
                  <span className="text-xs font-bold text-slate-600">{t('sys_dashboard.summary.connected')}</span>
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