import { CheckCircle, ArrowRight, AlertTriangle, Map as MapIcon, User, Info, MessageSquare, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/complaints');
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack} 
          className="p-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-[#006B5D] hover:border-[#006B5D] transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <nav className="text-xs text-slate-400">Dashboard / Complaints / #{id || 'CK-9281'}</nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start">
             <div>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">In Progress</span>
                <h1 className="text-2xl font-bold text-slate-800 mt-3">Pothole on Main St. causing traffic hazard</h1>
                <p className="text-sm text-slate-500 mt-1">Submitted by <span className="font-bold text-slate-700">John Doe</span> on Oct 24, 2023 at 10:30 AM via Mobile App</p>
             </div>
             <div className="flex gap-2">
                <button className="bg-[#006B5D] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-[#005a4e]"><CheckCircle size={16} className="mr-2"/> Resolve Complaint</button>
                <button className="bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50"><ArrowRight size={16} className="mr-2"/> Reassign</button>
                <button className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50"><AlertTriangle size={18}/></button>
             </div>
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
                <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span> Possible Duplicate of <span className="text-[#006B5D] ml-1">#CK-9210</span></span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span> High Urgency Detected</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-[11px] font-bold text-slate-700 flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> Tag: Road Maintenance</span>
             </div>
          </div>

          {/* Description & Images */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 space-y-6 shadow-sm">
             <div>
                <h3 className="font-bold text-slate-800 mb-3">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">There is a large pothole approximately 2 feet wide in the middle of the northbound lane on Main St., right in front of the public library. It is causing cars to swerve into the oncoming lane to avoid it, which is creating a significant safety hazard. I almost damaged my tire hitting it this morning. Please fix this as soon as possible before an accident happens.</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Attachments (3)</p>
                <div className="grid grid-cols-3 gap-4">
                   <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest border border-gray-200">Pothole Image 1</div>
                   <div className="aspect-video bg-slate-500 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest border border-gray-400">Pothole Image 2</div>
                   <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-gray-200"><button className="p-3 bg-white rounded-full shadow-lg text-slate-600"><CheckCircle/></button></div>
                </div>
             </div>
          </section>

          {/* Location */}
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Location</h3>
                <div className="flex gap-4">
                   <button className="text-[11px] font-bold text-teal-600 hover:underline">Get Directions</button>
                   <span className="text-slate-200">|</span>
                   <button className="text-[11px] font-bold text-teal-600 hover:underline">View on GIS</button>
                </div>
             </div>
             <div className="flex items-center gap-4 text-slate-600 bg-gray-50 p-4 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><MapIcon size={20}/></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">124 Main Street, Downtown District</p>
                  <p className="text-[10px] text-slate-400 mt-1">Lat: 40.7128° N, Long: 74.0060° W</p>
                </div>
             </div>
          </section>
        </div>

        {/* Detail Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-6">Details</h4>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Priority</p>
                    <div className="flex items-center text-sm font-bold text-slate-800"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> High</div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Category</p>
                    <div className="flex items-center text-sm font-bold text-slate-800"><MapIcon size={16} className="mr-2 text-slate-400"/> Roads & Infrastructure</div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Assigned Org</p>
                    <div className="flex items-center text-sm font-bold text-slate-800"><div className="w-6 h-6 bg-blue-50 text-[10px] flex items-center justify-center rounded text-blue-600 mr-2 uppercase font-bold tracking-tighter">DPW</div> Dept. of Public Works</div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Assignee</p>
                    <div className="flex items-center text-sm font-bold text-slate-800"><div className="w-6 h-6 bg-blue-100 text-[10px] flex items-center justify-center rounded text-blue-600 mr-2 uppercase font-bold tracking-tighter">SJ</div> Sarah Jenkins</div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Reporter Details</p>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={20}/></div>
                    <div>
                       <p className="text-xs font-bold text-slate-800">John Doe</p>
                       <p className="text-[10px] text-slate-400">Verified Resident • <span className="text-orange-500">3 prev. reports</span></p>
                       <div className="flex gap-3 mt-2">
                          <button className="text-[10px] font-bold text-teal-600 hover:underline">View Profile</button>
                          <button className="text-[10px] font-bold text-teal-600 hover:underline">Contact</button>
                       </div>
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