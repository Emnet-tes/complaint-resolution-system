import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Table, type Column } from '../components/Table';
import { orgHeadApi } from '../api/orghead';
import type { Department } from '../api/orgadmin';

const OrgHeadDepartments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const res = await orgHeadApi.listDepartments();
        setDepartments(res.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error', 'Failed to fetch departments'));
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [t]);

  const filteredDepartments = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return departments;
    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(normalized) ||
        department.code.toLowerCase().includes(normalized) ||
        department.description.toLowerCase().includes(normalized),
    );
  }, [departments, searchTerm]);

  const columns: Column<Department>[] = [
    {
      header: t('dept_mgmt.table.dept', 'Department'),
      key: 'name',
      className: 'font-bold text-slate-800',
    },
    {
      header: t('dept_mgmt.table.code', 'Code'),
      key: 'code',
      className: 'font-mono text-xs text-slate-500 uppercase',
    },
    {
      header: t('dept_mgmt.modals.labels.desc', 'Description'),
      key: 'description',
      className: 'text-slate-500 text-xs',
    },
    {
      header: t('dept_mgmt.table.status', 'Status'),
      key: 'isActive',
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${row.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          {row.isActive ? t('dept_mgmt.table.active', 'Active') : t('dept_mgmt.table.inactive', 'Inactive')}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">OrgHead / Departments</nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Departments</h1>
        <p className="text-sm text-slate-500 font-medium">Read-only department list for organizational oversight.</p>
      </div>

      <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#006B5D]/10 transition-all">
        <Search size={18} className="text-slate-400 mr-2" />
        <input
          placeholder={t('dept_mgmt.filters.search_name', 'Search department name')}
          className="w-full text-sm outline-none font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      ) : (
        <Table<Department>
          data={filteredDepartments}
          columns={columns}
          noDataMessage={t('dept_mgmt.table.no_data', 'No departments found')}
        />
      )}
    </div>
  );
};

export default OrgHeadDepartments;