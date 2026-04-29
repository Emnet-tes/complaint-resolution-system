import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Map as MapIcon,
  Info,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { deptAdminApi, type AssignedComplaint, type ComplaintStatus } from '../api/deptadmin';
import { orgHeadApi, type OrgHeadComplaint } from '../api/orghead';

type ComplaintDetailState = {
  complaint?: AssignedComplaint | OrgHeadComplaint;
  source?: 'org' | 'dept';
};

type GeoPolygon = number[][][];
type GeoMultiPolygon = number[][][][];
type WoredaFeature = {
  type: 'Feature';
  properties?: Record<string, any>;
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: GeoPolygon | GeoMultiPolygon;
  };
};

const WOREDA_GEOJSON_PATH = '/gis/Ethiopia_AdminBoundaries.geojson';

const pointInRing = (point: [number, number], ring: number[][]) => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const pointInPolygon = (point: [number, number], polygon: GeoPolygon) => {
  if (!polygon.length) {
    return false;
  }

  if (!pointInRing(point, polygon[0])) {
    return false;
  }

  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(point, polygon[i])) {
      return false;
    }
  }

  return true;
};

const normalizeText = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return null;
  }

  return text;
};

const isNumericText = (value: string) => /^\d+(\.\d+)?$/.test(value);

const getFeatureSubCity = (feature: WoredaFeature) => {
  const p = feature.properties || {};
  return (
    normalizeText(p.ZONENAME) ||
    normalizeText(p.REGIONNAME) ||
    normalizeText(p.Sub_City) ||
    normalizeText(p.sub_city) ||
    normalizeText(p.subcity) ||
    normalizeText(p.kifle_ketema) ||
    null
  );
};

const getFeatureWoredaName = (feature: WoredaFeature) => {
  const p = feature.properties || {};

  const primaryTextName =
    normalizeText(p.WOREDANAME) ||
    normalizeText(p.woreda_name) ||
    normalizeText(p.WOREDA_NAME) ||
    normalizeText(p.name) ||
    normalizeText(p.NAME) ||
    normalizeText(p.admin3) ||
    normalizeText(p.ADMIN3);

  if (primaryTextName && !isNumericText(primaryTextName)) {
    return primaryTextName;
  }

  const woredaRaw =
    normalizeText(p.WOREDANO_) ||
    normalizeText(p.woreda) ||
    normalizeText(p.Woreda) ||
    normalizeText(p.WOREDA);
  const subCity = getFeatureSubCity(feature);

  if (woredaRaw && !isNumericText(woredaRaw)) {
    return woredaRaw;
  }

  if (subCity) {
    return subCity;
  }

  if (woredaRaw) {
    return `Woreda ${woredaRaw}`;
  }

  return '-';
};

const isOrganizationComplaint = (
  complaint: AssignedComplaint | OrgHeadComplaint,
): complaint is OrgHeadComplaint => 'submittedBy' in complaint && 'attachments' in complaint;

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const routeState = location.state as ComplaintDetailState | null;
  const initialFromState = routeState?.complaint;
  const [complaint, setComplaint] = useState<AssignedComplaint | OrgHeadComplaint | null>(initialFromState ?? null);
  const [loading, setLoading] = useState(!initialFromState);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Submitted');
  const [comment, setComment] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState<{
    woreda: string;
    street: string;
    displayName: string;
  } | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [woredaFeatures, setWoredaFeatures] = useState<WoredaFeature[]>([]);
  const [woredaFeaturesLoaded, setWoredaFeaturesLoaded] = useState(false);

  const handleBack = () => {
    navigate('/complaints');
  };

  const isDeptHead = user?.role === 'DeptHead';
  const isOrgComplaint = complaint ? isOrganizationComplaint(complaint) : false;

  useEffect(() => {
    if (complaint) {
      if (!isOrganizationComplaint(complaint)) {
        setNewStatus(complaint.status);
      }
      return;
    }

    const fetchOne = async () => {
      if (!id) return;
      try {
        setLoading(true);
        let found: AssignedComplaint | OrgHeadComplaint | null = null;

        if (routeState?.source === 'org' || user?.role === 'OrgHead' || user?.role === 'OrgAdmin') {
          const res = await orgHeadApi.getOrganizationComplaints();
          found = res.data.find((c) => c._id === id) || null;
        } else {
          // No dedicated "GET /complaints/:id" endpoint provided for DeptAdmin,
          // so we fetch from assigned list and find the complaint by id.
          const res = await deptAdminApi.getAssignedComplaints();
          found = res.data.find((c) => c._id === id) || null;
        }

        setComplaint(found);
        if (found && !isOrganizationComplaint(found)) setNewStatus(found.status);
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, complaint, routeState?.source, user?.role]);

  const statusBadge = useMemo(() => {
    const s = complaint?.status || 'Submitted';
    const cls =
      s === 'Resolved'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : s === 'Rejected'
          ? 'bg-red-50 text-red-600 border-red-100'
          : s === 'In Progress'
            ? 'bg-blue-50 text-blue-600 border-blue-100'
            : 'bg-slate-50 text-slate-600 border-slate-200';
    return { label: t(`dept_complaints.status.${s}`), cls };
  }, [complaint?.status, t]);

  const complaintDepartmentName = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.department?.name || complaint.category || '-'
      : complaint.department?.name || '-'
    : '-';

  const complaintDepartmentCode = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.department?.code || 'DP'
      : complaint.department?.code || 'DP'
    : 'DP';

  const complaintLocationName = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.location?.locationName || '-'
      : complaint.location?.locationName || '-'
    : '-';

  const complaintCoordinates = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.location?.coordinates || []
      : complaint.location?.coordinates || []
    : [];

  const coordinateValues = useMemo(() => {
    if (complaintCoordinates.length < 2) {
      return { lat: null, lon: null };
    }

    const lon = Number(complaintCoordinates[0]);
    const lat = Number(complaintCoordinates[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { lat: null, lon: null };
    }

    return { lat, lon };
  }, [complaintCoordinates]);

  const hasValidCoordinates = coordinateValues.lat !== null && coordinateValues.lon !== null;
  const mapLatLng = useMemo(() => {
    if (!hasValidCoordinates) {
      return null;
    }

    return [coordinateValues.lat as number, coordinateValues.lon as number] as [number, number];
  }, [coordinateValues.lat, coordinateValues.lon, hasValidCoordinates]);

  const complaintCreatedAt = complaint ? new Date(complaint.createdAt).toLocaleString() : '-';
  const complaintUpdatedAt = complaint ? new Date(complaint.updatedAt).toLocaleString() : '-';

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadWoredaBoundaries = async () => {
      try {
        const response = await fetch(WOREDA_GEOJSON_PATH, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('woreda_boundary_file_missing');
        }

        const data = await response.json();
        const features = Array.isArray(data?.features)
          ? (data.features.filter((f: WoredaFeature) => f?.geometry?.coordinates) as WoredaFeature[])
          : [];

        if (isActive) {
          setWoredaFeatures(features);
        }
      } catch (_error) {
        if (isActive) {
          setWoredaFeatures([]);
        }
      } finally {
        if (isActive) {
          setWoredaFeaturesLoaded(true);
        }
      }
    };

    loadWoredaBoundaries();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!hasValidCoordinates) {
      setResolvedLocation(null);
      setIsResolvingLocation(false);
      return;
    }

    if (!woredaFeaturesLoaded) {
      setIsResolvingLocation(true);
      return;
    }

    const lat = coordinateValues.lat as number;
    const lon = coordinateValues.lon as number;
    const point: [number, number] = [lon, lat];

    setIsResolvingLocation(true);

    const matchedFeature = woredaFeatures.find((feature) => {
      const geometry = feature.geometry;
      if (!geometry) {
        return false;
      }

      if (geometry.type === 'Polygon') {
        return pointInPolygon(point, geometry.coordinates as GeoPolygon);
      }

      if (geometry.type === 'MultiPolygon') {
        return (geometry.coordinates as GeoMultiPolygon).some((polygon) => pointInPolygon(point, polygon));
      }

      return false;
    });

    const woreda = matchedFeature ? getFeatureWoredaName(matchedFeature) : '-';
    const subCityName = matchedFeature ? getFeatureSubCity(matchedFeature) : null;
    const street = complaintLocationName !== '-' ? complaintLocationName : subCityName || '-';
    const displayName = woreda !== '-' ? `${woreda}, Ethiopia` : complaintLocationName;

    setResolvedLocation({
      woreda,
      street,
      displayName,
    });
    setIsResolvingLocation(false);
  }, [
    complaintLocationName,
    coordinateValues.lat,
    coordinateValues.lon,
    hasValidCoordinates,
    woredaFeatures,
    woredaFeaturesLoaded,
  ]);

 

  const complaintIsSpam = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.isSpam
      : false
    : false;

  const complaintAiConfidence = complaint
    ? isOrganizationComplaint(complaint)
      ? Math.round((complaint.aiConfidence || 0) * 100)
      : null
    : null;

  const complaintDuplicateOf = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.duplicateOf
      : null
    : null;


  const complaintAttachments = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.attachments
      : complaint.images || []
    : [];

  const getAttachmentUrl = (attachment: { url?: string; path?: string }) =>
    attachment.url || attachment.path || '';

  const complaintAssigneeName = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.assignedTo || '-'
      : complaint.assignedTo?.fullName || '-'
    : '-';

  const handleUpdateStatus = async () => {
    if (!id) return;
    if (!isDeptHead) return;
    if (isOrgComplaint) return;
    if (newStatus === 'Rejected' && !comment.trim()) {
      toast.error(t('dept_complaints.detail.comment_required'));
      return;
    }
    try {
      setSaving(true);
      await deptAdminApi.updateComplaintStatus(id, {
        status: newStatus,
        comment: comment || undefined,
      });
      toast.success(t('dept_complaints.toasts.status_updated'));
      setComplaint((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8">
        <button
          onClick={handleBack}
          className="p-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-[#006B5D] hover:border-[#006B5D] transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 font-bold">
          {t('dept_complaints.detail.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack} 
          className="p-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-[#006B5D] hover:border-[#006B5D] transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {t('dept_complaints.detail.nav')} / #{id?.slice(-6).toUpperCase()}
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start">
             <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
                <h1 className="text-2xl font-bold text-slate-800 mt-3">{complaint.title}</h1>
             </div>
             {isDeptHead && !isOrgComplaint && (
               <div className="flex flex-col gap-3 w-full max-w-sm">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                     {t('dept_complaints.detail.update_status')}
                   </p>
                   <div className="flex gap-2">
                     <select
                       value={newStatus}
                       onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                       className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                     >
                       <option value="Submitted">{t('dept_complaints.status.Submitted')}</option>
                       <option value="In Progress">{t('dept_complaints.status.In Progress')}</option>
                       <option value="Resolved">{t('dept_complaints.status.Resolved')}</option>
                       <option value="Rejected">{t('dept_complaints.status.Rejected')}</option>
                     </select>
                     <button
                       onClick={handleUpdateStatus}
                       disabled={saving}
                       className="bg-[#006B5D] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center hover:bg-[#005a4e] transition-all disabled:opacity-70"
                     >
                       {saving ? t('sys_dashboard.loading') : (
                         <>
                           <CheckCircle size={14} className="mr-2" /> {t('dept_complaints.detail.save')}
                         </>
                       )}
                     </button>
                   </div>
                   <textarea
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     placeholder={t('dept_complaints.detail.comment_placeholder')}
                     className="mt-3 w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none min-h-[90px]"
                   />
                 </div>
               </div>
             )}
          </div>
   {/* Description & Images */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 space-y-6 shadow-sm">
             <div>
                <h3 className="font-bold text-slate-800 mb-3">{t('dept_complaints.detail.description')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">
                  {t('dept_complaints.detail.attachments', { count: complaintAttachments.length })}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {complaintAttachments.length === 0 ? (
                    <div className="col-span-3 p-4 rounded-lg border border-gray-200 bg-slate-50 text-xs text-slate-400 font-bold uppercase tracking-widest text-center">
                      No attachments
                    </div>
                  ) : (
                    complaintAttachments.slice(0, 6).map((img, idx) => {
                      const attachmentUrl = getAttachmentUrl(img);

                      if (!attachmentUrl) {
                        return (
                          <div
                            key={`missing-${idx}`}
                            className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-gray-200"
                          >
                            {t('dept_complaints.detail.attachment')} {idx + 1}
                          </div>
                        );
                      }

                      return (
                        <a
                          key={`${attachmentUrl}-${idx}`}
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase tracking-widest border border-gray-200 hover:border-[#006B5D] hover:text-[#006B5D] transition-colors"
                        >
                          {t('dept_complaints.detail.attachment')} {idx + 1}
                        </a>
                      );
                    })
                  )}
                </div>
             </div>
          </section>
          {/* AI Analysis */}
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl relative overflow-hidden">
             <div className="absolute right-4 top-4 text-blue-200 opacity-50 rotate-12"><MessageSquare size={80}/></div>
             <h4 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider flex items-center"><Info size={16} className="mr-2"/> AI Analysis</h4>
             <div className="flex flex-wrap gap-3">
                {isOrganizationComplaint(complaint) ? (
                  <>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      AI Confidence: {complaintAiConfidence}%
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${complaintIsSpam ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      Spam: {complaintIsSpam ? 'Yes' : 'No'}
                    </span>
                    {complaintDuplicateOf && (
                      <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                        Duplicate Of: {complaintDuplicateOf}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Status: {complaint.status}
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                      Priority: {complaint.priority || '-'}
                    </span>
                  </>
                )}
             </div>
          </div>

       

          {/* Location */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">{t('dept_complaints.detail.location')}</h3>
             </div>
            {mapLatLng ? (
              <div className="space-y-3">
                <div className="h-[280px] rounded-xl overflow-hidden border border-gray-100">
                  <MapContainer center={mapLatLng} zoom={14} className="h-full w-full" scrollWheelZoom>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleMarker center={mapLatLng} radius={8} pathOptions={{ color: '#006B5D', fillColor: '#0f766e', fillOpacity: 0.7 }}>
                      <Popup>
                        <div className="space-y-1 min-w-[180px]">
                          <p className="font-bold text-slate-800">{complaint.title}</p>
                          <p className="text-xs text-slate-500">{complaintLocationName}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
                <div className="text-[11px] text-slate-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  {complaintLocationName} • {complaintCoordinates.join(', ')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-100 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Woreda</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {isResolvingLocation ? t('sys_dashboard.loading') : resolvedLocation?.woreda || '-'}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Street Address</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {isResolvingLocation ? t('sys_dashboard.loading') : resolvedLocation?.street || '-'}
                    </p>
                  </div>
                </div>
                {resolvedLocation?.displayName && resolvedLocation.displayName !== '-' && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    {resolvedLocation.displayName}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 text-slate-600 bg-gray-50 p-4 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><MapIcon size={20}/></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">No location coordinates available</p>
                  <p className="text-[10px] text-slate-400 mt-1">{complaintLocationName}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Detail Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-6">{t('dept_complaints.detail.details')}</h4>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('dept_complaints.detail.priority')}</p>
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {complaint.priority || '-'}
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('dept_complaints.detail.department')}</p>
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <div className="w-6 h-6 bg-blue-50 text-[10px] flex items-center justify-center rounded text-blue-600 mr-2 uppercase font-bold tracking-tighter">
                        {complaintDepartmentCode.slice(0, 3)}
                      </div>
                      {complaintDepartmentName}
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('dept_complaints.detail.assignee')}</p>
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <div className="w-6 h-6 bg-blue-100 text-[10px] flex items-center justify-center rounded text-blue-600 mr-2 uppercase font-bold tracking-tighter">
                        {complaintAssigneeName.slice(0, 2).toUpperCase()}
                      </div>
                      {complaintAssigneeName}
                    </div>
                 </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Created</p>
                      <div className="text-xs font-bold text-slate-700">{complaintCreatedAt}</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Updated</p>
                      <div className="text-xs font-bold text-slate-700">{complaintUpdatedAt}</div>
                    </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;