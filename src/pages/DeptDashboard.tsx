import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, Loader2, BarChart3, TrendingUp } from 'lucide-react';
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
import StatCard from '../components/StatCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDeptHeadAnalytics, selectDeptHead } from '../store/slices/deptHeadSlice';

const DeptDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { analytics: stats, loading } = useAppSelector(selectDeptHead);

  useEffect(() => {
    if (!stats) {
      void dispatch(fetchDeptHeadAnalytics());
    }
  }, [dispatch, stats]);

  const total = stats?.total ?? 0;
  const resolved = stats?.resolved ?? 0;
  const pending = stats?.pending ?? 0;
  const rate = stats?.resolvedPercentage ?? 0;

  const trendsData = useMemo(
    () => (stats?.monthlyTrends || []).map((item, index) => ({
      id: `${item.month}-${item.year}-${index}`,
      period: `${item.month} ${String(item.year).slice(2)}`,
      count: item.count,
    })),
    [stats?.monthlyTrends],
  );

  const categoryData = useMemo(
    () => (stats?.categoryStats || []).map((item) => ({
      name: item.category,
      count: item.count,
    })),
    [stats?.categoryStats],
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('org_dashboard.trends.title', 'Monthly Trends')}
            </h3>
          </div>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="deptTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006B5D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006B5D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [String(value ?? 0), t('org_dashboard.trends.count', 'Complaints')]}
                />
                <Area type="monotone" dataKey="count" stroke="#006B5D" fill="url(#deptTrendFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
              {t('org_dashboard.table.no_data')}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.stats.by_category', 'By Category')}
            </h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#006B5D" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
              {t('org_dashboard.table.no_data')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeptDashboard;
