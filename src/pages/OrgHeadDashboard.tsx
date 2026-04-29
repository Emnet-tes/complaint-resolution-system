import { useEffect, useMemo, useState } from 'react';
import { BarChart3, FileText, CheckCircle2, Clock, Loader2, Share2, FilePieChart, FileDown } from 'lucide-react';
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
  Cell,
} from 'recharts';

const getSummaryValue = (summary: OrgHeadAnalytics['summary'] | undefined, keys: string[], fallback = 0) => {
  if (!summary) return fallback;
  for (const key of keys) {
    const value = summary[key as keyof NonNullable<OrgHeadAnalytics['summary']>];
    if (typeof value === 'number') return value;
  }
  return fallback;
};



const buildSafeFileName = (prefix: string, extension: string) => {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.${extension}`;
};

type DepartmentSummaryRow = {
  departmentId: string;
  name: string;
  total: number;
  resolved: number;
  pending: number;
  resolvedPercentage: number;
};

type OrgHeadAnalyticsResponse = OrgHeadAnalytics & {
  departments?: DepartmentSummaryRow[];
};

const CHART_COLORS = ['#006B5D', '#0EA5E9', '#F59E0B'];

const OrgHeadDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrgHeadAnalyticsResponse | null>(null);

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
  const totalDepartments = getSummaryValue(summary, ['totalDepartments'], departments.length);
  const totalHeads = getSummaryValue(summary, ['totalHeads'], 0);
  const totalResolved = getSummaryValue(summary, ['totalResolved', 'resolved']);
  const totalPending = getSummaryValue(summary, ['totalPending', 'pending']);

  const chartData = useMemo(
    () => departments.map((department) => ({
      ...department,
      totalLabel: t('org_dashboard.chart.total'),
      resolvedLabel: t('org_dashboard.chart.resolved'),
      pendingLabel: t('org_dashboard.chart.pending'),
    })),
    [departments, t],
  );

  const handleExportCsv = () => {
    const csvContent = [
      [
        'section',
        'label',
        'value',
        'note',
      ].join(','),
      ['summary', t('org_dashboard.csv.total_departments'), String(totalDepartments), ''].join(','),
      ['summary', t('org_dashboard.csv.total_heads'), String(totalHeads), ''].join(','),
      ['summary', t('org_dashboard.csv.total_resolved'), String(totalResolved), ''].join(','),
      ['summary', t('org_dashboard.csv.total_pending'), String(totalPending), ''].join(','),
      '',
      [
        t('org_dashboard.csv.department_name'),
        t('org_dashboard.csv.total'),
        t('org_dashboard.csv.resolved'),
        t('org_dashboard.csv.pending'),
        t('org_dashboard.csv.resolved_percentage'),
      ].join(','),
      ...departments.map((department) => [
        department.name.replaceAll(',', ' '),
        String(department.total),
        String(department.resolved),
        String(department.pending),
        `${department.resolvedPercentage}%`,
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
      `${t('org_dashboard.stats.dept_heads')}: ${totalHeads}`,
      `${t('org_dashboard.stats.total_resolved')}: ${totalResolved}`,
      `${t('org_dashboard.stats.total_pending')}: ${totalPending}`,
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
        `${department.name} | ${t('org_dashboard.table.col_total')}: ${department.total} | ${t('org_dashboard.table.col_resolved')}: ${department.resolved} | ${t('org_dashboard.table.col_pending')}: ${department.pending} | ${t('org_dashboard.table.col_success')}: ${department.resolvedPercentage}%`,
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
        <StatCard title={t('org_dashboard.stats.dept_heads')} value={totalHeads} subValue={t('org_dashboard.stats.sub_staff')} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title={t('org_dashboard.stats.total_resolved')} value={totalResolved} subValue={t('org_dashboard.stats.sub_resolved')} icon={Clock} color="bg-amber-500" />
        <StatCard title={t('org_dashboard.stats.total_pending')} value={totalPending} subValue={t('org_dashboard.stats.sub_pending')} icon={FileText} color="bg-[#006B5D]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('org_dashboard.chart.title')}
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 h-[420px]">
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
                  <Bar dataKey="total" name={t('org_dashboard.chart.total')} radius={[6, 6, 0, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`total-${entry.departmentId}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="resolved" name={t('org_dashboard.chart.resolved')} radius={[6, 6, 0, 0]} barSize={24}  />
                  <Bar dataKey="pending" name={t('org_dashboard.chart.pending')} radius={[6, 6, 0, 0]} barSize={24} fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                {t('org_dashboard.table.no_data')}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group h-full min-h-[320px]">
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