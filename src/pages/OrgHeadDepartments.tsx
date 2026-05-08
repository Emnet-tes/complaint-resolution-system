import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Table, type Column } from '../components/Table';
import type { OrgHeadDeptHead } from '../api/orghead';
import type { Department } from '../api/orgadmin';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrgHeadDirectory, selectOrgHead } from '../store/slices/orgHeadSlice';

type ActiveTab = 'departments' | 'deptHeads';

const getDepartmentLabel = (department: OrgHeadDeptHead['department']) => {
  if (typeof department === 'string') return department || '—';
  return department?.name || '—';
};

const OrgHeadDepartments = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, departments, deptHeads, error } = useAppSelector(selectOrgHead);
  const [activeTab, setActiveTab] = useState<ActiveTab>('departments');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (departments.length === 0 && deptHeads.length === 0) {
      void dispatch(fetchOrgHeadDirectory());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error || t('dept_mgmt.toasts.fetch_error', 'Failed to fetch org head directory'));
    }
  }, [error, t]);

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

  const filteredDeptHeads = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return deptHeads;
    return deptHeads.filter((deptHead) => {
      const departmentLabel = getDepartmentLabel(deptHead.department).toLowerCase();
      return (
        deptHead.fullName.toLowerCase().includes(normalized) ||
        deptHead.email.toLowerCase().includes(normalized) ||
        deptHead.role.toLowerCase().includes(normalized) ||
        departmentLabel.includes(normalized)
      );
    });
  }, [deptHeads, searchTerm]);

  const departmentColumns: Column<Department>[] = [
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

  const deptHeadColumns: Column<OrgHeadDeptHead>[] = [
    {
      header: t('dept_mgmt.table.dept_head', 'Department Head'),
      key: 'fullName',
      className: 'font-bold text-slate-800',
    },
    {
      header: t('dept_mgmt.table.email', 'Email'),
      key: 'email',
      className: 'text-slate-500',
    },
    {
      header: t('dept_mgmt.table.department', 'Department'),
      key: 'department',
      className: 'text-slate-500',
      render: (row) => <span>{getDepartmentLabel(row.department)}</span>,
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

  const isDepartmentsTab = activeTab === 'departments';
  const currentLoading = loading;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {t('org_head_departments.nav')}
        </nav>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('org_head_departments.title')}</h1>
        <p className="text-sm text-slate-500 font-medium">{t('org_head_departments.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${isDepartmentsTab ? 'bg-white text-[#006B5D] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Building2 size={14} />
            {t('org_head_departments.tabs.departments', 'Departments')}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{departments.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deptHeads')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${!isDepartmentsTab ? 'bg-white text-[#006B5D] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={14} />
            {t('org_head_departments.tabs.dept_heads', 'Dept Heads')}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{deptHeads.length}</span>
          </button>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center focus-within:ring-2 focus-within:ring-[#006B5D]/10 transition-all lg:min-w-[320px]">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            placeholder={
              isDepartmentsTab
                ? t('org_head_departments.search_placeholder', 'Search departments')
                : t('org_head_departments.search_dept_heads_placeholder', 'Search department heads')
            }
            className="w-full text-sm outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {currentLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      ) : (
        <>
          {isDepartmentsTab ? (
            <Table<Department>
              data={filteredDepartments}
              columns={departmentColumns}
              noDataMessage={t('org_head_departments.no_data', 'No departments found')}
            />
          ) : (
            <Table
              data={filteredDeptHeads}
              columns={deptHeadColumns}
              noDataMessage={t('org_head_departments.no_dept_heads', 'No department heads found')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrgHeadDepartments;