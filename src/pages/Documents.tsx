import React from 'react';
import { FileText, Download, Folder, Search, ExternalLink } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Documents() {
  const [docs, setDocs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDocs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDocs = docs.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Constitutional', 'Compliance', 'Agreements', 'General'];

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Documents Repository</h1>
        <p className="text-slate-500">Secure access to all official society documents and certificates.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search documents by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading documents...</div>
      ) : (
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = filteredDocs.filter(d => d.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Folder className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{cat}</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((doc) => (
                    <div key={doc.id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-bold text-slate-900 line-clamp-2 min-h-[3rem]">{doc.name}</h3>
                      <div className="mt-2 text-xs font-medium text-slate-500">
                        Updated {doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toLocaleDateString() : 'Just now'}
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 py-2 text-xs font-bold transition-all hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
                      >
                        <ExternalLink className="h-3 w-3" /> View / Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredDocs.length === 0 && <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">No documents available matching your search.</div>}
        </div>
      )}
    </div>
  );
}
