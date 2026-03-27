import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  List, Map as MapIcon, Download, Plus, Search, 
  AlertCircle, Clock, ChevronDown, Trash2, 
  UserPlus, Edit, X 
} from 'lucide-react';
import Modal from './Modal';
import { Table, type Column } from '../components/Table'; // Import reusable table

const OrgComplaints = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list');
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const navigate = useNavigate();

  // Dummy Data
  const complaintData = [
    { id: '#ORG-1001', title: 'Org Budget Issue', desc: 'Budget overrun reported for Q1.', type: 'Finance', org: 'Head Office', status: 'Open', priority: 'Critical', date: '5 mins ago', sColor: 'text-red-600 border-red-200 bg-red-50', pColor: 'text-red-700' },
    { id: '#ORG-1002', title: 'Policy Violation', desc: 'Non-compliance with new HR policy.', type: 'HR', org: 'HR Department', status: 'In Progress', priority: 'High', date: '30 mins ago', sColor: 'text-blue-600 border-blue-200 bg-blue-50', pColor: 'text-orange-600' },
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectedComplaints(checked ? complaintData.map(c => c.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedComplaints(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  // --- Table Column Definitions ---
  const columns: Column<typeof complaintData[0]>[] = [
    {
      header: "",
      key: "checkbox",
      headerClassName: "w-10",
      render: (row) => (
        <input 
          type="checkbox" 
          className="rounded accent-[#006B5D] cursor-pointer" 
          checked={selectedComplaints.includes(row.id)}
          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
        />
      )
    },
    { 
      header: t('complaints.table.id'), 
      key: 'id', 
      className: 'font-bold text-[#006B5D]' 
    },
    { 
      header: t('complaints.table.title_desc'), 
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{row.desc}</p>
        </div>
      )
    },
    { header: t('complaints.table.type'), key: 'type', className: 'text-slate-500 font-medium' },
    { header: t('complaints.table.org'), key: 'org', className: 'text-slate-500 font-medium' },
    { 
      header: t('complaints.table.status'), 
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border w-fit inline-block ${row.sColor}`}>
          {row.status}
        </span>
      )
    },
    { 
      header: t('complaints.table.priority'), 
      key: 'priority',
      render: (row) => (
        <div className={`flex items-center text-[10px] font-black uppercase ${row.pColor}`}>
          {row.priority === 'Critical' ? <AlertCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
          {row.priority}
        </div>
      )
    },
    { header: t('complaints.table.date'), key: 'date', className: 'text-slate-400 italic text-[11px]' },
    { 
      header: t('complaints.table.action'), 
      key: 'action', 
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => navigate(`/complaints/${row.id.replace('#', '')}`)}
          className="text-[#006B5D] font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer"
        >
          {t('complaints.table.view_details')}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('complaints.nav')}</nav>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('complaints.title')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('complaints.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'}`}>
              <List size={14} className="mr-2" /> {t('complaints.list_view')}
            </button>
            <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center transition-all cursor-pointer ${viewMode === 'map' ? 'bg-[#006B5D] text-white shadow-md' : 'text-slate-400'}`}>
              <MapIcon size={14} className="mr-2" /> {t('complaints.map_view')}
            </button>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-gray-50 flex items-center cursor-pointer shadow-sm">
            <Download size={14} className="mr-2" /> {t('complaints.export')}
          </button>
          <button onClick={() => setIsAddComplaintOpen(true)} className="px-5 py-2.5 bg-[#006B5D] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center shadow-lg shadow-teal-900/20 hover:bg-[#005a4e] cursor-pointer">
            <Plus size={16} className="mr-2" /> {t('complaints.new_btn')}
          </button>
        </div>
      </div>

      {/* Global Search & Bulk Actions */}
      <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="flex-1 flex items-center border-r border-gray-100 px-4">
          <Search size={18} className="text-slate-400 mr-2" />
          <input placeholder={t('complaints.search_placeholder')} className="w-full text-sm outline-none bg-transparent font-medium" />
        </div>
        <div className="hidden sm:flex items-center gap-4 px-4 border-l border-gray-100">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">{t('complaints.bulk_actions')}:</span>
          <div className="flex gap-1">
            <button className="p-2 text-slate-400 hover:text-[#006B5D] transition-colors cursor-pointer"><Edit size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-[#006B5D] transition-colors cursor-pointer"><UserPlus size={16} /></button>
            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {viewMode === 'list' ? (
        <Table 
          data={complaintData} 
          columns={columns} 
          noDataMessage={t('complaints.table.no_data', 'No complaints found')}
        />
      ) : (
        <div className="bg-slate-100 h-96 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
           <MapIcon size={48} className="text-slate-300 mb-4" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-sm text-center">
             {t('complaints.map_view')} Interface <br/> <span className="text-[10px] font-bold">Connecting Regional Data Nodes...</span>
           </p>
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal isOpen={isAddComplaintOpen} onClose={() => setIsAddComplaintOpen(false)} title={t('complaints.modal.title')}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{t('complaints.modal.subject')}</label>
            <input className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#006B5D]/10 outline-none transition-all" placeholder={t('complaints.modal.subject_placeholder')} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{t('complaints.modal.desc')}</label>
            <textarea className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 resize-none outline-none" placeholder={t('complaints.modal.desc_placeholder')}></textarea>
          </div>
          <button className="w-full bg-[#006B5D] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#005a4e] transition-all cursor-pointer">
            {t('complaints.modal.submit')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrgComplaints;