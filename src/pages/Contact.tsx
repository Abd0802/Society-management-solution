import React from 'react';
import { Mail, Phone, MapPin, Clock, Shield, Send } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Contact() {
  const [committee, setCommittee] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState({
    societyName: 'Morya CHS Ltd',
    societyAddress: 'Sector 10, Kharghar, Navi Mumbai - 410210',
    societyEmail: 'support@moryachs.com',
    societyPhone: '+91 22 2774 XXXX',
  });

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCommittee(data.committeeMembers || []);
        setSettings({
          societyName: data.societyName || 'Morya CHS Ltd',
          societyAddress: data.societyAddress || 'Sector 10, Kharghar, Navi Mumbai - 410210',
          societyEmail: data.societyEmail || 'support@moryachs.com',
          societyPhone: data.societyPhone || '+91 22 2774 XXXX',
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-6 animate-in fade-in duration-500">
      <div className="mb-12 space-y-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Contact & Queries</h1>
        <p className="text-slate-500">Reach out to the {settings.societyName} Managing Committee for any concerns.</p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100">
            <h2 className="text-2xl font-bold">Society Office</h2>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-indigo-200 shrink-0" />
                <p className="text-lg font-medium leading-relaxed">
                  {settings.societyName},<br />
                  {settings.societyAddress}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-indigo-200 shrink-0" />
                <p className="text-lg font-medium">{settings.societyEmail}</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-indigo-200 shrink-0" />
                <p className="text-lg font-medium">{settings.societyPhone}</p>
              </div>
            </div>
            <div className="mt-12 rounded-2xl bg-indigo-500/30 p-6 backdrop-blur-sm border border-indigo-400/30">
               <div className="flex items-center gap-2 font-bold mb-2">
                  <Clock className="h-4 w-4" /> Office Hours
               </div>
               <p className="text-sm text-indigo-100">Mon - Fri: 10:00 AM to 6:00 PM</p>
               <p className="text-sm text-indigo-100">Sat - Sun: Closed</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Managing Committee</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {committee.length > 0 ? committee.map((member) => (
                <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs font-medium text-slate-500">{member.role}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-4 text-center text-slate-400 text-xs italic">
                  No committee members listed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">General Query</h2>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Your Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-indigo-400 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Subject</label>
              <input 
                type="text" 
                placeholder="What is this regarding?" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-indigo-400 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Message</label>
              <textarea 
                rows={5} 
                placeholder="How can we help you?" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-indigo-400 focus:bg-white"
              />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.98]">
              <Send className="h-5 w-5" /> Send Message
            </button>
            <p className="text-center text-xs text-slate-400">
              For maintenance requests, please use the <a href="/service-tickets" className="font-bold text-indigo-600 underline">Service Ticket System</a> instead.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
