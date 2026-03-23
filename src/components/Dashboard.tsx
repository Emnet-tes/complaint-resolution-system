import { useState } from 'react';
import { FileText, Clock, CheckCircle, TrendingUp, TrendingDown, Map as MapIcon, Share2, FilePieChart } from 'lucide-react';
import Modal from './Modal';

const Dashboard = () => {
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);

  const stats = [
    { label: 'Total Complaints', value: '14,205', trend: '+5%', up: true, icon: <FileText size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Active Cases', value: '3,120', trend: '+12%', up: true, icon: <Clock size={20} className="text-yellow-600" />, bg: 'bg-yellow-50' },
    { label: 'Resolved', value: '10,550', trend: '+8%', up: true, icon: <CheckCircle size={20} className="text-emerald-500" />, bg: 'bg-emerald-50' },
  ];

  // Data for the Bar Chart
  const distributionData = [
    { org: 'Public Works', count: 450, color: 'bg-[#006B5D]' },
    { org: 'Water Dept', count: 320, color: 'bg-emerald-400' },
    { org: 'Transport', count: 280, color: 'bg-teal-300' },
    { org: 'Waste Mgmt', count: 150, color: 'bg-emerald-200' },
    { org: 'Police Dept', count: 90, color: 'bg-slate-200' },
  ];

  const maxCount = Math.max(...distributionData.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.up ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Complaint Distribution Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-bold text-slate-800 text-lg">Complaint Distribution by Organization</h4>
            <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg px-3 py-2">
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="space-y-6">
            {distributionData.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{item.org}</span>
                  <span>{item.count} Complaints</span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#006B5D] p-6 rounded-2xl shadow-lg shadow-teal-900/20 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">System Controls</h4>
              <p className="text-emerald-100 text-xs mb-6 leading-relaxed">Expand the city network by adding new departments or service providers.</p>
              <button 
                onClick={() => setIsAddOrgOpen(true)}
                className="w-full py-3 bg-white text-[#006B5D] rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors"
              >
                Register New Organization
              </button>
            </div>
            <FilePieChart className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-500/20" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Quick Reports</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all">
                <Share2 size={20} className="text-teal-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-600">Export CSV</span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all">
                <MapIcon size={20} className="text-teal-600 mb-2"/>
                <span className="text-[10px] font-bold text-slate-600">GIS Overlay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isAddOrgOpen} onClose={() => setIsAddOrgOpen(false)} title="Register New Organization">
        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Organization Name</label>
            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="e.g. Health Department" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option>Utilities</option>
              <option>Infrastructure</option>
              <option>Sanitation</option>
              <option>Security</option>
            </select>
          </div>
          <button className="w-full bg-[#006B5D] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/10 mt-2">Create Organization</button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;