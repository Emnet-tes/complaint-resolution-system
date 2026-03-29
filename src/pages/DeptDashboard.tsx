import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { deptAdminApi, type DeptAdminAnalytics } from '../api/deptadmin';

const DeptDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DeptAdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await deptAdminApi.getAnalytics();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch DeptAdmin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  const total = stats?.total ?? 0;
  const resolved = stats?.resolved ?? 0;
  const pending = stats?.pending ?? 0;
  const rate = stats?.resolvedPercentage ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {t('dept_dashboard.breadcrumb')}
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('dept_dashboard.title')}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('dept_dashboard.stats.total')}
          value={total.toLocaleString()}
          subValue={t('dept_dashboard.stats.sub_assigned')}
          icon={FileText}
          color="bg-blue-600"
        />
        <StatCard
          title={t('dept_dashboard.stats.pending')}
          value={pending.toLocaleString()}
          subValue={t('dept_dashboard.stats.sub_rate', { rate: String(rate) })}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title={t('dept_dashboard.stats.resolved')}
          value={resolved.toLocaleString()}
          subValue={t('dept_dashboard.stats.sub_cases')}
          icon={CheckCircle}
          color="bg-[#006B5D]"
        />
      </div>
    </div>
  );
};

export default DeptDashboard;

