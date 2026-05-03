import React from 'react';
import { motion } from 'motion/react';
import { 
  Ticket, Search, List, Send, PlusCircle, AlertCircle, 
  CheckCircle2, Clock, User, MessageSquare, Calendar,
  ShieldCheck, ArrowRight
} from 'lucide-react';
import { 
  collection, addDoc, serverTimestamp, query, where, 
  getDocs, orderBy, limit, doc, getDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const REQUEST_TYPES = [
  "Community Hall Booking",
  "Rent / Move-in / Move-out",
  "Furniture Work",
  "Heavy Material Movement",
  "General Request"
];

export default function ServiceTickets() {
  const [activeTab, setActiveTab] = React.useState<'raise' | 'track'>('raise');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ticketResult, setTicketResult] = React.useState<string | null>(null);
  const [searchId, setSearchId] = React.useState('');
  const [searchResult, setSearchResult] = React.useState<any>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState({ societyName: 'Morya CHS Ltd' });

  React.useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings({ societyName: snap.data().societyName || 'Morya CHS Ltd' });
      }
    });
    return () => unsubSettings();
  }, []);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    flatNumber: '',
    mobileNumber: '',
    email: '',
    type: REQUEST_TYPES[4],
    description: '',
    preferredDate: '',
    paymentScreenshotUrl: '',
  });

  const generateTicketId = async () => {
    const year = new Date().getFullYear();
    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef, 
      where('createdAt', '>=', new Date(year, 0, 1)),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    let count = 1;
    
    if (!snapshot.empty) {
      const lastTicket = snapshot.docs[0].data();
      const lastId = lastTicket.ticketId; // MORYA-2026-0001
      const lastCount = parseInt(lastId.split('-')[2]);
      count = lastCount + 1;
    }
    
    return `MORYA-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleRaiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTicketResult(null);

    if (!formData.paymentScreenshotUrl) {
      alert("Please upload a payment screenshot.");
      setIsSubmitting(false);
      return;
    }

    try {
      const ticketId = await generateTicketId();
      const ticketData = {
        ...formData,
        ticketId,
        status: 'Open',
        assignedTo: 'Unassigned',
        remarks: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tickets'), ticketData);
      
      // Trigger Email Notification (Simulated through API)
      try {
        await fetch('/api/tickets/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData)
        });
      } catch (err) {
        console.error("Failed to send notification:", err);
      }

      setTicketResult(ticketId);
      setFormData({
        name: '',
        flatNumber: '',
        mobileNumber: '',
        email: '',
        type: REQUEST_TYPES[4],
        description: '',
        preferredDate: '',
        paymentScreenshotUrl: '',
      });
    } catch (error) {
      console.error("Error raising ticket:", error);
      alert("Failed to raise ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);

    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('ticketId', '==', searchId.trim().toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setSearchError("No ticket found with this ID.");
      } else {
        setSearchResult(snapshot.docs[0].data());
      }
    } catch (error) {
      console.error("Error searching ticket:", error);
      setSearchError("An error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-6 animate-in fade-in duration-500">
      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-6">
        
        {/* Main Request Form Card */}
        <section className="col-span-1 lg:col-span-8 lg:row-span-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Raise a Service Request</h2>
              <p className="text-sm text-slate-500">All requests are assigned a unique ticket ID for tracking.</p>
            </div>
          </div>

          {ticketResult ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Request Submitted!</h2>
              <p className="mt-2 text-slate-500">Email notifications have been sent to committee.</p>
              <div className="mt-8 rounded-2xl bg-indigo-50 border border-indigo-100 p-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Your Ticket ID</span>
                <span className="mt-1 block text-3xl font-black text-indigo-600 tracking-wider">
                  {ticketResult}
                </span>
              </div>
              <button
                onClick={() => setTicketResult(null)}
                className="mt-8 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:bg-indigo-700"
              >
                Raise Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleRaiseSubmit} className="grid grid-cols-2 gap-x-6 gap-y-6 flex-grow">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flat Number</label>
                <input
                  required
                  type="text"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                  placeholder="e.g. A-402"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rajesh@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number</label>
                <input
                  required
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Request Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none appearance-none focus:border-indigo-400 focus:bg-white"
                >
                  {REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Screenshot (Mandatory for processing)</label>
                <div 
                  onClick={() => document.getElementById('screenshot-upload')?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-indigo-400 hover:bg-white cursor-pointer group",
                    formData.paymentScreenshotUrl && "border-emerald-200 bg-emerald-50/30"
                  )}
                >
                  <input 
                    id="screenshot-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Max 1MB check
                      if (file.size > 1024 * 1024) {
                        alert("File is too large. Please upload a screenshot smaller than 1MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, paymentScreenshotUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {formData.paymentScreenshotUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-emerald-100 shadow-sm">
                        <img src={formData.paymentScreenshotUrl} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-emerald-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlusCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">Screenshot Attached (Click to change)</span>
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="mb-2 h-8 w-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      <p className="text-sm font-bold text-slate-600">Click or Drag Screenshot to Upload</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">JPG, PNG allowed. Max 1MB.</p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed explanation of your requirement..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none transition-all focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="col-span-2 mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">
                  <span className="flex items-center gap-1.5 group">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                    Auto-ID Generation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> 
                    Audit Trail Logged
                  </span>
                </div>
                <button
                  disabled={isSubmitting}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : <>Submit Request <Send className="h-4 w-4" /></>}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Tracking Card */}
        <section className="col-span-1 lg:col-span-4 lg:row-span-2 rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Track Your Request</h3>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-300">Live</span>
          </div>
          <p className="mb-4 text-sm text-slate-400">Enter your Ticket ID to see real-time updates and remarks.</p>
          <form onSubmit={handleTrackSearch} className="flex gap-2">
            <input
              required
              type="text"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              placeholder="e.g. MORYA-2026-0001"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button className="bg-white p-2.5 rounded-lg text-slate-900 transition-colors hover:bg-indigo-50">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {searchError && <p className="mt-3 text-xs font-bold text-red-400">{searchError}</p>}
          
          {searchResult && (
            <div className="mt-6 space-y-3 rounded-xl bg-slate-800/50 p-4 border border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Status</span>
                <span className="text-xs font-bold text-emerald-400">{searchResult.status}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Latest Remark</span>
                <p className="text-xs text-slate-300 italic">"{searchResult.remarks || 'Pending review by MC Member'}"</p>
              </div>
            </div>
          )}
        </section>

        {/* Governance Card */}
        <section className="col-span-1 lg:col-span-4 lg:row-span-2 rounded-2xl bg-indigo-50 border border-indigo-100 p-8">
          <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Governance
          </h3>
          <ul className="space-y-3 text-xs font-semibold text-indigo-700">
            <li className="flex gap-2">• No verbal requests processed</li>
            <li className="flex gap-2">• Status updated within 48 hours</li>
            <li className="flex gap-2">• Immutable log for audits</li>
            <li className="flex gap-2">• Member verification on closure</li>
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white p-4 border border-indigo-200">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Open Tickets</p>
              <p className="text-2xl font-black text-indigo-900">12</p>
            </div>
            <div className="rounded-xl bg-white p-4 border border-indigo-200">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Resolved</p>
              <p className="text-2xl font-black text-indigo-900">142</p>
            </div>
          </div>
        </section>

        {/* Peek / Support Card */}
        <section className="col-span-1 lg:col-span-4 lg:row-span-1 rounded-2xl bg-white border border-slate-200 flex items-center justify-between px-8 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-50 text-amber-600">
               <AlertCircle className="h-5 w-5" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-slate-800">Support Needed?</h4>
               <p className="text-[11px] text-slate-500">Contact Society Office</p>
             </div>
           </div>
           <ArrowRight className="h-4 w-4 text-slate-300" />
        </section>

        {/* Footer info */}
        <footer className="col-span-1 lg:col-span-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} {settings.societyName} | Governance System</div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500"></div> System Online</span>
            <span>Server: APP-01</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
