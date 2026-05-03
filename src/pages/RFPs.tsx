import React from 'react';
import { Briefcase, Calendar, CheckCircle2, FileText, Info, ExternalLink } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function RFPs() {
  const [rfps, setRfps] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'rfps'), orderBy('deadline', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRfps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">RFPs & Bids</h1>
        <p className="text-slate-500">Official requests for proposals and tender transparency tracking.</p>
      </div>

      <div className="rounded-2xl bg-slate-900 p-8 text-white">
        <div className="flex items-start gap-4">
          <Info className="h-6 w-6 text-indigo-400 shrink-0" />
          <div className="space-y-2">
            <h3 className="font-bold">Transparency in Procurement</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              All society contracts above ₹20,000 follow a mandatory 3-quote process. 
              Details of bids, selected vendors, and awarded amounts are archived here for member audit.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading tenders...</div>
      ) : (
        <div className="space-y-8">
          {rfps.map((rfp) => (
            <div key={rfp.id} className="relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:border-indigo-100 hover:shadow-xl">
              <div className="p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tender Reference</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        rfp.status === 'Open' ? 'bg-indigo-100 text-indigo-700' :
                        rfp.status === 'Awarded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rfp.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{rfp.title}</h3>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-600 italic">"{rfp.description}"</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 font-medium text-slate-500">
                        <Calendar className="h-4 w-4" /> 
                        <span>Deadline: <strong className="text-slate-900">{rfp.deadline}</strong></span>
                      </div>
                      {rfp.budget && (
                        <div className="flex items-center gap-2 font-medium text-slate-500">
                          <Briefcase className="h-4 w-4" /> 
                          <span>Estimate: <strong className="text-slate-900">{rfp.budget}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {rfp.sowUrl && (
                      <a 
                        href={rfp.sowUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <FileText className="h-4 w-4" /> View SOW Document
                      </a>
                    )}
                  </div>
                </div>

                {/* Selection Criteria */}
                {rfp.selectionCriteria && (
                  <div className="mt-8 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
                    <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-widest mb-1">Evaluation Criteria</h4>
                    <p className="text-xs text-indigo-800 font-medium">{rfp.selectionCriteria}</p>
                  </div>
                )}

                {/* Bids Section */}
                <div className="mt-8 border-t border-slate-100 pt-8">
                   <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-tight">Vendor Submissions ({rfp.bids?.length || 0})</h4>
                   {rfp.bids && rfp.bids.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rfp.bids.map((bid: any) => (
                          <div key={bid.id} className={`p-4 rounded-2xl border ${rfp.shortlistedVendorId === bid.id ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-900">{bid.vendorName}</p>
                                <p className="text-sm font-black text-indigo-600">{bid.bidAmount}</p>
                              </div>
                              <a href={bid.proposalUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-indigo-600">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            {rfp.shortlistedVendorId === bid.id && (
                              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Shortlisted Proposal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                   ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center">
                        <p className="text-xs font-medium text-slate-400 italic">No bids published for member review yet.</p>
                      </div>
                   )}
                </div>
              </div>
            </div>
          ))}
          {rfps.length === 0 && <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">No RFPs listed currently.</div>}
        </div>
      )}
    </div>
  );
}
