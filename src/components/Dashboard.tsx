import { useState } from 'react';
import { MoreHorizontal, FileText, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Map as MapIcon, Share2, FilePieChart } from 'lucide-react';
import Modal from './Modal';

const Dashboard = () => {

const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const stats = [
    { label: 'Total Complaints', value: '14,205', trend: '+5%', up: true, icon: <FileText className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Active Cases', value: '3,120', trend: '+12%', up: true, icon: <Clock className="text-yellow-600" />, bg: 'bg-yellow-50' },
    { label: 'Resolved', value: '10,550', trend: '+8%', up: true, icon: <CheckCircle className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Overdue', value: '425', trend: '-2%', up: false, icon: <AlertTriangle className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Org Admins', value: '85', trend: '0%', icon: <Users className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Avg Resolution', value: '48h', trend: '-5%', up: false, icon: <Clock className="text-teal-500" />, bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${stat.up ? 'bg-emerald-50 text-emerald-600' : stat.trend === '0%' ? 'bg-gray-50 text-gray-500' : 'bg-red-50 text-red-600'}`}>
              {stat.up ? <TrendingUp size={10} className="mr-1" /> : stat.trend !== '0%' && <TrendingDown size={10} className="mr-1" />}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Table Section */}
        <div className="lg:col-span-9 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="font-bold flex items-center"><TrendingUp size={16} className="mr-2"/> FILTERS</span>
            <select className="bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-teal-500">
              <option>Status</option>
            </select>
            <select className="bg-gray-50 border-none rounded-lg px-3 py-1.5">
              <option>Priority</option>
            </select>
            <select className="bg-gray-50 border-none rounded-lg px-3 py-1.5">
              <option>Type</option>
            </select>
            <input type="date" className="bg-gray-50 border-none rounded-lg px-3 py-1.5 ml-auto" />
          </div>

          {/* Search */}
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-100">
            <input placeholder="Search by Complaint ID, Title, Organization or User..." className="w-full text-sm outline-none" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-slate-400 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: '#CMP-1024', title: 'Traffic Light Malfunction', org: 'City Transport', status: 'Active', priority: 'High', date: 'Oct 24, 2023', sColor: 'bg-yellow-100 text-yellow-700', pColor: 'bg-red-50 text-red-600' },
                  { id: '#CMP-1025', title: 'Garbage Collection Missed', org: 'Waste Management', status: 'Resolved', priority: 'Medium', date: 'Oct 23, 2023', sColor: 'bg-emerald-100 text-emerald-700', pColor: 'bg-slate-100 text-slate-600' },
                  { id: '#CMP-1026', title: 'Pothole on Main St', org: 'Public Works', status: 'Overdue', priority: 'High', date: 'Oct 20, 2023', sColor: 'bg-red-100 text-red-700', pColor: 'bg-red-50 text-red-600' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{row.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.title}</td>
                    <td className="px-6 py-4 text-slate-500">{row.org}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.sColor}`}>{row.status}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.pColor}`}>{row.priority}</span></td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-800">Org Health</h4>
              <button className="text-teal-600 text-xs font-bold">Manage All</button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Public Works', rate: '98%', color: 'bg-emerald-800', initial: 'PW', bg: 'bg-blue-50', tColor: 'text-blue-600' },
                { name: 'Waste Mgmt', rate: '85%', color: 'bg-yellow-500', initial: 'WM', bg: 'bg-orange-50', tColor: 'text-orange-600' },
                { name: 'Police Dept', rate: '92%', color: 'bg-blue-600', initial: 'PD', bg: 'bg-purple-50', tColor: 'text-purple-600' },
              ].map((org, i) => (
                <div key={i}>
                  <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 ${org.bg} ${org.tColor}`}>{org.initial}</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">{org.name}</p>
                      <p className="text-[10px] text-slate-400">{org.rate} Response Rate</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${org.color}`} style={{ width: org.rate }}></div>
                  </div>
                </div>
              ))}
            </div>
           <button 
  onClick={() => setIsAddOrgOpen(true)}
  className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors"
>
  Add New Organization
</button>
<Modal isOpen={isAddOrgOpen} onClose={() => setIsAddOrgOpen(false)} title="Add New Organization">
  <div className="space-y-4">
    <div>
      <label className="text-xs font-bold text-slate-600 block mb-1">Organization Name</label>
      <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Health Department" />
    </div>
    <button className="w-full bg-[#006B5D] text-white py-2.5 rounded-xl font-bold text-sm">Create Organization</button>
  </div>
</Modal>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <h4 className="font-bold text-slate-800 mb-6">Data & Reports</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Heat Map', icon: <MapIcon size={20}/>, color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Trends', icon: <TrendingUp size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Export CSV', icon: <Share2 size={20}/>, color: 'text-slate-600', bg: 'bg-slate-50' },
                { label: 'PDF Report', icon: <FilePieChart size={20}/>, color: 'text-slate-600', bg: 'bg-slate-50' },
              ].map((item, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-50">
                  <div className={`p-2 rounded-lg mb-2 ${item.bg} ${item.color}`}>{item.icon}</div>
                  <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;