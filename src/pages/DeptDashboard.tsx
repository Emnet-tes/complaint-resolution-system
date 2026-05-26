import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, Loader2, AlertCircle, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
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
    void dispatch(fetchDeptHeadAnalytics());
  }, [dispatch]);

  const total = stats?.total ?? 0;
  const resolved = stats?.resolved ?? 0;
  const pending = stats?.pending ?? 0;
  const rate = stats?.resolvedPercentage ?? 0;

  const priorityData = useMemo(() => {
    const list = stats?.priorityStats || [];
    const order = ['High', 'Medium', 'Low'];
    const dataMap = new Map(list.map((item) => [item.priority, item.count]));
    return order.map((priority) => ({
      name: t(`dept_complaints.priority.${priority}`, priority),
      count: dataMap.get(priority) || 0,
      rawPriority: priority,
    }));
  }, [stats?.priorityStats, t]);

  const statusData = useMemo(() => {
    const list = stats?.statusStats || [];
    const colorsMap: Record<string, string> = {
      Resolved: '#10b981',
      'In Progress': '#3b82f6',
      Submitted: '#64748b',
      Rejected: '#ef4444',
    };
    return list.map((item) => ({
      name: t(`dept_complaints.status.${item.status}`, item.status),
      value: item.count,
      color: colorsMap[item.status] || '#64748b',
    }));
  }, [stats?.statusStats, t]);

  const trendsData = useMemo(
    () => (stats?.monthlyTrends || []).map((item, index) => ({
      id: `${item.month}-${item.year}-${index}`,
      period: `${item.month} ${String(item.year).slice(2)}`,
      count: item.count,
    })),
    [stats?.monthlyTrends],
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
        {/* Priority Urgency Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.stats.priority', 'Priority Urgency')}
            </h3>
          </div>
          {priorityData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [String(value ?? 0), t('org_dashboard.trends.count', 'Complaints')]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                  {priorityData.map((entry, index) => {
                    let color = '#64748b';
                    if (entry.rawPriority === 'High') color = '#f97316';
                    else if (entry.rawPriority === 'Medium') color = '#eab308';
                    else if (entry.rawPriority === 'Low') color = '#22c55e';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
              {t('org_dashboard.table.no_data')}
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.stats.status_distribution', 'Status Distribution')}
            </h3>
          </div>
          {statusData.length > 0 ? (
            <div className="h-[80%] flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-full md:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5 w-full md:w-1/2 max-w-md px-4 justify-center">
                {statusData.map((item) => (
                  <div key={item.name} className="bg-slate-50 border border-gray-100 rounded-2xl py-2.5 px-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{item.name}</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
              {t('org_dashboard.table.no_data')}
            </div>
          )}
        </div>

        {/* Monthly Trends Area Chart */}
        <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[350px]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.trends.title', 'Monthly Trends')}
            </h3>
          </div>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="deptTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006B5D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006B5D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value) => [String(value ?? 0), t('dept_dashboard.trends.count', 'Complaints')]}
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
      </div>
    </div>
  );
};

export default DeptDashboard;
