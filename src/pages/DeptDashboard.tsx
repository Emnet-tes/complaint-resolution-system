import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, CheckCircle, Loader2, AlertCircle, UserCheck, PieChart as PieIcon } from 'lucide-react';
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
  Legend,
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
    const order = ['Critical', 'High', 'Medium', 'Low'];
    const dataMap = new Map(list.map((item) => [item.priority, item.count]));
    return order.map((priority) => ({
      name: t(`dept_complaints.priority.${priority}`, priority),
      count: dataMap.get(priority) || 0,
      rawPriority: priority,
    }));
  }, [stats?.priorityStats, t]);

  const assigneeData = useMemo(() => {
    return (stats?.assigneeStats || [])
      .map((item) => ({
        name: item.assignee,
        count: item.count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats?.assigneeStats]);

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
                    if (entry.rawPriority === 'Critical') color = '#ef4444';
                    else if (entry.rawPriority === 'High') color = '#f97316';
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

        {/* Agent Workload Horizontal Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <UserCheck size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.stats.agent_workload', 'Agent Workload')}
            </h3>
          </div>
          {assigneeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={assigneeData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [String(value ?? 0), t('org_dashboard.trends.count', 'Complaints')]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
              {t('org_dashboard.table.no_data')}
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[420px]">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-[#006B5D]" />
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {t('dept_dashboard.stats.status_distribution', 'Status Distribution')}
            </h3>
          </div>
          {statusData.length > 0 ? (
            <div className="h-[90%] flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="w-full md:w-1/2 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full md:w-1/2 max-w-md px-6">
                {statusData.map((item) => (
                  <div key={item.name} className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.name}</span>
                      </div>
                      <p className="text-2xl font-black text-slate-800 mt-1">{item.value}</p>
                    </div>
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
      </div>
    </div>
  );
};

export default DeptDashboard;
