import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Ticket, Bell, FileCheck, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [counts, setCounts] = React.useState({
    members: '124',
    notices: '0',
    docs: '0',
    tickets: '0'
  });
  const [settings, setSettings] = React.useState({
    societyName: 'Morya CHS Ltd'
  });

  React.useEffect(() => {
    // Global Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCounts(prev => ({ ...prev, members: data.memberCount || '124' }));
        setSettings({ societyName: data.societyName || 'Morya CHS Ltd' });
      }
    });

    // Count Notices
    const unsubNotices = onSnapshot(collection(db, 'notices'), (snap) => {
       setCounts(prev => ({ ...prev, notices: snap.size.toString() }));
    });

    // Count Documents
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
      setCounts(prev => ({ ...prev, docs: snap.size.toString() }));
    });

    // Count Open Tickets
    const q = query(collection(db, 'tickets'), where('status', 'in', ['Open', 'In Progress']));
    const unsubTickets = onSnapshot(q, (snap) => {
      setCounts(prev => ({ ...prev, tickets: snap.size.toString() }));
    });

    return () => {
      unsubSettings();
      unsubNotices();
      unsubDocs();
      unsubTickets();
    };
  }, []);

  const stats = [
    { label: 'Total Members', value: counts.members, icon: ShieldCheck },
    { label: 'Active Notices', value: counts.notices, icon: Bell },
    { label: 'Documents', value: `${counts.docs}+`, icon: FileCheck },
    { label: 'Open Tickets', value: counts.tickets, icon: Ticket },
  ];

  const features = [
    {
      title: 'Structured Document Access',
      description: 'Easily access society bye-laws, registration details, and official certificates.',
      icon: FileCheck,
      link: '/documents'
    },
    {
      title: 'Financial Transparency',
      description: 'View audit reports, monthly collections, and expenditure details in real-time.',
      icon: ShieldCheck,
      link: '/financials'
    },
    {
      title: 'Service Ticketing System',
      description: 'Raise maintenance requests and track them until resolution with unique ticket IDs.',
      icon: Ticket,
      link: '/service-tickets'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl py-6 animate-in fade-in duration-500">
      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-6">
        
        {/* Unified Peacock Blue Hero Banner */}
        <section className="col-span-1 lg:col-span-12 rounded-3xl bg-[#005f73] p-10 shadow-2xl shadow-cyan-900/20 text-white relative overflow-hidden mb-4 min-h-[400px] flex flex-col justify-center">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-cyan-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100 ring-1 ring-cyan-400/30">Official Portal: {settings.societyName}</span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">Building Trust & Unity</span>
              </div>
              <h1 className="text-5xl font-black md:text-6xl lg:text-7xl leading-[1.1]">
                Welcome, Members!<br/>
                <span className="text-cyan-300">Unity & Progress.</span>
              </h1>
              <p className="text-cyan-50/90 text-xl font-medium leading-relaxed max-w-2xl">
                Experience the digital pulse of {settings.societyName}. Access audit reports, check notices, and interact with the committee—all in one transparent window.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/notices" className="rounded-xl bg-white px-8 py-4 text-sm font-black text-[#005f73] shadow-xl transition-all hover:scale-105 hover:bg-cyan-50 active:scale-95 uppercase tracking-widest flex items-center gap-2">
                  Latest Notices <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/service-tickets" className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white/10 uppercase tracking-widest">
                  File a Request
                </Link>
              </div>

              <div className="pt-8 border-t border-white/10 mt-8 flex flex-col md:flex-row md:items-center gap-6">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300/60 mb-2 block">Daily Inspiration</span>
                    <p className="italic text-xl font-serif text-cyan-50 group">
                      "The strength of a community is built on the foundation of trust and transparency."
                    </p>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent skew-x-[-15deg] translate-x-32 hidden lg:block"></div>
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
          </div>
        </section>

        {/* Feature Cards as Bento Items */}
        <section className="col-span-1 lg:col-span-4 lg:row-span-2 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm hover:border-indigo-200 transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
            <FileCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-800">Documents</h3>
          <p className="mt-2 text-sm text-slate-500">Access society bye-laws, registration details, and certificates.</p>
          <Link to="/documents" className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
            Archive <ArrowRight className="h-3 w-3" />
          </Link>
        </section>

        <section className="col-span-1 lg:col-span-4 lg:row-span-2 rounded-2xl bg-white border border-slate-200 p-8 shadow-sm hover:border-indigo-200 transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-800">Financials</h3>
          <p className="mt-2 text-sm text-slate-500">View audit reports and expenditure details in real-time.</p>
          <Link to="/financials" className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
            Transparency <ArrowRight className="h-3 w-3" />
          </Link>
        </section>

        {/* Stat Blocks */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 rounded-2xl bg-slate-900 p-6 shadow-xl flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Notices</p>
          <p className="text-4xl font-black text-white mt-1">{counts.notices.padStart(2, '0')}</p>
          <Link to="/notices" className="mt-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">View All</Link>
        </div>

        <div className="col-span-1 lg:col-span-2 lg:row-span-2 rounded-2xl bg-indigo-600 p-6 shadow-xl flex flex-col justify-center items-center text-center text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Members</p>
          <p className="text-4xl font-black mt-1">{counts.members}</p>
          <p className="text-[10px] mt-2 text-indigo-200 font-medium">Verified Units</p>
        </div>

        {/* Governance / Quote Block */}
        <section className="col-span-1 lg:col-span-8 lg:row-span-1 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between px-8 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
               <ShieldCheck className="h-5 w-5" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-slate-800">Compliance First</h4>
               <p className="text-[11px] text-slate-500">{settings.societyName} strictly adheres to MCS Act & society bye-laws.</p>
             </div>
           </div>
           <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div> ISO Standard</span>
             <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div> Government Audited</span>
           </div>
        </section>

      </main>
    </div>
  );
}
