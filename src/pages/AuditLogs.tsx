import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Building2, Clock3, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { sysAdminApi, type AuditLogActivity, type AuditLogSummary } from '../api/sysadmin';
import StatCard from '../components/StatCard';
import { Table, type Column } from '../components/Table';

const EMPTY_SUMMARY: AuditLogSummary = {
  totalActiveAdmins: 0,
  last30Days: {
    userManagementActions: 0,
    organizationChanges: 0,
    departmentChanges: 0,
  },
  recentActivities: [],
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const AuditLogs = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<AuditLogActivity[]>([]);
  const [summary, setSummary] = useState<AuditLogSummary>(EMPTY_SUMMARY);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAuditData = useCallback(async (requestedPage = page, requestedLimit = limit) => {
    try {
      setLoading(true);
      const [activitiesResponse, summaryResponse] = await Promise.all([
        sysAdminApi.getAuditActivities(requestedPage, requestedLimit),
        sysAdminApi.getAuditSummary(),
      ]);

      setActivities(activitiesResponse.data.data);
      setTotalRecords(activitiesResponse.data.pagination.total);
      setTotalPages(activitiesResponse.data.pagination.pages || 1);
      setSummary(summaryResponse.data.summary);
    } catch (error) {
      console.error('Failed to load audit logs', error);
      setActivities([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit, page]);

  useEffect(() => {
    void fetchAuditData();
  }, [fetchAuditData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAuditData(page, limit);
  };

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const statusClassName = (status: string) => {
    if (status === 'SUCCESS') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'FAILED') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  const columns: Column<AuditLogActivity>[] = [
    {
      header: t('audit_logs.table.time', 'Time'),
      key: 'createdAt',
      render: (activity) => (
        <div className="min-w-[160px]">
          <div className="font-semibold text-slate-800">{formatTimestamp(activity.createdAt)}</div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{activity.adminRole || 'Admin'}</div>
        </div>
      ),
    },
    {
      header: t('audit_logs.table.user', 'User'),
      key: 'user',
      render: (activity) => (
        <div>
          <div className="font-bold text-slate-800">{activity.user.fullName}</div>
          <div className="text-[11px] text-slate-400">{activity.user.email}</div>
        </div>
      ),
    },
    {
      header: t('audit_logs.table.action', 'Action'),
      key: 'action',
      render: (activity) => (
        <div>
          <div className="font-bold text-[#006B5D]">{activity.action}</div>
          <div className="text-[11px] text-slate-500 max-w-xl">{activity.description}</div>
        </div>
      ),
    },
    {
      header: t('audit_logs.table.target', 'Target'),
      key: 'targetType',
      render: (activity) => (
        <div className="text-slate-600">
          <div className="font-semibold">{activity.targetType || '-'}</div>
          <div className="text-[11px] text-slate-400">{activity.targetId || '-'}</div>
        </div>
      ),
    },
    {
      header: t('audit_logs.table.status', 'Status'),
      key: 'status',
      render: (activity) => (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClassName(activity.status)}`}>
          {activity.status}
        </span>
      ),
    },
    {
      header: t('audit_logs.table.ip', 'IP'),
      key: 'ip',
      render: (activity) => (
        <div className="text-slate-500 text-sm">{activity.ip || '-'}</div>
      ),
    },
  ];

  const totalPagesSafe = Math.max(totalPages, 1);
  const tableSubtitle = `Showing ${activities.length} of ${totalRecords} records`;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            {t('audit_logs.breadcrumb', 'System Administration / Audit Logs')}
          </nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('audit_logs.title', 'Audit Logs')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 font-medium">
            {t('audit_logs.subtitle', 'Review administrative activity, trace changes, and monitor system actions.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('audit_logs.page_size', 'Page size')}</span>
            <select
              value={limit}
              onChange={(event) => {
                setPage(1);
                setLimit(Number(event.target.value));
              }}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#006B5D] px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#005a4e] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {t('audit_logs.refresh', 'Refresh')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title={t('audit_logs.cards.active_admins', 'Active Admins')}
          value={summary.totalActiveAdmins}
          subValue={t('audit_logs.cards.active_admins_sub', 'Currently active system administrators')}
          icon={Users}
          color="bg-[#006B5D]"
        />
        <StatCard
          title={t('audit_logs.cards.user_actions', 'User Actions')}
          value={summary.last30Days.userManagementActions}
          subValue={t('audit_logs.cards.last_30_days', 'Last 30 days')}
          icon={ShieldCheck}
          color="bg-blue-600"
        />
        <StatCard
          title={t('audit_logs.cards.org_changes', 'Organization Changes')}
          value={summary.last30Days.organizationChanges}
          subValue={t('audit_logs.cards.last_30_days', 'Last 30 days')}
          icon={Building2}
          color="bg-indigo-500"
        />
        <StatCard
          title={t('audit_logs.cards.dept_changes', 'Department Changes')}
          value={summary.last30Days.departmentChanges}
          subValue={t('audit_logs.cards.last_30_days', 'Last 30 days')}
          icon={Clock3}
          color="bg-amber-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              {t('audit_logs.table_title', 'Activity Feed')}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {tableSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Activity size={14} />
            {t('audit_logs.live', 'Live audit trail')}
          </div>
        </div>

        <Table
          data={activities}
          columns={columns}
          loading={loading}
          noDataMessage={t('audit_logs.no_data', 'No audit activity found')}
        />

        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {t('audit_logs.pagination', 'Page {page} of {pages}', {
              page: String(page),
              pages: String(totalPagesSafe),
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('audit_logs.previous', 'Previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPagesSafe, current + 1))}
              disabled={page >= totalPagesSafe || loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('audit_logs.next', 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;