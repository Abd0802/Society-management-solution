import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, FileText, Briefcase, BarChart3, Clock, Ticket, Mail, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [settings, setSettings] = React.useState({
    societyName: 'Morya CHS Ltd',
    societyEmail: 'support@moryachs.com',
    societyAddress: 'Sector 10, Kharghar, Navi Mumbai - 410210'
  });

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({
          societyName: data.societyName || 'Morya CHS Ltd',
          societyEmail: data.societyEmail || 'support@moryachs.com',
          societyAddress: data.societyAddress || 'Sector 10, Kharghar, Navi Mumbai - 410210'
        });
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'RFPs & Bids', path: '/rfps', icon: Briefcase },
    { name: 'Financials', path: '/financials', icon: BarChart3 },
    { name: 'Meeting Minutes', path: '/minutes', icon: Clock },
    { name: 'Service Tickets', path: '/service-tickets', icon: Ticket },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              {settings.societyName.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {settings.societyName} <span className="hidden font-normal text-[#005f73] sm:inline">| Member Portal</span>
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "transition-colors hover:text-indigo-600",
                    isActive ? "text-indigo-600" : "text-slate-500"
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <div className="flex flex-col gap-2 p-4 pt-20">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-semibold transition-colors",
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                  <span className="font-bold text-xs">{settings.societyName.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-slate-900">{settings.societyName} Member Portal</h3>
              </div>
              <p className="mt-4 text-sm text-slate-500 max-w-md">
                Empowering society members with complete transparency, 
                digital governance, and community trust.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Contact Details</h4>
              <ul className="mt-4 space-y-2">
                <li className="text-xs text-slate-500">{settings.societyAddress}</li>
                <li className="text-xs text-indigo-600 font-bold">{settings.societyEmail}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Support</h4>
              <ul className="mt-4 space-y-2">
                <li><NavLink to="/service-tickets" className="text-sm text-slate-500 hover:text-indigo-600">Raise a Ticket</NavLink></li>
                <li><NavLink to="/contact" className="text-sm text-slate-500 hover:text-indigo-600">Contact Committee</NavLink></li>
                <li><NavLink to="/admin" className="text-sm font-bold text-indigo-600 hover:underline">Committee Login</NavLink></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 gap-4">
            <div>© {new Date().getFullYear()} {settings.societyName}.</div>
            <div className="flex gap-8">
              <span className="flex items-center gap-1.5"><div className="h-2 w-2 bg-emerald-500 rounded-full"></div> Portal Status: Online</span>
              <span>Server: MORYA-SRV-01</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
