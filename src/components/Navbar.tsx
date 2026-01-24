import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Home, PlayCircle, BarChart2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(isAuthenticated ? [
      { name: 'Scoring', path: '/scoring', icon: PlayCircle },
      { name: 'My Quizzes', path: '/my-quizzes', icon: BarChart2 },
    ] : []),
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl font-bold shadow-md group-hover:scale-110 transition-transform">
                Q
              </div>
              <span className="font-bold text-xl tracking-tight">QuizTracker</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-purple-900 text-white shadow-inner'
                    : 'text-purple-100 hover:bg-purple-600'
                }`}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="ml-4 flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-orange-300 transition-colors">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-orange-400">
                    <User size={16} />
                  </div>
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 shadow-sm"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white hover:text-orange-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-purple-100 hover:text-white hover:bg-purple-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-purple-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-purple-900 text-white'
                      : 'text-purple-100 hover:bg-purple-600'
                  }`}
                >
                  <link.icon size={18} />
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 block px-3 py-2 rounded-md text-base font-medium text-purple-100 hover:bg-purple-600"
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-purple-600 hover:text-red-200"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
