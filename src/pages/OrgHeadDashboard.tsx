import { useEffect, useMemo, useState } from 'react';
import { BarChart3, FileText, Paperclip, CheckCircle2, Clock, Loader2, MapPin, Share2, FilePieChart, FileDown} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Table, type Column } from '../components/Table';
import { StatCard } from '../components/OrgComponents';
import { jsPDF } from 'jspdf';
import {
  orgHeadApi,
  type OrgHeadAnalytics,
  type OrgHeadComplaint,
} from '../api/orghead';

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

  const complaints = useMemo(
    () => stats?.complaints || stats?.recentComplaints || [],
    [stats],
  );

  const summary = stats?.summary;
  const totalDepartments = getSummaryValue(summary, ['totalDepartments'], complaints.length);
  const totalHeads = getSummaryValue(summary, ['totalHeads'], 0);
  const totalResolved = getSummaryValue(summary, ['totalResolved', 'resolved']);
  const totalPending = getSummaryValue(summary, ['totalPending', 'pending']);
  
  const statusSummary = useMemo(() => {
    return [
      { name: 'Submitted', value: complaints.filter((c) => c.status === 'Submitted').length },
      { name: 'Manual Review', value: complaints.filter((c) => c.status === 'Manual Review').length },
      { name: 'In Progress', value: complaints.filter((c) => c.status === 'In Progress').length },
      { name: 'Resolved', value: complaints.filter((c) => c.status === 'Resolved').length },
      { name: 'Rejected', value: complaints.filter((c) => c.status === 'Rejected').length },
    ].filter((item) => item.value > 0);
  }, [complaints]);

 
  
  const handleExportCsv = () => {
    const complaintRows = complaints.map((complaint) => [
      complaint._id,
      complaint.title.replaceAll(',', ' '),
      complaint.department?.name || 'Unassigned',
      complaint.status.replaceAll(',', ' '),
      String(complaint.priority || ''),
      String(complaint.attachments?.length || 0),
      complaint.location?.locationName || '',
      new Date(complaint.createdAt).toISOString(),
    ].join(','));

    const csvContent = [
      ['section,label,value,note'].join(','),
      '',
      ['id,title,department,status,priority,attachments,location,createdAt'].join(','),
      ...complaintRows,
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
    doc.text('OrgHead Dashboard Report', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Summary Cards', 14, y);
    y += 8;

    doc.setFontSize(10);


    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Status Breakdown', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    statusSummary.forEach((item) => {
      doc.text(`${item.name}: ${item.value}`, 14, y);
      y += 6;
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Recent Complaints', 14, y);
    y += 8;

    doc.setFontSize(9);
    complaints.slice(0, 12).forEach((complaint) => {
      const line = `${complaint.title} | ${complaint.department?.name || 'Unassigned'} | ${complaint.status} | ${complaint.priority || '-'}`;
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

  const columns: Column<OrgHeadComplaint>[] = [
    {
      header: 'Complaint',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{row.description}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department',
      render: (row) => row.department?.name || 'Unassigned',
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase border w-fit inline-block bg-slate-50 text-slate-600 border-slate-200">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => row.priority || '-',
    },
    {
      header: 'Attachments',
      key: 'attachments',
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-lg border border-teal-100 bg-teal-50 px-2 py-1 text-[10px] font-black uppercase text-[#006B5D]">
          <Paperclip size={12} /> {row.attachments?.length || 0}
        </span>
      ),
    },
    {
      header: 'Location',
      key: 'location',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <MapPin size={12} /> {row.location?.locationName || 'No location'}
        </span>
      ),
    },
  ];

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
          {t('org_dashboard.nav_path', 'OrgHead / Dashboard')}
        </nav>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {t('org_dashboard.title', 'OrgHead Dashboard')}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2">Complaint analytics, status distribution, and exportable summary cards.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
              title={t('org_dashboard.stats.total_depts', 'Total Departments')}
              value={totalDepartments}
              subValue={t('org_dashboard.stats.sub_active', 'Departments in scope')}
          icon={FileText}
          color="bg-indigo-500"
        />
        <StatCard
              title={t('org_dashboard.stats.dept_admins', 'Total Heads')}
              value={totalHeads}
              subValue={t('org_dashboard.stats.sub_staff', 'Department heads assigned')}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
        <StatCard
              title={t('org_dashboard.stats.total_resolved', 'Resolved')}
              value={totalResolved}
              subValue={t('org_dashboard.stats.success_rate', 'Resolved complaints')}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
              title={t('org_dashboard.stats.total_pending', 'Pending')}
              value={totalPending}
              subValue={t('org_dashboard.stats.sub_awaiting', 'Waiting for review')}
          icon={Paperclip}
          color="bg-[#006B5D]"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
 <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              Recent Organization Complaints
            </h3>
          </div>

          <Table
            data={complaints}
            columns={columns}
            noDataMessage={t('org_dashboard.table.no_data', 'No complaints found')}
          />
        </div>

            <div className="xl:col-span-4">
              <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group h-full min-h-[320px]">
                <div className="relative z-10 h-full flex flex-col">
                  <h4 className="font-black text-xl mb-3 tracking-tight italic text-emerald-400">
                    {t('sys_dashboard.insights.title', 'Export Center')}
                  </h4>
                  <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                    Export complaint analytics and recent complaint rows as CSV or PDF.
                  </p>

                  <div className="space-y-3 mt-auto">
                    <button
                      onClick={handleExportCsv}
                      disabled={!complaints.length}
                      className="w-full py-4 bg-[#006B5D] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#005a4e] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Share2 size={16} /> {t('sys_dashboard.insights.export', 'Export CSV')}
                    </button>
                    <button
                      onClick={handleExportPdf}
                      disabled={!complaints.length}
                      className="w-full py-4 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-white/10"
                    >
                      <FileDown size={16} /> PDF
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