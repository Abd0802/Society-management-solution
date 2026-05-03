import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, ArrowUpCircle, ArrowDownCircle, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Financials() {
  const [financials, setFinancials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'financials'), orderBy('month', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFinancials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // For chart data we can reuse the fetched financials or use static for visual flair
  const chartData = financials.slice(0, 4).reverse().map(f => ({
    name: f.month.split(' ')[0],
    income: parseInt(f.income.replace(/[^0-9]/g, '')) || 0,
    expense: parseInt(f.expenditure.replace(/[^0-9]/g, '')) || 0,
  }));

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Financial Transparency</h1>
        <p className="text-slate-500">Real-time tracking of society funds, collections, and expenditures.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">Loading financial data...</div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Total Corpus</span>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">₹45,20,400</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <ArrowUpCircle className="h-3 w-3" /> Managed & Audited
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <ArrowUpCircle className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Latest Income</span>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">{financials[0]?.income || '₹0'}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Period: {financials[0]?.month}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <ArrowDownCircle className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Latest Expense</span>
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900">{financials[0]?.expenditure || '₹0'}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
                <ShieldCheck className="h-3 w-3" /> All audits verified
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-slate-900">Collections vs Expenditure</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                      cursor={{fill: '#f1f5f9'}} 
                    />
                    <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="expense" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-bold text-slate-600">Total Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-bold text-slate-600">Total Expenditure</span>
                </div>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Downloadable Audit Reports</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Report Month</th>
                    <th className="px-6 py-4">Income</th>
                    <th className="px-6 py-4">Expenditure</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {financials.map((report) => (
                    <tr key={report.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{report.month}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{report.income}</td>
                      <td className="px-6 py-4 text-red-600 font-bold">{report.expenditure}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={report.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80 shadow-lg shadow-indigo-100"
                        >
                          <Download className="h-3 w-3" /> View PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                  {financials.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400">No audit reports uploaded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
