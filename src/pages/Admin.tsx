import React from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Ticket, 
  Bell, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Authorized Admin Email (from metadata)
const ADMIN_EMAILS = ['adashutosh@gmail.com'];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Admin() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState<'tickets' | 'notices' | 'docs' | 'rfps' | 'financials' | 'minutes' | 'audit' | 'settings'>('tickets');
  const [error, setError] = React.useState<string | null>(null);
  
  // Data States
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [notices, setNotices] = React.useState<any[]>([]);
  const [docs, setDocs] = React.useState<any[]>([]);
  const [rfps, setRfps] = React.useState<any[]>([]);
  const [financials, setFinancials] = React.useState<any[]>([]);
  const [minutes, setMinutes] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  const handleFirestoreError = (err: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: err instanceof Error ? err.message : String(err),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    if (err instanceof Error && err.message.includes('permission')) {
       setError(`Access Denied to ${path}. Please check your credentials.`);
    }
  };

  // Form States for adding content
  const [newNotice, setNewNotice] = React.useState({ title: '', content: '', urgency: 'Low', attachmentUrl: '' });
  const [newDoc, setNewDoc] = React.useState({ name: '', category: 'Constitutional', url: '' });
  const [newRfp, setNewRfp] = React.useState({ title: '', status: 'Open', deadline: '', budget: '', description: '', sowUrl: '', selectionCriteria: '' });
  const [newFinancial, setNewFinancial] = React.useState({ month: '', expenditure: '', income: '', reportUrl: '' });
  const [newMinute, setNewMinute] = React.useState({ date: '', title: '', url: '' });
  const [settings, setSettings] = React.useState({ 
    memberCount: '124', 
    societyName: 'MORYA CHS LTD', 
    societyAddress: 'Sector 10, Kharghar, Navi Mumbai - 410210', 
    societyEmail: 'support@moryachs.com', 
    societyPhone: '+91 22 2774 XXXX',
    committeeMembers: [] as {id: string, name: string, role: string}[] 
  });
  const [newCommitteeMember, setNewCommitteeMember] = React.useState({ name: '', role: '' });

  // RFP Bid Management State
  const [managingRfpBids, setManagingRfpBids] = React.useState<string | null>(null);
  const [newBid, setNewBid] = React.useState({ vendorName: '', bidAmount: '', proposalUrl: '' });

  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    if (file.size > 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const FileUploadInput = ({ label, value, onUpload, id }: { label: string, value: string, onUpload: (url: string) => void, id: string }) => (
    <div className="space-y-1.5 col-span-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div 
        onClick={() => document.getElementById(id)?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-indigo-400 hover:bg-white cursor-pointer group",
          value && "border-emerald-200 bg-emerald-50/30"
        )}
      >
        <input 
          id={id}
          type="file" 
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, onUpload);
          }}
        />
        {value ? (
          <div className="flex flex-col items-center gap-2">
            <FileCheck className="h-8 w-8 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600">File Attached (Click to change)</span>
          </div>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <p className="text-sm font-bold text-slate-600">Click to Upload Document</p>
            <p className="text-[10px] text-slate-400 mt-1 italic">PDF, JPG, PNG allowed. Max 1MB.</p>
          </>
        )}
      </div>
    </div>
  );

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logAction = async (action: string, effect: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'audit_trail'), {
        admin: user.displayName || user.email,
        email: user.email,
        action,
        effect,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to log audit trail:", err);
    }
  };

  React.useEffect(() => {
    if (!user) return;
    
    // Subscriptions
    const subs = [
      onSnapshot(query(collection(db, 'tickets'), orderBy('createdAt', 'desc')), 
        (snap) => setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'tickets')
      ),
      onSnapshot(query(collection(db, 'notices'), orderBy('date', 'desc')), 
        (snap) => setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'notices')
      ),
      onSnapshot(query(collection(db, 'documents'), orderBy('uploadedAt', 'desc')), 
        (snap) => setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'documents')
      ),
      onSnapshot(query(collection(db, 'rfps'), orderBy('deadline', 'desc')), 
        (snap) => setRfps(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'rfps')
      ),
      onSnapshot(query(collection(db, 'financials'), orderBy('month', 'desc')), 
        (snap) => setFinancials(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'financials')
      ),
      onSnapshot(query(collection(db, 'minutes'), orderBy('date', 'desc')), 
        (snap) => setMinutes(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'minutes')
      ),
      onSnapshot(query(collection(db, 'audit_trail'), orderBy('timestamp', 'desc')), 
        (snap) => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'audit_trail')
      ),
      onSnapshot(doc(db, 'settings', 'global'), 
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setSettings({
              memberCount: data.memberCount || '124',
              societyName: data.societyName || 'MORYA CHS LTD',
              societyAddress: data.societyAddress || 'Sector 10, Kharghar, Navi Mumbai - 410210',
              societyEmail: data.societyEmail || 'support@moryachs.com',
              societyPhone: data.societyPhone || '+91 22 2774 XXXX',
              committeeMembers: data.committeeMembers || []
            });
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'settings/global')
      )
    ];

    return () => subs.forEach(unsub => unsub());
  }, [user]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, 'settings', 'global'), settings);
    logAction('Update Settings', `Updated global settings`);
    alert("Settings updated successfully!");
  };

  const handleAddCommitteeMember = () => {
    const committeeMembers = settings.committeeMembers || [];
    if (committeeMembers.length >= 20) {
      alert("Maximum 20 committee members allowed.");
      return;
    }
    if (!newCommitteeMember.name || !newCommitteeMember.role) {
      alert("Please enter both name and role.");
      return;
    }
    const memberWithId = { ...newCommitteeMember, id: Math.random().toString(36).substr(2, 9) };
    setSettings({
      ...settings,
      committeeMembers: [...committeeMembers, memberWithId]
    });
    setNewCommitteeMember({ name: '', role: '' });
  };

  const handleRemoveCommitteeMember = (id: string) => {
    const committeeMembers = settings.committeeMembers || [];
    setSettings({
      ...settings,
      committeeMembers: committeeMembers.filter(m => m.id !== id)
    });
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSeedData = async () => {
    const { seedDemoData } = await import('../lib/seedData');
    await seedDemoData();
  };

  const isAdmin = user && (ADMIN_EMAILS.some(e => e.toLowerCase() === (user.email || '').toLowerCase()));

  // CMS Handlers
  const handleUpdateTicket = async (id: string, updates: any) => {
    const ticket = tickets.find(t => t.id === id);
    await updateDoc(doc(db, 'tickets', id), { ...updates, updatedAt: serverTimestamp() });
    logAction('Update Ticket', `Modified ticket ${ticket?.ticketId}. Changes: ${JSON.stringify(updates)}`);
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'notices'), { ...newNotice, date: serverTimestamp() });
    logAction('Add Notice', `Posted new notice: ${newNotice.title}`);
    setNewNotice({ title: '', content: '', urgency: 'Low', attachmentUrl: '' });
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'documents'), { ...newDoc, uploadedAt: serverTimestamp() });
    logAction('Upload Document', `Uploaded document: ${newDoc.name}`);
    setNewDoc({ name: '', category: 'Constitutional', url: '' });
  };

  const handleAddRfp = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'rfps'), { ...newRfp, bids: [], createdAt: serverTimestamp() });
    logAction('Create RFP', `Created RFP: ${newRfp.title}`);
    setNewRfp({ title: '', status: 'Open', deadline: '', budget: '', description: '', sowUrl: '', selectionCriteria: '' });
  };

  const handleAddBid = async (rfpId: string) => {
    const rfp = rfps.find(r => r.id === rfpId);
    if (!rfp) return;
    const currentBids = rfp.bids || [];
    if (currentBids.length >= 10) {
      alert("Maximum 10 bids allowed per RFP.");
      return;
    }
    const bidWithId = { ...newBid, id: Math.random().toString(36).substr(2, 9), submittedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'rfps', rfpId), {
      bids: [...currentBids, bidWithId]
    });
    logAction('Add Bid', `Added bid from ${newBid.vendorName} to RFP: ${rfp.title}`);
    setNewBid({ vendorName: '', bidAmount: '', proposalUrl: '' });
  };

  const handleShortlistVendor = async (rfpId: string, bidId: string) => {
    await updateDoc(doc(db, 'rfps', rfpId), { shortlistedVendorId: bidId, status: 'Under Review' });
    logAction('Shortlist Vendor', `Shortlisted bid ID ${bidId} for RFP ID ${rfpId}`);
  };

  const handleAddFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'financials'), { ...newFinancial, createdAt: serverTimestamp() });
    logAction('Add Financials', `Added financial record for ${newFinancial.month}`);
    setNewFinancial({ month: '', expenditure: '', income: '', reportUrl: '' });
  };

  const handleAddMinute = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'minutes'), { ...newMinute, createdAt: serverTimestamp() });
    logAction('Add Minutes', `Uploaded Meeting Minutes for ${newMinute.date}`);
    setNewMinute({ date: '', title: '', url: '' });
  };

  const handleDelete = async (coll: string, id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteDoc(doc(db, coll, id));
      logAction('Delete Record', `Deleted ${name} from ${coll}`);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Admin Portal...</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mb-8 flex justify-center text-indigo-600">
          <Settings className="h-16 w-16 animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Committee Auth</h1>
        <p className="mt-4 text-slate-500 italic">"Restricted access for Managing Committee members only."</p>
        <button
          onClick={handleLogin}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700"
        >
          <LogIn className="h-5 w-5" /> Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-4 text-slate-500">
          Logged in as <span className="font-bold text-slate-900">{user.email}</span>. 
          This account is not authorized to access the Admin Panel. Please contact the Society Secretary.
        </p>
        <button onClick={handleLogout} className="mt-8 text-sm font-bold text-indigo-600 underline">Logout and try different account</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-6 animate-in fade-in duration-500">
      <header className="mb-10 flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Control Center</h1>
          <p className="text-sm font-medium text-slate-500">Logged in as {user.displayName || user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-[10px] uppercase font-black tracking-widest text-red-400 hover:text-red-600">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Nav */}
        <aside className="space-y-2">
          {[
            { id: 'tickets', name: 'Service Tickets', icon: Ticket, count: tickets.length },
            { id: 'notices', name: 'Manage Notices', icon: Bell, count: notices.length },
            { id: 'docs', name: 'Manage Docs', icon: FileText, count: docs.length },
            { id: 'rfps', name: 'Manage RFPs', icon: Briefcase, count: rfps.length },
            { id: 'financials', name: 'Manage Financials', icon: BarChart3, count: financials.length },
            { id: 'minutes', name: 'Meeting Minutes', icon: Clock, count: minutes.length },
            { id: 'audit', name: 'Audit Trail', icon: ShieldCheck, count: auditLogs.length },
            { id: 'settings', name: 'Portal Settings', icon: Settings, count: 1 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all",
                activeView === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.name}
              </div>
              <span className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-black",
                activeView === item.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
              )}>{item.count}</span>
            </button>
          ))}

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button 
              onClick={handleSeedData}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-all border border-dashed border-emerald-200"
            >
              <Plus className="h-4 w-4" />
              Seed Demo Data
            </button>
            <p className="px-4 mt-2 text-[10px] text-slate-400 italic font-medium">Populate portal with sample tickets, notices, and functional documents.</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          {activeView === 'tickets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-900">Latest Support Tickets</h2>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div> Open
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div> In Progress
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div> Closed
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tickets.map(t => (
                  <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.ticketId}</span>
                        <h3 className="text-lg font-bold text-slate-900">{t.name} (Flat {t.flatNumber})</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-xs text-slate-500 font-medium">{t.type}</p>
                          <p className="text-xs text-indigo-600 font-bold">{t.email}</p>
                          <p className="text-xs text-slate-400">{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : 'Just now'}</p>
                        </div>
                        {t.paymentScreenshotUrl && (
                          <a 
                            href={t.paymentScreenshotUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" /> View Payment Screenshot
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={t.status}
                          onChange={(e) => handleUpdateTicket(t.id, { status: e.target.value })}
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm",
                            t.status === 'Open' ? "bg-blue-100 text-blue-700" :
                            t.status === 'In Progress' ? "bg-amber-100 text-amber-700" :
                            "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button onClick={() => handleDelete('tickets', t.id, t.ticketId)} className="text-slate-300 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">"{t.description}"</p>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400">Assigned To</label>
                          <input 
                            type="text" 
                            defaultValue={t.assignedTo}
                            onBlur={(e) => handleUpdateTicket(t.id, { assignedTo: e.target.value })}
                            className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-indigo-400 focus:bg-white"
                            placeholder="Set member name"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400">Remarks</label>
                          <input 
                            type="text" 
                            defaultValue={t.remarks}
                            onBlur={(e) => handleUpdateTicket(t.id, { remarks: e.target.value })}
                            className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-400 focus:bg-white italic"
                            placeholder="Add memo..."
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'financials' && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" /> Log Monthly Financials
                </h3>
                <form onSubmit={handleAddFinancial} className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Month / Period</label>
                    <input 
                      required 
                      placeholder="e.g. May 2026" 
                      value={newFinancial.month}
                      onChange={e => setNewFinancial({...newFinancial, month: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Total Income</label>
                    <input 
                      required 
                      placeholder="e.g. ₹12.5L" 
                      value={newFinancial.income}
                      onChange={e => setNewFinancial({...newFinancial, income: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Total Expenditure</label>
                    <input 
                      required 
                      placeholder="e.g. ₹8.2L" 
                      value={newFinancial.expenditure}
                      onChange={e => setNewFinancial({...newFinancial, expenditure: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                  <FileUploadInput 
                    label="Audit Report Attachment" 
                    id="fin-upload" 
                    value={newFinancial.reportUrl} 
                    onUpload={(url) => setNewFinancial({...newFinancial, reportUrl: url})} 
                  />
                  <button className="col-span-2 mt-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Add Record</button>
                </form>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4">Income</th>
                      <th className="px-6 py-4">Expense</th>
                      <th className="px-6 py-4">Net</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financials.map(f => (
                      <tr key={f.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{f.month}</td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">{f.income}</td>
                        <td className="px-6 py-4 text-red-600 font-medium">{f.expenditure}</td>
                        <td className="px-6 py-4 text-slate-500 italic">Report Linked</td>
                        <td className="px-6 py-4 flex gap-4">
                           <a href={f.reportUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600"><ExternalLink className="h-4 w-4" /></a>
                           <button onClick={() => handleDelete('financials', f.id, f.month)} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'minutes' && (
             <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" /> Log Meeting Minutes
                  </h3>
                  <form onSubmit={handleAddMinute} className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Meeting Date</label>
                      <input 
                        required 
                        type="date"
                        value={newMinute.date}
                        onChange={e => setNewMinute({...newMinute, date: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Meeting Title</label>
                      <input 
                        required 
                        placeholder="e.g. AGM 2026 Discussion" 
                        value={newMinute.title}
                        onChange={e => setNewMinute({...newMinute, title: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    <FileUploadInput 
                      label="Minutes Document Attachment" 
                      id="minute-upload" 
                      value={newMinute.url} 
                      onUpload={(url) => setNewMinute({...newMinute, url: url})} 
                    />
                    <button className="col-span-2 mt-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Add Minutes</button>
                  </form>
                </div>

                <div className="space-y-3">
                  {minutes.map(m => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 group">
                      <div className="flex items-center gap-4">
                        <div className="rounded bg-indigo-50 p-2 text-indigo-600"><Clock className="h-4 w-4" /></div>
                        <div>
                          <p className="font-bold text-slate-900">{m.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{m.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <a href={m.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600"><ExternalLink className="h-4 w-4" /></a>
                        <button onClick={() => handleDelete('minutes', m.id, m.title)} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeView === 'audit' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" /> System Audit Trail
                </h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase text-white tracking-widest">Immutable Log</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[8px] font-black uppercase text-slate-400 tracking-widest sticky top-0">
                      <tr>
                        <th className="px-6 py-4">Admin</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Effect</th>
                        <th className="px-6 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <p className="font-bold text-slate-900">{log.admin}</p>
                             <p className="text-[9px] text-slate-400">{log.email}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-600">{log.action}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{log.effect}</td>
                          <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                             {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeView === 'notices' && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" /> Post New Notice
                </h3>
                <form onSubmit={handleAddNotice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required 
                      placeholder="Notice Title" 
                      value={newNotice.title}
                      onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                    <select 
                      value={newNotice.urgency}
                      onChange={e => setNewNotice({...newNotice, urgency: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <FileUploadInput 
                    label="Notice Attachment (Optional)" 
                    id="notice-upload" 
                    value={newNotice.attachmentUrl} 
                    onUpload={(url) => setNewNotice({...newNotice, attachmentUrl: url})} 
                  />
                  <textarea 
                    required 
                    placeholder="Content (Markdown supported)" 
                    rows={4}
                    value={newNotice.content}
                    onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  />
                  <button className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Post Notice</button>
                </form>
              </div>

              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 group">
                    <div className="flex items-center gap-4">
                      <div className="rounded bg-indigo-50 p-2 text-indigo-600"><Bell className="h-4 w-4" /></div>
                      <div>
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{n.date?.toDate ? n.date.toDate().toLocaleDateString() : 'Just now'} • {n.urgency} priority</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete('notices', n.id, n.title)} className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'docs' && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" /> Upload Document Metadata
                </h3>
                <form onSubmit={handleAddDoc} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required 
                      placeholder="Document Name" 
                      value={newDoc.name}
                      onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                    <select 
                      value={newDoc.category}
                      onChange={e => setNewDoc({...newDoc, category: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="Constitutional">Constitutional</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Agreements">Agreements</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <FileUploadInput 
                    label="Document File Attachment" 
                    id="doc-upload" 
                    value={newDoc.url} 
                    onUpload={(url) => setNewDoc({...newDoc, url: url})} 
                  />
                  <button className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Add Document</button>
                </form>
              </div>

               <div className="space-y-3">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 group">
                    <div className="flex items-center gap-4">
                      <div className="rounded bg-amber-50 p-2 text-amber-600"><FileText className="h-4 w-4" /></div>
                      <div>
                        <p className="font-bold text-slate-900">{d.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{d.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600"><ExternalLink className="h-4 w-4" /></a>
                      <button onClick={() => handleDelete('documents', d.id, d.name)} className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'rfps' && (
             <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" /> New RFP Listing
                </h3>
                <form onSubmit={handleAddRfp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required 
                      placeholder="Project Title" 
                      value={newRfp.title}
                      onChange={e => setNewRfp({...newRfp, title: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                    <input 
                      required 
                      type="date"
                      value={newRfp.deadline}
                      onChange={e => setNewRfp({...newRfp, deadline: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required 
                      placeholder="Budget/Estimate (e.g. ₹5L+)" 
                      value={newRfp.budget}
                      onChange={e => setNewRfp({...newRfp, budget: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                    />
                    <select 
                      value={newRfp.status}
                      onChange={e => setNewRfp({...newRfp, status: e.target.value})}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Awarded">Awarded</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <FileUploadInput 
                    label="Statement of Work (SOW) Attachment" 
                    id="sow-upload" 
                    value={newRfp.sowUrl} 
                    onUpload={(url) => setNewRfp({...newRfp, sowUrl: url})} 
                  />
                  <textarea 
                    required 
                    placeholder="Short Description" 
                    value={newRfp.description}
                    onChange={e => setNewRfp({...newRfp, description: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  />
                  <textarea 
                    placeholder="Selection Criteria (e.g. Price 40%, Experience 30%, Delivery 30%)" 
                    value={newRfp.selectionCriteria}
                    onChange={e => setNewRfp({...newRfp, selectionCriteria: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white h-20"
                  />
                  <button className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">Publish RFP</button>
                </form>
              </div>

                <div className="space-y-4">
                 {rfps.map(r => (
                   <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm group">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-4">
                         <div className="rounded bg-slate-100 p-2 text-slate-600"><Briefcase className="h-4 w-4" /></div>
                         <div>
                           <p className="text-lg font-bold text-slate-900">{r.title}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                             <span className={cn(
                               "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest",
                               r.status === 'Open' ? "bg-indigo-100 text-indigo-700" :
                               r.status === 'Awarded' ? "bg-emerald-100 text-emerald-700" :
                               "bg-amber-100 text-amber-700"
                             )}>{r.status}</span>
                             <span className="text-[10px] text-slate-400 font-medium">Deadline: {r.deadline}</span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <button 
                           onClick={() => setManagingRfpBids(managingRfpBids === r.id ? null : r.id)}
                           className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
                         >
                           {managingRfpBids === r.id ? 'Hide Bids' : 'Manage Bids'} 
                           <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px]">{r.bids?.length || 0}</span>
                         </button>
                         <button onClick={() => handleDelete('rfps', r.id, r.title)} className="text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                           <Trash2 className="h-5 w-5" />
                         </button>
                       </div>
                     </div>

                     {managingRfpBids === r.id && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         className="pt-6 border-t border-slate-50 space-y-6"
                       >
                         {/* SOW Link */}
                         {r.sowUrl && (
                           <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                 <FileText className="h-4 w-4 text-indigo-600" />
                                 <span className="text-xs font-bold text-indigo-900 uppercase">Statement of Work (SOW)</span>
                              </div>
                              <a href={r.sowUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs font-black">VIEW SOW</a>
                           </div>
                         )}

                         {/* Bids List */}
                         <div className="space-y-3">
                           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Received Bids (Max 10)</h4>
                           {r.bids && r.bids.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               {r.bids.map((bid: any) => (
                                 <div key={bid.id} className={cn(
                                   "p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 relative",
                                   r.shortlistedVendorId === bid.id && "ring-2 ring-emerald-500 bg-emerald-50/30"
                                 )}>
                                   <div className="flex justify-between items-start">
                                     <div>
                                       <p className="font-bold text-slate-900">{bid.vendorName}</p>
                                       <p className="text-sm font-black text-indigo-600">{bid.bidAmount}</p>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <a href={bid.proposalUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 p-1">
                                         <ExternalLink className="h-4 w-4" />
                                       </a>
                                       {r.shortlistedVendorId === bid.id ? (
                                         <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                           Shortlisted
                                         </span>
                                       ) : (
                                         <button 
                                           onClick={() => handleShortlistVendor(r.id, bid.id)}
                                           className="text-[8px] font-black uppercase text-slate-400 hover:text-emerald-600 border border-slate-200 px-2 py-0.5 rounded-full hover:border-emerald-200 transition-all"
                                         >
                                           Shortlist
                                         </button>
                                       )}
                                     </div>
                                   </div>
                                    <p className="text-[9px] text-slate-400">Date: {new Date(bid.submittedAt).toLocaleDateString()}</p>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">No bids logged yet.</div>
                           )}
                         </div>

                         {/* Add Bid Form */}
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest mb-4">Add Vendor Proposal</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400">Vendor Name</label>
                                 <input 
                                   className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-400"
                                   placeholder="Enter Name"
                                   value={newBid.vendorName}
                                   onChange={e => setNewBid({...newBid, vendorName: e.target.value})}
                                 />
                               </div>
                               <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400">Bid Amount</label>
                                 <input 
                                   className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-400"
                                   placeholder="e.g. ₹4.8L"
                                   value={newBid.bidAmount}
                                   onChange={e => setNewBid({...newBid, bidAmount: e.target.value})}
                                 />
                               </div>
                               <FileUploadInput 
                                 label="Proposal Document" 
                                 id={`bid-proposal-${r.id}`}
                                 value={newBid.proposalUrl}
                                 onUpload={(url) => setNewBid({...newBid, proposalUrl: url})}
                                />
                               <button 
                                 onClick={() => handleAddBid(r.id)}
                                 disabled={!newBid.vendorName || !newBid.bidAmount || !newBid.proposalUrl}
                                 className="md:col-span-2 rounded-xl bg-slate-900 text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                 Submit Bid Record
                               </button>
                            </div>
                         </div>
                       </motion.div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           )}

           {activeView === 'settings' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-xl font-bold text-slate-900">Portal Global Settings</h2>
                <p className="text-sm text-slate-500">Update statistics and global configurations for the member portal.</p>
              </header>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Society Name</label>
                      <input 
                        type="text" 
                        required 
                        value={settings.societyName}
                        onChange={e => setSettings({...settings, societyName: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                        placeholder="e.g. MORYA CHS LTD"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Society Members</label>
                      <input 
                        type="text" 
                        required 
                        value={settings.memberCount}
                        onChange={e => setSettings({...settings, memberCount: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                        placeholder="e.g. 124"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Society Address</label>
                      <input 
                        type="text" 
                        required 
                        value={settings.societyAddress}
                        onChange={e => setSettings({...settings, societyAddress: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                        placeholder="Full Address"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Email</label>
                      <input 
                        type="email" 
                        required 
                        value={settings.societyEmail}
                        onChange={e => setSettings({...settings, societyEmail: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                        placeholder="support@society.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone</label>
                      <input 
                        type="text" 
                        required 
                        value={settings.societyPhone}
                        onChange={e => setSettings({...settings, societyPhone: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                        placeholder="+91 XXXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Committee Management (Max 20)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Member Name</label>
                        <input 
                          type="text"
                          value={newCommitteeMember.name}
                          onChange={e => setNewCommitteeMember({...newCommitteeMember, name: e.target.value})}
                          placeholder="Full Name"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Role / Designation</label>
                        <input 
                          type="text"
                          value={newCommitteeMember.role}
                          onChange={e => setNewCommitteeMember({...newCommitteeMember, role: e.target.value})}
                          placeholder="e.g. Chairman, Secretary"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAddCommitteeMember}
                        className="md:col-span-2 rounded-xl bg-slate-900 text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Add to List
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {settings.committeeMembers?.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm group">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{m.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{m.role}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveCommitteeMember(m.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {(!settings.committeeMembers || settings.committeeMembers.length === 0) && (
                        <div className="col-span-full py-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs italic">
                          No committee members added yet.
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Save Configuration
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
