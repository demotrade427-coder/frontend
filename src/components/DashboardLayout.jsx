import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, HiCreditCard, HiTrendingUp, HiUser, HiLogout, HiCollection,
  HiMenuAlt3, HiX, HiShieldCheck
} from 'react-icons/hi';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { id: 'trading', path: '/dashboard/trading', icon: HiTrendingUp, label: 'Trading' },
  { id: 'investments', path: '/dashboard/investments', icon: HiCollection, label: 'Investments' },
  { id: 'loans', path: '/dashboard/loans', icon: HiCreditCard, label: 'Loans' },
  { id: 'wallet', path: '/dashboard/wallet', icon: HiCreditCard, label: 'Wallet' },
  { id: 'profile', path: '/dashboard/profile', icon: HiUser, label: 'Profile' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <HiMenuAlt3 className="w-6 h-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">InvestPro</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-white text-sm font-medium">{user?.first_name || 'User'}</span>
                <span className="text-slate-400 text-xs">{user?.email}</span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent menuItems={menuItems} currentPath={currentPath} onNavigate={() => setSidebarOpen(false)} handleLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-14 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex-col z-30">
        <SidebarContent menuItems={menuItems} currentPath={currentPath} handleLogout={handleLogout} />
      </div>

      {/* Main Content - Full Width */}
      <div className="lg:ml-64 pt-14 min-h-screen">
        <div className="p-6 lg:p-8 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ menuItems, currentPath, onNavigate, handleLogout }) {
  return (
    <>
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <HiShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">InvestPro</p>
            <p className="text-slate-400 text-sm">Trading Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <HiLogout className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );
}
