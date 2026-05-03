import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  List,
  Map as MapIcon,
  Download,
  Search,
  ChevronDown,
  Loader2,
  Clock,
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Table, type Column } from '../components/Table';
import StatCard from './StatCard';
import { deptAdminApi, type AssignedComplaint, type ComplaintStatus } from '../api/deptadmin';

const DepartmentComplaints = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ total: 0, resolved: 0, pending: 0, resolvedPercentage: 0 });
  const [complaints, setComplaints] = useState<AssignedComplaint[]>([]);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef(true);

  const getComplaintId = (c: AssignedComplaint) => {
    return c._id || (c as any).id || '';
  };

  const mapPoints = useMemo(() => {
    return complaints
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
      .filter((point): point is { complaint: AssignedComplaint; lat: number; lng: number } => !!point);
  }, [complaints]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (mapPoints.length > 0) return [mapPoints[0].lat, mapPoints[0].lng];
    return [9.03, 38.74];
  }, [mapPoints]);

  const fetchAssigned = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError('');
    }
    try {
      const res = await deptAdminApi.getAssignedComplaints();
      const allData = res.data || [];
      
      const total = allData.length;
      const resolved = allData.filter(c => c.status === 'Resolved').length;
      const pending = allData.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
      const resolvedPercentage = total === 0 ? 0 : Math.round((resolved / total) * 100);
      setSummary({ total, resolved, pending, resolvedPercentage });
      
      const filtered = statusFilter ? allData.filter(c => c.status === statusFilter) : allData;
      setComplaints(filtered);

      // New assignment notification
      const incoming = allData;
      const incomingIds = new Set(incoming.map((c) => getComplaintId(c)));
      if (!firstLoadRef.current) {
        for (const c of incoming) {
          const cId = getComplaintId(c);
          if (!knownIdsRef.current.has(cId)) {
            toast(t('dept_complaints.notifications.assigned_title'), {
              position: 'bottom-right',
            });
            toast(c.title, { position: 'bottom-right' });
            break;
          }
        }
      }
      knownIdsRef.current = incomingIds;
      firstLoadRef.current = false;
    } catch (err: any) {
      setError(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const id = window.setInterval(() => fetchAssigned({ silent: true }), 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const columns: Column<AssignedComplaint>[] = useMemo(() => {
    return [
      {
        header: t('dept_complaints.table.id'),
        key: '_id',
        className: 'font-bold text-[#006B5D]',
        render: (row) => `#${getComplaintId(row).slice(-6)?.toUpperCase() || 'UNKNOWN'}`,
      },
      {
        header: t('dept_complaints.table.title_desc'),
        key: 'title',
        render: (row) => (
          <div>
            <p className="font-bold text-slate-800">{row.title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{row.description}</p>
          </div>
        ),
      },
      {
        header: t('dept_complaints.table.department'),
        key: 'department',
        className: 'text-slate-500 font-medium',
        render: (row) => row.department?.name || '-',
      },
      {
        header: t('dept_complaints.table.status'),
        key: 'status',
        render: (row) => (
          <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase border w-fit inline-block bg-slate-50 text-slate-600 border-slate-200">
            {t(`dept_complaints.status.${row.status}`)}
          </span>
        ),
      },
      {
        header: t('dept_complaints.table.priority'),
        key: 'priority',
        className: 'text-slate-500 font-medium',
        render: (row) => row.priority || '-',
      },
      {
        header: t('dept_complaints.table.date'),
        key: 'createdAt',
        className: 'text-slate-400 italic text-[11px]',
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        header: t('dept_complaints.table.action'),
        key: 'action',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => (
          <button
            onClick={() => navigate(`/complaints/${getComplaintId(row)}`, { state: { complaint: row } })}
            className="text-[#006B5D] font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer"
          >
            {t('dept_complaints.table.view_details')}
          </button>
        ),
      },
    ];
  }, [navigate, t]);

  const handleExport = () => {
    if (!complaints.length) return;
    const headers = ['id', 'title', 'status', 'priority', 'createdAt'];
    const rows = complaints.map((c) => [
      getComplaintId(c),
      (c.title || '').replaceAll(',', ' '),
      c.status,
      c.priority || '',
      c.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dept_complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {t('dept_complaints.nav')}
          </nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('dept_complaints.title')}
          </h1>
          <p className="text-sm text-slate-500 font-medium">{t('dept_complaints.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <List size={14} className="mr-2" /> {t('dept_complaints.list_view')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'
              }`}
            >
              <MapIcon size={14} className="mr-2" /> {t('dept_complaints.map_view')}
            </button>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-gray-50 flex items-center cursor-pointer shadow-sm"
          >
            <Download size={14} className="mr-2" /> {t('dept_complaints.export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('dept_complaints.stats.total')}
          value={summary.total.toLocaleString()}
          subValue={t('dept_complaints.stats.sub_assigned')}
          icon={List}
          color="bg-blue-600"
        />
        <StatCard
          title={t('dept_complaints.stats.pending')}
          value={summary.pending.toLocaleString()}
          subValue={t('dept_complaints.stats.sub_rate', { rate: String(summary.resolvedPercentage) })}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title={t('dept_complaints.stats.resolved')}
          value={summary.resolved.toLocaleString()}
          subValue={t('dept_complaints.stats.sub_cases')}
          icon={Download}
          color="bg-[#006B5D]"
        />
      </div>

      <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="flex-1 flex items-center border-r border-gray-100 px-4">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            placeholder={t('dept_complaints.search_placeholder')}
            className="w-full text-sm outline-none bg-transparent font-medium"
            disabled
          />
        </div>
        <div className="flex items-center gap-3 px-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('dept_complaints.filters.status')}
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-slate-600 outline-none"
            >
              <option value="">{t('dept_complaints.filters.all')}</option>
              <option value="Submitted">{t('dept_complaints.status.Submitted')}</option>
              <option value="In Progress">{t('dept_complaints.status.In Progress')}</option>
              <option value="Resolved">{t('dept_complaints.status.Resolved')}</option>
              <option value="Rejected">{t('dept_complaints.status.Rejected')}</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-bold">
          {error}
        </div>
      ) : viewMode === 'list' ? (
        <Table data={complaints} columns={columns} noDataMessage={t('dept_complaints.table.no_data')} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[560px]">
          <MapContainer center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapPoints.map((point) => (
              <CircleMarker
                key={getComplaintId(point.complaint)}
                center={[point.lat, point.lng]}
                radius={8}
                pathOptions={{ color: '#006B5D', fillColor: '#0f766e', fillOpacity: 0.7 }}
              >
                <Popup>
                  <div className="space-y-1 min-w-[180px]">
                    <p className="font-bold text-slate-800">{point.complaint.title}</p>
                    <p className="text-xs text-slate-500">
                      {t('org_head_complaints.popup.status', 'Status')}: {point.complaint.status}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('org_head_complaints.popup.priority', 'Priority')}: {point.complaint.priority}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                      <button
                        onClick={() => navigate(`/complaints/${getComplaintId(point.complaint)}`, { state: { complaint: point.complaint } })}
                        className="text-[#006B5D] hover:underline cursor-pointer"
                      >
                        {t('dept_complaints.table.view_details')}
                      </button>
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {!mapPoints.length && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t('org_head_complaints.no_location', 'No location data available')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentComplaints;
