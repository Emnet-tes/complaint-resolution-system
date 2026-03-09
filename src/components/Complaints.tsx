import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Map as MapIcon, Download, Plus, Search, Filter, AlertCircle, Clock, CheckCircle, ChevronDown, Trash2, UserPlus, Edit, X } from 'lucide-react';
import Modal from './Modal';

const Complaints = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const navigate = useNavigate();

  const complaintData = [
    { id: '#CMP-9021', title: 'Water Main Break', desc: 'Flooding reported on Main St & 4th Ave intersection.', type: 'Infrastructure', org: 'Public Works', status: 'Open', priority: 'Critical', date: '2 mins ago', sColor: 'text-red-600 border-red-200 bg-red-50', pColor: 'text-red-700' },
    { id: '#CMP-9020', title: 'Broken Traffic Light', desc: 'Light stuck on red at Broadway & Oak.', type: 'Traffic', org: 'Transportation', status: 'In Progress', priority: 'High', date: '1 hour ago', sColor: 'text-blue-600 border-blue-200 bg-blue-50', pColor: 'text-orange-600' },
    { id: '#CMP-9018', title: 'Graffiti in Park', desc: 'Bench and wall vandalized near entrance.', type: 'Sanitation', org: 'Parks & Rec', status: 'Pending', priority: 'Low', date: '3 hours ago', sColor: 'text-slate-500 border-slate-200 bg-slate-50', pColor: 'text-slate-500' },
  ];

  const handleExport = () => {
    alert("Exporting complaints as CSV...");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComplaints(complaintData.map(complaint => complaint.id));
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectComplaint = (complaintId: string, checked: boolean) => {
    if (checked) {
      setSelectedComplaints(prev => [...prev, complaintId]);
    } else {
      setSelectedComplaints(prev => prev.filter(id => id !== complaintId));
    }
  };

  const isAllSelected = complaintData.length > 0 && selectedComplaints.length === complaintData.length;
  const isIndeterminate = selectedComplaints.length > 0 && selectedComplaints.length < complaintData.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="text-xs text-slate-400 mb-1">Dashboard / All Complaints</nav>
          <h1 className="text-2xl font-bold text-slate-800">All City Complaints</h1>
          <p className="text-sm text-slate-500">Manage and oversee all citizen complaints across the city network.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* List/Map Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center transition-all ${viewMode === 'list' ? 'bg-[#006B5D] text-white' : 'text-slate-500'}`}
            >
              <List size={16} className="mr-2"/> List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center transition-all ${viewMode === 'map' ? 'bg-[#006B5D] text-white' : 'text-slate-500'}`}
            >
              <MapIcon size={16} className="mr-2"/> Map
            </button>
          </div>

          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center"><Download size={16} className="mr-2"/> Export</button>
          
          <button 
            onClick={() => setIsAddComplaintOpen(true)}
            className="px-4 py-2 bg-[#006B5D] text-white rounded-lg text-sm font-bold flex items-center shadow-md hover:bg-[#005a4e]"
          >
            <Plus size={16} className="mr-2"/> New Complaint
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white p-2 rounded-xl border border-gray-100 flex items-center">
          <div className="flex-1 flex items-center border-r border-gray-100 px-4">
            <Search size={18} className="text-slate-400 mr-2" />
            <input placeholder="Search by ID, Title, or Keyword..." className="w-full text-sm outline-none bg-transparent" />
          </div>
          <div className="flex-1 flex items-center px-4">
            <input placeholder="Assignee..." className="w-full text-sm outline-none bg-transparent" />
          </div>
          <div className="flex items-center gap-4 px-4 border-l border-gray-100">
             <span className="text-[10px] uppercase font-bold text-slate-400">Bulk Actions:</span>
             <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-slate-800"><Edit size={16}/></button>
                <button className="p-1.5 text-slate-400 hover:text-slate-800"><UserPlus size={16}/></button>
                <button className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase pr-4 border-r border-gray-100"><Filter size={14}/> Filters</div>
        {['Status', 'Priority', 'Type', 'Department'].map((f) => (
          <button key={f} className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-gray-100 flex items-center">
            {f} <ChevronDown size={14} className="ml-6 text-slate-400"/>
          </button>
        ))}
        <div className="flex-1 flex justify-end items-center gap-4">
          <input type="date" className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs border border-gray-100" />
        </div>
      </div>

      <div className="flex gap-3">
        <span className="bg-teal-50 border border-teal-100 text-[#006B5D] px-3 py-1 rounded-full text-xs font-bold flex items-center">Status: Open & In Progress <X size={14} className="ml-2 cursor-pointer"/></span>
        <span className="bg-teal-50 border border-teal-100 text-[#006B5D] px-3 py-1 rounded-full text-xs font-bold flex items-center">Priority: Critical <X size={14} className="ml-2 cursor-pointer"/></span>
        <button className="text-xs font-bold text-slate-400 hover:text-slate-600 ml-2">Clear All</button>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-400 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10">
            <input 
              type="checkbox" 
              className="rounded border-gray-300"
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isIndeterminate;
                }
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">ID</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Title / Description</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Type</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Org/Dept</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Status</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Priority</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider">Date</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaintData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedComplaints.includes(row.id)}
                      onChange={(e) => handleSelectComplaint(row.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-[#006B5D]">{row.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{row.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{row.desc}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.type}</td>
                  <td className="px-6 py-4 text-slate-500">{row.org}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border flex items-center w-fit ${row.sColor}`}>
                      <span className={`w-1 h-1 rounded-full mr-1.5 ${row.sColor.split(' ')[0].replace('text', 'bg')}`}></span>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-[10px] font-bold uppercase ${row.pColor}`}>
                      {row.priority === 'Critical' ? <AlertCircle size={14} className="mr-1.5"/> : row.priority === 'High' ? <AlertCircle size={14} className="mr-1.5"/> : <Clock size={14} className="mr-1.5"/>}
                      {row.priority}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic text-[11px]">{row.date}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => navigate(`/complaints/${row.id.replace('#', '')}`)} className="text-teal-600 font-bold text-[11px] hover:underline cursor-pointer">View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-200 h-96 rounded-2xl flex items-center justify-center border-4 border-dashed border-slate-300">
           <p className="text-slate-500 font-bold flex items-center"><MapIcon className="mr-2"/> Interactive Map View Initializing...</p>
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal isOpen={isAddComplaintOpen} onClose={() => setIsAddComplaintOpen(false)} title="File New Citizen Complaint">
         <div className="space-y-4">
           <div>
             <label className="text-xs font-bold text-slate-600 block mb-1">Subject</label>
             <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Brief description of the issue" />
           </div>
           <div>
             <label className="text-xs font-bold text-slate-600 block mb-1">Detailed Description</label>
             <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-32 resize-none" placeholder="Provide detailed information about the complaint..."></textarea>
           </div>
           <div>
             <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
             <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
               <option>Select category...</option>
               <option>Infrastructure</option>
               <option>Traffic</option>
               <option>Sanitation</option>
               <option>Public Safety</option>
             </select>
           </div>
           <button className="w-full bg-[#006B5D] text-white py-2.5 rounded-xl font-bold hover:bg-[#005a4e] transition-colors">Post Complaint</button>
         </div>
      </Modal>
    </div>
  );
};

export default Complaints;