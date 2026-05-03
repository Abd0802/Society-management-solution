import React from 'react';
import { motion } from 'motion/react';
import { Bell, Calendar, ChevronRight, Filter, Megaphone } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Notices() {
  const [notices, setNotices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState({ societyName: 'Morya CHS Ltd' });

  React.useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings({ societyName: snap.data().societyName || 'Morya CHS Ltd' });
      }
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Notices & Announcements</h1>
          <p className="text-slate-500">Official communications from the {settings.societyName} Managing Committee.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <Filter className="h-4 w-4" /> Filter by Category
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Fetching latest notices...</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notice.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      notice.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                      notice.urgency === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {notice.urgency}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {notice.date?.toDate ? notice.date.toDate().toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{notice.content}</p>
                </div>
              </div>
              <div className="translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                <ChevronRight className="h-6 w-6 text-indigo-400" />
              </div>
            </motion.div>
          ))}
          {notices.length === 0 && <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">No notices posted yet.</div>}
        </div>
      )}

      <div className="rounded-2xl bg-indigo-50 p-8 border border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-900">Want to receive notices on WhatsApp?</h3>
        <p className="mt-2 text-indigo-700/80 max-w-xl">
           Join the official {settings.societyName} Community WhatsApp group for real-time alerts. 
           Please contact the security cabin or the society office to verify your membership and get the link.
        </p>
        <button className="mt-6 rounded-full bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95">
          Join WhatsApp Community
        </button>
      </div>
    </div>
  );
}
