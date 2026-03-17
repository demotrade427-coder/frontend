import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  HiMenuAlt3, HiX, HiUser, HiLogout, HiHome, HiInformationCircle, 
  HiCog, HiCalculator, HiQuestionMarkCircle, HiPhone, HiCreditCard, 
  HiChartBar, HiChevronDown, HiLogin, HiUserAdd, HiShieldCheck
} from 'react-icons/hi';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Plans', path: '/plans' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  const userLinks = [
    { name: 'Dashboard', path: isAdmin ? '/admin' : '/dashboard', icon: HiChartBar },
    { name: 'Trading', path: '/trading', icon: HiCalculator },
    { name: 'Wallet', path: '/wallet', icon: HiCreditCard },
    { name: 'Profile', path: '/profile', icon: HiUser },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 rounded-b-2xl shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all">
              <span className="text-white font-bold text-lg lg:text-xl">IP</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white">InvestPro</span>
          </Link>

          <div className="hidden xl:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden xl:flex items-center space-x-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all px-2 py-1.5 rounded-xl hover:bg-white/5"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <HiUser className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{user.firstName || user.username}</span>
                  <HiChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-white font-medium truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {userLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.path}
                            className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                          >
                            <link.icon className="w-5 h-5 mr-3" />
                            {link.name}
                          </Link>
                        ))}
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <HiLogout className="w-5 h-5 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition-all rounded-xl hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
          </div>

          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {isOpen ? <HiX className="w-7 h-7" /> : <HiMenuAlt3 className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-b-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-white/10 my-4"></div>
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <HiUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.firstName || user.username}</p>
                        <p className="text-gray-500 text-sm truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  {userLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="flex items-center px-4 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <link.icon className="w-5 h-5 mr-3" />
                      {link.name}
                    </Link>
                  ))}
                </>
              )}
              
              <div className="border-t border-white/10 my-4"></div>
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <HiLogout className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full px-4 py-3.5 text-gray-300 hover:text-white rounded-xl transition-colors border border-white/10 hover:border-white/20"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full px-4 py-3.5 bg-white text-black font-semibold rounded-xl transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
