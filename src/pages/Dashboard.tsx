import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Clock, CheckCircle, BarChart3, Share2,
  FilePieChart, Loader2, Building2, FileDown, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { sysAdminApi, type SysAdminAnalytics } from '../api/sysadmin';
import StatCard from '../components/StatCard';
import jsPDF from 'jspdf';

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

  const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const handleExportCsv = () => {
    if (!analytics) return;

    const overview = analytics.overview;
    const exportedAt = new Date().toISOString();

    const rows: (string | number | boolean)[][] = [
      ['overview_metric', 'value'],
      ['total', overview.total],
      ['resolved', overview.resolved],
      ['pending', overview.pending],
      ['resolved_percentage', overview.resolvedPercentage],
      ['avg_resolution_time_hours', overview.avgResolutionTimeHours],
      ['stale_complaints', overview.staleComplaints],
      ['inactive_department_heads', overview.inactiveDepartmentHeads],
      ['monthly_growth_rate', overview.monthlyGrowthRate],
      [],
      ['organizations_all'],
      ['name', 'total', 'resolved', 'pending', 'resolved_percentage', 'avg_resolution_time_hours', 'stale_complaints', 'inactive_department_heads', 'performance_score'],
      ...analytics.organizations.all.map((org) => [
        org.name,
        org.total,
        org.resolved,
        org.pending,
        org.resolvedPercentage,
        org.avgResolutionTimeHours,
        org.staleComplaints,
        org.inactiveDepartmentHeads,
        org.performanceScore,
      ]),
      [],
      ['top_performers'],
      ['name', 'performance_score', 'resolved_percentage'],
      ...analytics.organizations.topPerformers.map((org) => [
        org.name,
        org.performanceScore,
        org.resolvedPercentage,
      ]),
      [],
      ['needs_improvement'],
      ['name', 'resolution_rate', 'avg_time'],
      ...analytics.organizations.needsImprovement.map((org) => [
        org.name,
        org.resolutionRate,
        org.avgTime,
      ]),
      [],
      ['recommendations'],
      ['priority', 'type', 'message', 'suggested_action'],
      ...analytics.recommendations.map((item) => [
        item.priority,
        item.type,
        item.message,
        item.suggestedAction || '',
      ]),
      [],
      ['exported_at', exportedAt],
    ];

    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 16;

    const ensureSpace = (required = 8) => {
      if (y + required > pageHeight - 14) {
        doc.addPage();
        y = 16;
      }
    };

    const addHeading = (text: string) => {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(text, margin, y);
      y += 7;
    };

    const addLine = (text: string, isBullet = true) => {
      ensureSpace(7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(isBullet ? `• ${text}` : text, margin, y);
      y += 6;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(t('sys_dashboard.title'), margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${t('sys_dashboard.breadcrumb')} | ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    addHeading(t('sys_dashboard.export.overview'));
    addLine(`${t('sys_dashboard.stats.complaints')}: ${analytics.overview.total}`);
    addLine(`${t('sys_dashboard.stats.pending')}: ${analytics.overview.pending}`);
    addLine(`${t('sys_dashboard.chart.resolved')}: ${analytics.overview.resolved}`);
    addLine(`${t('sys_dashboard.stats.avg_time')}: ${analytics.overview.avgResolutionTimeHours}`);
    addLine(`${t('sys_dashboard.stats.sub_growth', { rate: String(analytics.overview.monthlyGrowthRate) })}`);

    addHeading(t('sys_dashboard.export.top_performers'));
    if (analytics.organizations.topPerformers.length === 0) {
      addLine('-');
    } else {
      analytics.organizations.topPerformers.forEach((org) => {
        addLine(`${org.name} | ${org.performanceScore} (${org.resolvedPercentage}%)`, false);
      });
    }

    addHeading(t('sys_dashboard.export.needs_improvement'));
    if (analytics.organizations.needsImprovement.length === 0) {
      addLine('-');
    } else {
      analytics.organizations.needsImprovement.forEach((org) => {
        addLine(`${org.name} | ${org.resolutionRate}% | ${org.avgTime}h`, false);
      });
    }

    addHeading(t('sys_dashboard.export.recommendations'));
    if (analytics.recommendations.length === 0) {
      addLine('-');
    } else {
      analytics.recommendations.forEach((item) => {
        addLine(`${item.priority.toUpperCase()} | ${item.message}`, false);
        if (item.suggestedAction) addLine(item.suggestedAction);
      });
    }

    doc.save(`report_${new Date().toISOString().slice(0, 10)}.pdf`);
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

  const organizations = analytics?.organizations.all || [];
  const chartData = organizations.map((org) => ({
    name: org.name,
    [t('sys_dashboard.chart.total')]: org.total,
    [t('sys_dashboard.chart.resolved')]: org.resolved
  }));
  const trendsData = analytics?.trends.monthly.map((item, index) => ({
    period: `${item.month} ${String(item.year).slice(2)}`,
    count: item.count,
    id: `${item.month}-${item.year}-${index}`,
  })) || [];

  const overview = analytics?.overview;
  const resolutionRate = overview?.resolvedPercentage.toFixed(1) || '0';
  const alerts = analytics?.alerts || [];
  const recommendations = analytics?.recommendations || [];
  const topPerformer = analytics?.organizations.topPerformers?.[0];
  const needsImprovement = analytics?.organizations.needsImprovement || [];

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
          value={overview?.total.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_growth', { rate: String(overview?.monthlyGrowthRate ?? 0) })} 
          icon={FileText} 
          color="bg-blue-600" 
        />
        <StatCard 
          title={t('sys_dashboard.stats.pending')} 
          value={overview?.pending.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_stale', { count: String(overview?.staleComplaints ?? 0) })} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title={t('sys_dashboard.stats.avg_time')} 
          value={overview?.avgResolutionTimeHours.toLocaleString()} 
          subValue={t('sys_dashboard.stats.sub_inactive_heads', { count: String(overview?.inactiveDepartmentHeads ?? 0) })} 
          icon={CheckCircle} 
          color="bg-[#006B5D]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-teal-50 rounded-lg text-[#006B5D]">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                  {t('sys_dashboard.chart.title')}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t('sys_dashboard.chart.subtitle', { rate: resolutionRate })}
                </p>
              </div>
            </div>

            <div className="h-[330px] w-full mt-auto">
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

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                  {t('sys_dashboard.trends.title')}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t('sys_dashboard.trends.subtitle')}
                </p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006B5D" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#006B5D" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#006B5D" fill="url(#trendFill)" strokeWidth={3} name={t('sys_dashboard.trends.count')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">
                {t('sys_dashboard.insights.title')}
              </h4>
              <div className="space-y-3 mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                  {t('sys_dashboard.insights.alerts')}
                </p>
                {alerts.length ? (
                  alerts.slice(0, 2).map((alert, idx) => (
                    <div key={`${alert.message}-${idx}`} className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-black">{alert.severity}</p>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">{t('sys_dashboard.insights.no_alerts')}</p>
                )}
                {recommendations[0]?.suggestedAction ? (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t('sys_dashboard.insights.action')}: {recommendations[0].suggestedAction}
                  </p>
                ) : null}
              </div>
              <button
                onClick={handleExportCsv}
                disabled={!organizations.length}
                className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Share2 size={16} /> {t('sys_dashboard.insights.export_csv')}
              </button>
              <button
                onClick={handleExportPdf}
                disabled={!organizations.length}
                className="mt-3 w-full py-4 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-white/10"
              >
                <FileDown size={16} /> {t('sys_dashboard.insights.export_pdf')}
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
               <span className="text-lg font-black text-slate-800">{organizations.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-3">
              <span className="text-xs font-bold text-slate-600">{t('sys_dashboard.summary.top_performer')}</span>
              <span className="text-xs font-black text-slate-800 text-right max-w-[60%] truncate">{topPerformer?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-3">
              <span className="text-xs font-bold text-slate-600">{t('sys_dashboard.summary.needs_improvement')}</span>
              <span className="text-lg font-black text-slate-800">{needsImprovement.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;