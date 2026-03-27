import { useEffect, useState } from 'react';
import { Building2, Users as UsersIcon, Clock, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 1. Import i18n
import { orgAdminApi } from '../api/orgadmin';
import { StatCard } from '../components/OrgComponents';
import { Table, type Column } from '../components/Table'; // 2. Import Table

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
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  const summary = stats?.summary || { totalDepartments: 0, totalAdmins: 0, totalResolved: 0, totalPending: 0 };
  const totalTickets = summary.totalResolved + summary.totalPending;
  const successRate = totalTickets > 0 ? ((summary.totalResolved / totalTickets) * 100).toFixed(1) : "0";

  // 3. Define Table Columns using t()
  const columns: Column<OrgAdminAnalytics['departments'][0]>[] = [
    { 
      header: t('org_dashboard.table.col_dept'), 
      key: 'name', 
      className: 'font-bold text-slate-700' 
    },
    { 
      header: t('org_dashboard.table.col_total'), 
      key: 'total', 
      className: 'text-center font-mono text-slate-500', 
      headerClassName: 'text-center' 
    },
    { 
      header: t('org_dashboard.table.col_resolved'), 
      key: 'resolved', 
      className: 'text-center font-mono font-bold text-emerald-600', 
      headerClassName: 'text-center' 
    },
    { 
      header: t('org_dashboard.table.col_pending'), 
      key: 'pending', 
      className: 'text-center font-mono font-bold text-amber-600', 
      headerClassName: 'text-center' 
    },
    { 
      header: t('org_dashboard.table.col_success'), 
      key: 'resolvedPercentage', 
      className: 'text-right', 
      headerClassName: 'text-right',
      render: (dept) => (
        <span className='text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100'>
          {dept.resolvedPercentage}%
        </span>
      )
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {t('org_dashboard.nav_path')}
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('org_dashboard.title')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title={t('org_dashboard.stats.total_depts')} 
          value={summary.totalDepartments} 
          subValue={t('org_dashboard.stats.sub_active')} 
          icon={Building2} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title={t('org_dashboard.stats.dept_admins')} 
          value={summary.totalAdmins} 
          subValue={t('org_dashboard.stats.sub_staff')} 
          icon={UsersIcon} 
          color="bg-[#006B5D]" 
        />
        <StatCard 
          title={t('org_dashboard.stats.total_resolved')} 
          value={summary.totalResolved} 
          subValue={`${successRate}% ${t('org_dashboard.stats.success_rate')}`} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title={t('org_dashboard.stats.total_pending')} 
          value={summary.totalPending} 
          subValue={t('org_dashboard.stats.sub_awaiting')} 
          icon={Clock} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('org_dashboard.table.title')}
            </h3>
          </div>
          
          {/* 4. Use the Reusable Table Component */}
          <Table 
            data={stats?.departments || []} 
            columns={columns} 
            noDataMessage={t('org_dashboard.table.no_data')}
          />
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;