import { useEffect, useState } from 'react';
import { Building2, Users as UsersIcon, BarChart3, Loader2, Download, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { orgAdminApi, type OrgAdminAnalytics } from '../api/orgadmin';
import { StatCard } from '../components/OrgComponents';
import jsPDF from 'jspdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const EMPTY_SUMMARY: OrgAdminAnalytics['summary'] = {
  totalDepartments: 0,
  totalDepartmentHeads: 0,
  activeDepartmentHeads: 0,
  inactiveDepartmentHeads: 0,
  departmentsWithHeads: 0,
  departmentsWithoutHeads: 0,
  departmentsWithActiveHeads: 0,
  departmentsWithInactiveHeads: 0,
  systemHealthScore: 0,
};

const OrgDashboard = () => {
  const { t } = useTranslation();
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
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-3">
        <Loader2 className="animate-spin text-slate-400" size={40} />
        <p className="font-black text-[10px] uppercase tracking-[0.2em] italic">
          {t('org_dashboard.loading')}
        </p>
      </div>
    );
  }

  const summary = stats?.summary || EMPTY_SUMMARY;
  console.log("Analytics Data:", summary); 
  const departments = stats?.departments || [];
  const totalAssignedComplaints = departments.reduce((total, department) => {
    return total + department.metrics.totalComplaintsAssigned;
  }, 0);
  const totalNewComplaints = departments.reduce((total, department) => {
    return total + department.metrics.newComplaintsLast30Days;
  }, 0);
  const chartData = departments.map((department) => ({
    name: department.name,
    coverage: department.metrics.hasHeadAssigned ? 100 : 0,
    volume: department.metrics.totalComplaintsAssigned,
  }));

  const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const handleExportCsv = () => {
    const summaryRows: (string | number | boolean)[][] = [
      ['metric', 'value'],
      ['totalDepartments', summary.totalDepartments],
      ['totalDepartmentHeads', summary.totalDepartmentHeads],
      ['activeDepartmentHeads', summary.activeDepartmentHeads],
      ['inactiveDepartmentHeads', summary.inactiveDepartmentHeads],
      ['departmentsWithHeads', summary.departmentsWithHeads],
      ['departmentsWithoutHeads', summary.departmentsWithoutHeads],
      ['departmentsWithActiveHeads', summary.departmentsWithActiveHeads],
      ['departmentsWithInactiveHeads', summary.departmentsWithInactiveHeads],
      ['systemHealthScore', summary.systemHealthScore],
      [],
      ['departmentId', 'name', 'hasHeadAssigned', 'headStatus', 'totalComplaintsAssigned', 'newComplaintsLast30Days'],
      ...departments.map((department) => [
        department.departmentId,
        department.name,
        department.metrics.hasHeadAssigned,
        department.metrics.headStatus,
        department.metrics.totalComplaintsAssigned,
        department.metrics.newComplaintsLast30Days,
      ]),
    ];

    const csvContent = summaryRows
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `org_dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(t('org_dashboard.title'), margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(t('org_dashboard.subtitle'), margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(t('org_dashboard.export.pdf_summary'), margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = [
      `${t('org_dashboard.stats.total_depts_heads')}: ${summary.totalDepartments}`,
      `${t('org_dashboard.stats.total_heads', { count: summary.totalDepartmentHeads })}`,
      `${t('org_dashboard.stats.active_inactive_heads')}: ${summary.activeDepartmentHeads} (${t('org_dashboard.stats.inactive_heads', { count: summary.inactiveDepartmentHeads })})`,
      `${t('org_dashboard.stats.covered_uncovered')}: ${summary.departmentsWithHeads} (${t('org_dashboard.stats.not_covered', { count: summary.departmentsWithoutHeads })})`,
      `${t('org_dashboard.stats.active_inactive_coverage')}: ${summary.departmentsWithActiveHeads} (${t('org_dashboard.stats.inactive_coverage', { count: summary.departmentsWithInactiveHeads })})`,
      `${t('org_dashboard.chart.summary')}: ${totalAssignedComplaints}`,
      `${t('org_dashboard.chart.new_30d', { count: totalNewComplaints })}`,
    ];

    summaryLines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 16;
      }
      doc.text(`• ${line}`, margin, y);
      y += 6;
    });

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(t('org_dashboard.export.pdf_departments'), margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    departments.forEach((department) => {
      const lines = [
        department.name,
        `${t('org_dashboard.table.col_status')}: ${department.metrics.headStatus}`,
        `${t('org_dashboard.table.col_assigned')}: ${department.metrics.totalComplaintsAssigned}`,
        `${t('org_dashboard.table.col_recent')}: ${department.metrics.newComplaintsLast30Days}`,
      ];

      if (y > 268) {
        doc.addPage();
        y = 16;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(lines[0], margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(lines.slice(1).map((line) => `• ${line}`), margin + 2, y);
      y += 14;
    });

    doc.save(`org_dashboard_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {t('org_dashboard.nav_path')}
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('org_dashboard.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 font-medium">
          {t('org_dashboard.subtitle')}
        </p>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title={t('org_dashboard.stats.total_depts_heads')}
            value={summary.totalDepartments}
            subValue={t('org_dashboard.stats.total_heads', { count: summary.totalDepartmentHeads })}
            icon={Building2}
            color="bg-indigo-500"
          />
          <StatCard
            title={t('org_dashboard.stats.active_inactive_heads')}
            value={summary.activeDepartmentHeads}
            subValue={t('org_dashboard.stats.inactive_heads', { count: summary.inactiveDepartmentHeads })}
            icon={UsersIcon}
            color="bg-[#006B5D]"
          />
          <StatCard
            title={t('org_dashboard.stats.covered_uncovered')}
            value={summary.departmentsWithHeads}
            subValue={t('org_dashboard.stats.not_covered', { count: summary.departmentsWithoutHeads })}
            icon={BarChart3}
            color="bg-amber-500"
          />
          <StatCard
            title={t('org_dashboard.stats.active_inactive_coverage')}
            value={summary.departmentsWithActiveHeads}
            subValue={t('org_dashboard.stats.inactive_coverage', { count: summary.departmentsWithInactiveHeads })}
            icon={FileDown}
            color="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                   <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#006B5D]" />
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                {t('org_dashboard.chart.title')}
              </h3>
            </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                    {t('org_dashboard.chart.subtitle')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                    {t('org_dashboard.chart.new_30d', { count: totalNewComplaints })}
                  </p>
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
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
                      wrapperStyle={{ paddingBottom: '16px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="coverage" fill="#006B5D" radius={[4, 4, 0, 0]} barSize={22} name={t('org_dashboard.chart.coverage')} />
                    <Bar dataKey="volume" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={22} name={t('org_dashboard.chart.volume')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">
                  {t('org_dashboard.export.title')}
                </h4>
                <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                  {t('org_dashboard.export.subtitle')}
                </p>
                <button
                  onClick={handleExportCsv}
                  disabled={!departments.length}
                  className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} /> {t('org_dashboard.export.csv')}
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={!departments.length}
                  className="mt-3 w-full py-4 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  <FileDown size={16} /> {t('org_dashboard.export.pdf')}
                </button>
                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                  {t('org_dashboard.export.note')}
                </p>
              </div>
              <FileDown className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 rotate-12 transition-transform duration-700" />
            </div>
          </div>
        </div>
    </div>
  );
};

export default OrgDashboard;