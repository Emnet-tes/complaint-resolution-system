import { useEffect, useMemo, useState } from 'react';
import { BarChart3, FileText, CheckCircle2, Clock, Loader2, Share2, FilePieChart, FileDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { StatCard } from '../components/OrgComponents';
import { jsPDF } from 'jspdf';
import { orgHeadApi, type OrgHeadAnalytics } from '../api/orghead';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const buildSafeFileName = (prefix: string, extension: string) => {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.${extension}`;
};


const OrgHeadDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrgHeadAnalytics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await orgHeadApi.getAnalytics();
        setStats(res.data || null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error', 'Failed to fetch dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  const departments = useMemo(
    () => stats?.departments || [],
    [stats],
  );

  const summary = stats?.summary;
  const totalDepartments = summary?.totalDepartments ?? departments.length;
  const totalComplaints = summary?.totalComplaints ?? 0;
  const totalResolved = summary?.resolvedComplaints ?? 0;
  const totalPending = summary?.pendingComplaints ?? 0;
  const overallResolutionRate = summary?.overallResolutionRate ?? 0;
  const staleComplaints = summary?.staleComplaints ?? 0;
  const avgResolutionTimeHours = summary?.avgResolutionTimeHours ?? 0;
  const recommendations = stats?.recommendations || [];
  const topPerformers = stats?.insights?.topPerformers || [];
  const problemDepartments = stats?.insights?.problemDepartments || [];

  const chartData = useMemo(
    () => departments.map((department) => ({
      ...department,
      resolvedLabel: t('org_dashboard.chart.resolved'),
      pendingLabel: t('org_dashboard.chart.pending'),
    })),
    [departments, t],
  );

  const trendsData = useMemo(
    () => (stats?.insights?.monthlyTrends || []).map((item, index) => ({
      id: `${item.month}-${item.year}-${index}`,
      period: `${item.month} ${String(item.year).slice(2)}`,
      count: item.count,
    })),
    [stats?.insights?.monthlyTrends],
  );

  const handleExportCsv = () => {
    const csvContent = [
      ['section', 'label', 'value'].join(','),
      ['summary', 'total_departments', String(totalDepartments)].join(','),
      ['summary', 'total_complaints', String(totalComplaints)].join(','),
      ['summary', 'resolved_complaints', String(totalResolved)].join(','),
      ['summary', 'pending_complaints', String(totalPending)].join(','),
      ['summary', 'overall_resolution_rate', `${overallResolutionRate}%`].join(','),
      ['summary', 'avg_resolution_time_hours', String(avgResolutionTimeHours)].join(','),
      ['summary', 'stale_complaints', String(staleComplaints)].join(','),
      '',
      ['departments', 'name', 'total', 'resolved', 'pending', 'resolved_percentage', 'avg_resolution_time_hours', 'new_last_30_days', 'performance_score'].join(','),
      ...departments.map((department) => [
        department.name.replaceAll(',', ' '),
        String(department.total),
        String(department.resolved),
        String(department.pending),
        `${department.resolvedPercentage}%`,
        String(department.avgResolutionTimeHours),
        String(department.newComplaintsLast30Days),
        String(department.performanceScore),
      ].join(',')),
      '',
      ['top_performers', 'name', 'performance_score', 'resolved_percentage'].join(','),
      ...topPerformers.map((department) => [
        department.name.replaceAll(',', ' '),
        String(department.performanceScore),
        `${department.resolvedPercentage}%`,
      ].join(',')),
      '',
      ['problem_departments', 'name', 'resolved_percentage', 'avg_time', 'pending'].join(','),
      ...problemDepartments.map((department) => [
        department.name.replaceAll(',', ' '),
        `${department.resolvedPercentage}%`,
        String(department.avgTime),
        String(department.pending),
      ].join(',')),
      '',
      ['recommendations', 'priority', 'type', 'message', 'suggested_action'].join(','),
      ...recommendations.map((item) => [
        item.priority,
        item.type,
        item.message.replaceAll(',', ' '),
        (item.suggestedAction || '').replaceAll(',', ' '),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = buildSafeFileName('orghead_dashboard', 'csv');
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(t('org_dashboard.pdf.title'), 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('org_dashboard.pdf.generated')}: ${new Date().toLocaleString()}`, 14, 26);

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(t('org_dashboard.pdf.summary_title'), 14, y);
    y += 8;

    doc.setFontSize(10);
    [
      `${t('org_dashboard.stats.total_depts')}: ${totalDepartments}`,
      `${t('org_dashboard.stats.complaints_assigned', 'Total Complaints')}: ${totalComplaints}`,
      `${t('org_dashboard.stats.total_resolved')}: ${totalResolved}`,
      `${t('org_dashboard.stats.total_pending')}: ${totalPending}`,
      `${t('org_dashboard.chart.resolved', 'Resolution')}: ${overallResolutionRate}%`,
      `${t('org_dashboard.stats.avg_time', 'Avg Time')}: ${avgResolutionTimeHours}h`,
    ].forEach((line) => {
      doc.text(line, 14, y);
      y += 6;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    y += 4;
    doc.text(t('org_dashboard.pdf.department_title'), 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    departments.forEach((department) => {
      doc.text(
        `${department.name} | ${t('org_dashboard.chart.total')}: ${department.total} | ${t('org_dashboard.chart.resolved')}: ${department.resolved} | ${t('org_dashboard.chart.pending')}: ${department.pending} | ${department.resolvedPercentage}% | ${department.performanceScore}`,
        14,
        y,
      );
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(t('org_dashboard.pdf.summary_table_title'), 14, y);
    y += 8;

    doc.setFontSize(9);
    departments.forEach((department) => {
      const line = `${department.name} | ${department.total} | ${department.resolved} | ${department.pending} | ${department.resolvedPercentage}%`;
      const lines = doc.splitTextToSize(line, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(t('org_dashboard.export.recommendations', 'Recommendations'), 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    recommendations.forEach((item) => {
      const lines = doc.splitTextToSize(`${item.priority.toUpperCase()} | ${item.message} ${item.suggestedAction ? `| ${item.suggestedAction}` : ''}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
    });

    doc.save(buildSafeFileName('orghead_dashboard', 'pdf'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {t('org_dashboard.nav_path')}
        </nav>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {t('org_dashboard.title')}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2">{t('org_dashboard.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title={t('org_dashboard.stats.total_depts')} value={totalDepartments} subValue={t('org_dashboard.stats.sub_active')} icon={FileText} color="bg-indigo-500" />
        <StatCard title={t('org_dashboard.stats.complaints_assigned', 'Total Complaints')} value={totalComplaints} subValue={`${overallResolutionRate}% ${t('org_dashboard.chart.resolved', 'Resolved')}`} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title={t('org_dashboard.stats.total_resolved')} value={totalResolved} subValue={`${avgResolutionTimeHours}h ${t('org_dashboard.stats.avg_time', 'avg time')}`} icon={Clock} color="bg-amber-500" />
        <StatCard title={t('org_dashboard.stats.total_pending')} value={totalPending} subValue={`${staleComplaints} ${t('org_dashboard.stats.sub_stale', 'stale complaints')}`} icon={FileText} color="bg-[#006B5D]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          

          <div className="bg-white rounded-3xl border border-gray-100  shadow-sm p-4 md:p-6 h-[420px]">
            <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('org_dashboard.chart.title')}
            </h3>
          </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                    formatter={(value, name) => [String(value ?? 0), String(name)]}
                  />
                  <Bar dataKey="pending" name={t('org_dashboard.chart.pending')} radius={[6, 6, 0, 0]} barSize={24} fill="#F59E0B" />
                  <Bar dataKey="resolved" name={t('org_dashboard.chart.resolved')} radius={[6, 6, 0, 0]} barSize={24}  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('org_dashboard.table.no_data')}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 h-[320px]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#006B5D]" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                {t('org_dashboard.trends.title', 'Monthly Trends')}
              </h3>
            </div>
            {trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="88%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="orgHeadTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006B5D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#006B5D" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value) => [String(value ?? 0), t('org_dashboard.trends.count', 'Complaints')]}
                  />
                  <Area type="monotone" dataKey="count" stroke="#006B5D" fill="url(#orgHeadTrendFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('org_dashboard.table.no_data')}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                {t('org_dashboard.export.recommendations', 'Recommendations')}
              </h3>
            </div>
            {recommendations.length ? (
              <div className="space-y-3">
                {recommendations.slice(0, 2).map((item) => (
                  <div key={`${item.type}-${item.message}`} className="rounded-2xl border border-amber-100  p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-black">{item.priority}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{item.message}</p>
                    {item.suggestedAction ? (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.suggestedAction}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('org_dashboard.table.no_data')}</p>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group h-full max-h-[320px]">
            <div className="relative z-10 h-full flex flex-col">
              <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">
                {t('org_dashboard.export.title')}
              </h4>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                {t('org_dashboard.export.subtitle')}
              </p>

              <div className="space-y-3 mt-auto">
                <button
                  onClick={handleExportCsv}
                  disabled={!departments.length}
                  className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Share2 size={16} /> {t('org_dashboard.export.csv')}
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={!departments.length}
                  className="w-full py-4 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <FileDown size={16} /> {t('org_dashboard.export.pdf')}
                </button>
              </div>
            </div>
            <FilePieChart className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 rotate-12 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgHeadDashboard;