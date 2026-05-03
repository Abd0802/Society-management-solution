import React from 'react';
import { Clock, FileText, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function MeetingMinutes() {
  const [minutes, setMinutes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const q = query(collection(db, 'minutes'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMinutes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredMinutes = minutes.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Meeting Minutes</h1>
        <p className="text-slate-500">Documenting the decisions and discussions of the Managing Committee.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search minutes by title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none transition-all focus:border-indigo-400 focus:bg-white"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">Fetching meeting transcripts...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredMinutes.map((item) => (
            <div key={item.id} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  {item.date}
                </div>
              </div>
              
              <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              
              <a 
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-900 transition-all hover:bg-indigo-600 hover:text-white shadow-sm"
              >
                <span className="flex items-center gap-2 text-sm"><ExternalLink className="h-4 w-4" /> View Full Minutes</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          ))}
          {filteredMinutes.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">No meeting minutes found matching your search.</div>
          )}
        </div>
      )}
    </div>
  );
}
