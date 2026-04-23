import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Map as MapIcon,
  User,
  Info,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deptAdminApi, type AssignedComplaint, type ComplaintStatus } from '../api/deptadmin';
import { type OrganizationComplaint } from '../api/orgadmin';

type ComplaintDetailState = {
  complaint?: AssignedComplaint | OrganizationComplaint;
  source?: 'org' | 'dept';
};

const isOrganizationComplaint = (
  complaint: AssignedComplaint | OrganizationComplaint,
): complaint is OrganizationComplaint => 'submittedBy' in complaint && 'attachments' in complaint;

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const routeState = location.state as ComplaintDetailState | null;
  const initialFromState = routeState?.complaint;
  const [complaint, setComplaint] = useState<AssignedComplaint | OrganizationComplaint | null>(initialFromState ?? null);
  const [loading, setLoading] = useState(!initialFromState);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Submitted');
  const [comment, setComment] = useState('');

  const handleBack = () => {
    navigate('/complaints');
  };

  const isDeptAdmin = user?.role === 'DeptAdmin';
  const isOrgComplaint = complaint ? isOrganizationComplaint(complaint) : false;

  useEffect(() => {
    if (complaint) {
      if (!isOrganizationComplaint(complaint)) {
        setNewStatus(complaint.status);
      }
      return;
    }

    if (routeState?.source === 'org') {
      setLoading(false);
      return;
    }

    const fetchOne = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // No dedicated "GET /complaints/:id" endpoint provided for DeptAdmin,
        // so we fetch from assigned list and find the complaint by id.
        const res = await deptAdminApi.getAssignedComplaints();
        const found = res.data.find((c) => c._id === id) || null;
        setComplaint(found);
        if (found) setNewStatus(found.status);
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dept_mgmt.toasts.fetch_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, complaint, routeState?.source]);

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

  const complaintAttachments = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.attachments
      : complaint.images || []
    : [];

  const complaintAssigneeName = complaint
    ? isOrganizationComplaint(complaint)
      ? complaint.assignedTo || '-'
      : complaint.assignedTo?.fullName || '-'
    : '-';

  const handleUpdateStatus = async () => {
    if (!id) return;
    if (!isDeptAdmin) return;
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
                <p className="text-sm text-slate-500 mt-1">
                  {t('dept_complaints.detail.submitted_by')}{' '}
                  <span className="font-bold text-slate-700">
                    {isOrganizationComplaint(complaint) ? complaint.submittedBy?.fullName || '-' : complaint.submittedBy?.fullName || '-'}
                  </span>
                </p>
             </div>
             {isDeptAdmin && !isOrgComplaint && (
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

          {/* Stepper */}
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
             <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-[#006B5D] -translate-y-1/2 z-0"></div>
                
                {['In Progress', 'Resolved', 'Closed'].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm mb-2 ${i === 0 ? 'bg-[#006B5D]' : i === 1 ? 'bg-slate-300' : 'bg-slate-300'}`}></div>
                    <span className={`text-[11px] font-bold ${i === 0 ? 'text-[#006B5D]' : 'text-slate-400'}`}>{step}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl relative overflow-hidden">
             <div className="absolute right-4 top-4 text-blue-200 opacity-50 rotate-12"><MessageSquare size={80}/></div>
             <h4 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider flex items-center"><Info size={16} className="mr-2"/> AI Analysis</h4>
             <div className="flex flex-wrap gap-3">
                {isOrganizationComplaint(complaint) ? (
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    AI Confidence: {Math.round((complaint.aiConfidence || 0) * 100)}%
                  </span>
                ) : (
                  <>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span> Possible Duplicate of <span className="text-[#006B5D] ml-1">#CK-9210</span></span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span> High Urgency Detected</span>
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> Tag: Road Maintenance</span>
                  </>
                )}
             </div>
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
                   {complaintAttachments.slice(0, 3).map((img, idx) => (
                     <div
                       key={`${img.path}-${idx}`}
                       className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-gray-200"
                     >
                       {t('dept_complaints.detail.attachment')} {idx + 1}
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Location */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">{t('dept_complaints.detail.location')}</h3>
             </div>
             <div className="flex items-center gap-4 text-slate-600 bg-gray-50 p-4 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><MapIcon size={20}/></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {complaintLocationName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {complaintCoordinates.length ? complaintCoordinates.join(', ') : '-'}
                  </p>
                </div>
             </div>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{t('dept_complaints.detail.category')}</p>
                    <div className="flex items-center text-sm font-bold text-slate-800">
                      <MapIcon size={16} className="mr-2 text-slate-400" /> {complaint.category || '-'}
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
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{t('dept_complaints.detail.reporter')}</p>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={20}/></div>
                    <div>
                       <p className="text-xs font-bold text-slate-800">{complaint.submittedBy?.fullName || '-'}</p>
                       <p className="text-[10px] text-slate-400">{complaint.submittedBy?.email || '-'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;