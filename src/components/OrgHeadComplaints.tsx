import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  List,
  Map as MapIcon,
  Search,
  ChevronDown,
  Loader2,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Table, type Column } from './Table';
import Modal from './Modal';
import {
  orgHeadApi,
  type OrgHeadComplaint,
  type OrgHeadComplaintPriority,
  type OrgHeadComplaintStatus,
} from '../api/orghead';
import type { Department } from '../api/orgadmin';

const ORGHEAD_STATUS_OPTIONS: OrgHeadComplaintStatus[] = [
  'Submitted',
  'Manual Review',
  'In Progress',
  'Resolved',
  'Rejected',
];

const ORGHEAD_PRIORITY_OPTIONS: OrgHeadComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

const OrgHeadComplaints = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<OrgHeadComplaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<OrgHeadComplaint | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    department: '',
    priority: 'Medium' as OrgHeadComplaintPriority,
    status: 'Submitted' as OrgHeadComplaintStatus,
    isSpam: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, departmentsRes] = await Promise.all([
        orgHeadApi.getOrganizationComplaints(),
        orgHeadApi.listDepartments(),
      ]);
      setComplaints(complaintsRes.data || []);
      setDepartments(departmentsRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesStatus = statusFilter ? c.status === statusFilter : true;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      return (
        c.title.toLowerCase().includes(normalizedSearch) ||
        c.description.toLowerCase().includes(normalizedSearch) ||
        c._id.toLowerCase().includes(normalizedSearch) ||
        (c.submittedBy?.fullName || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [complaints, searchTerm, statusFilter]);

  const mapPoints = useMemo(() => {
    return filteredComplaints
      .map((complaint) => {
        const coords = complaint.location?.coordinates;
        if (!coords || coords.length < 2) return null;

        const [lng, lat] = coords;
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;

        return {
          complaint,
          lat,
          lng,
        };
      })
      .filter((point): point is { complaint: OrgHeadComplaint; lat: number; lng: number } => !!point);
  }, [filteredComplaints]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (mapPoints.length > 0) return [mapPoints[0].lat, mapPoints[0].lng];
    return [9.03, 38.74];
  }, [mapPoints]);

  const openOverrideModal = (complaint: OrgHeadComplaint) => {
    setSelectedComplaint(complaint);
    setOverrideForm({
      department: complaint.department?._id || '',
      priority: (complaint.priority as OrgHeadComplaintPriority) || 'Medium',
      status: complaint.status || 'Submitted',
      isSpam: complaint.isSpam,
    });
    setIsOverrideModalOpen(true);
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    const loadId = toast.loading(t('org_head_complaints.toasts.confirming', 'Confirming...'));
    try {
      await orgHeadApi.overrideComplaint(selectedComplaint._id, {
        department: overrideForm.department || undefined,
        priority: overrideForm.priority,
        status: overrideForm.status,
        isSpam: overrideForm.isSpam,
      });

      const selectedDept = departments.find((d) => d._id === overrideForm.department);

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === selectedComplaint._id
            ? {
                ...c,
                department: selectedDept
                  ? {
                      _id: selectedDept._id,
                      code: selectedDept.code,
                      name: selectedDept.name,
                    }
                  : c.department,
                priority: overrideForm.priority,
                status: overrideForm.status,
                isSpam: overrideForm.isSpam,
              }
            : c,
        ),
      );

      setIsOverrideModalOpen(false);
      setSelectedComplaint(null);
      toast.success(t('org_head_complaints.toasts.overridden', 'Complaint overridden successfully'), { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('org_head_complaints.toasts.error', 'Action failed.'), { id: loadId });
    } finally {
      setSubmitting(false);
    }
  };
  const STATUS_STYLES: Record<string, string> = {
    Submitted: 'bg-sky-100 text-sky-800 border-sky-300',
    'Manual Review': 'bg-amber-100 text-amber-800 border-amber-300',
    'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-300',
  };
  const columns: Column<OrgHeadComplaint>[] = [
    {
      header: t('complaints.table.title_desc'),
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">{row.description}</p>
        </div>
      ),
    },
    {
      header: t('complaints.table.type'),
      key: 'department',
      className: 'text-slate-500 font-medium',
      render: (row) => row.department?.name || t('dept_mgmt.table.unassigned'),
    },
   {
  header: t('complaints.table.status'),
  key: 'status',
  render: (row) => (
    <span
      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border w-fit inline-block ${
        STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'
      }`}
    >
      {row.status}
    </span>
  ),
},
    {
      header: t('complaints.table.priority'),
      key: 'priority',
      className: 'text-slate-500 font-medium',
    },
    {
      header: t('complaints.table.date'),
      key: 'createdAt',
      className: 'text-slate-400 italic text-[11px]',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: t('dept_mgmt.table.actions'),
      key: 'actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openOverrideModal(row)}
            className="text-amber-600 font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer flex items-center"
          >
            <Edit3 size={12} className="mr-1" />
            {t('org_head_complaints.override')}
          </button>
          <button
            onClick={() => navigate(`/complaints/${row._id}`, { state: { complaint: row, source: 'org' } })}
            className="text-[#006B5D] font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer"
          >
            {t('complaints.table.view_details')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('org_head_complaints.nav')}</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('org_head_complaints.title')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('org_head_complaints.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <List size={14} className="mr-2" /> {t('org_head_complaints.list_view')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <MapIcon size={14} className="mr-2" /> {t('org_head_complaints.map_view')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-2 md:gap-0 md:items-center">
        <div className="flex-1 flex items-center md:border-r border-gray-100 px-4">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('org_head_complaints.search_placeholder')}
            className="w-full text-sm outline-none bg-transparent font-medium"
          />
        </div>
        <div className="flex items-center gap-3 px-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('org_head_complaints.status_label')}</div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-slate-600 outline-none"
            >
              <option value="">{t('org_head_complaints.all')}</option>
              {ORGHEAD_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      ) : viewMode === 'list' ? (
        <Table data={filteredComplaints} columns={columns} noDataMessage={t('org_head_complaints.no_data')} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[560px]">
          <MapContainer center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapPoints.map((point) => (
              <CircleMarker
                key={point.complaint._id}
                center={[point.lat, point.lng]}
                radius={8}
                pathOptions={{ color: '#006B5D', fillColor: '#0f766e', fillOpacity: 0.7 }}
              >
                <Popup>
                  <div className="space-y-1 min-w-[180px]">
                    <p className="font-bold text-slate-800">{point.complaint.title}</p>
                    <p className="text-xs text-slate-500">{t('org_head_complaints.popup.status')}: {point.complaint.status}</p>
                    <p className="text-xs text-slate-500">{t('org_head_complaints.popup.priority')}: {point.complaint.priority}</p>
                    <p className="text-xs text-slate-500">{t('org_head_complaints.popup.department')}: {point.complaint.department?.name || t('dept_mgmt.table.unassigned')}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {!mapPoints.length && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('org_head_complaints.no_location')}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOverrideModalOpen} onClose={() => setIsOverrideModalOpen(false)} title={t('org_head_complaints.override_title')}>
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              {t('org_head_complaints.override_note')}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('org_head_complaints.department')}</label>
            <select
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
              value={overrideForm.department}
              onChange={(e) => setOverrideForm({ ...overrideForm, department: e.target.value })}
            >
              <option value="">{t('dept_mgmt.table.unassigned')}</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('org_head_complaints.priority')}</label>
              <select
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
                value={overrideForm.priority}
                onChange={(e) => setOverrideForm({ ...overrideForm, priority: e.target.value as OrgHeadComplaintPriority })}
              >
                {ORGHEAD_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('org_head_complaints.status_label')}</label>
              <select
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none"
                value={overrideForm.status}
                onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value as OrgHeadComplaintStatus })}
              >
                {ORGHEAD_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              checked={overrideForm.isSpam}
              onChange={(e) => setOverrideForm({ ...overrideForm, isSpam: e.target.checked })}
              className="w-4 h-4 accent-[#006B5D]"
            />
            <label className="text-xs font-bold text-slate-600">{t('org_head_complaints.mark_spam')}</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin mx-auto" /> : t('org_head_complaints.apply_override')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default OrgHeadComplaints;