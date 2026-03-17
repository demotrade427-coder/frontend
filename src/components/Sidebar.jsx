import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, HiCreditCard, HiTrendingUp, HiUser, HiLogout, HiUsers, 
  HiCurrencyDollar, HiDocumentText, HiCollection, HiMenuAlt3, HiX,
  HiShieldCheck, HiSupport
} from 'react-icons/hi';

function Sidebar({ isAdmin }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAgent = user?.role === 'agent' || user?.is_agent;

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: HiHome },
    { name: 'Trading', path: '/trading', icon: HiTrendingUp },
    { name: 'Investments', path: '/investments', icon: HiCollection },
    { name: 'Wallet', path: '/wallet', icon: HiCreditCard },
    { name: 'Profile', path: '/profile', icon: HiUser },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: HiHome },
    { name: 'Users', path: '/admin/users', icon: HiUsers },
    { name: 'Plans', path: '/admin/plans', icon: HiCollection },
    { name: 'Deposits', path: '/admin/deposits', icon: HiCurrencyDollar },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: HiDocumentText },
  ];

  const agentLinks = [
    { name: 'Dashboard', path: '/agent', icon: HiHome },
    { name: 'My Users', path: '/agent/users', icon: HiUsers },
    { name: 'Trades', path: '/agent/trades', icon: HiTrendingUp },
    { name: 'Support', path: '/agent/tickets', icon: HiSupport },
  ];

  const links = isAgent ? agentLinks : (isAdmin ? adminLinks : userLinks);

  const SidebarContent = ({ onClose }) => (
    <>
      <div className="p-4 lg:p-6 border-b border-white/5">
        <Link to="/" className="flex items-center space-x-3" onClick={onClose}>
          <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-bg rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg lg:text-xl">
              {isAgent ? 'A' : (isAdmin ? 'IP' : 'IP')}
            </span>
          </div>
          <span className="text-xl font-bold text-white">
            {isAgent ? 'Agent Panel' : (isAdmin ? 'Admin Panel' : 'InvestPro')}
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 lg:py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-white border border-primary-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 lg:p-4 border-t border-white/5">
        {user?.email && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account</p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <HiLogout className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-premium-card/90 backdrop-blur border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        <HiMenuAlt3 className="w-6 h-6" />
      </button>

      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-premium-dark/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
        <SidebarContent />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-80 max-w-[85vw] bg-premium-dark/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-50"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
