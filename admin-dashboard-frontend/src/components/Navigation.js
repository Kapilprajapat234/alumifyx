import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold text-xl">Alumifyx Admin</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/users')}`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/library"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/library')}`}
                >
                  Library
                </Link>
                <Link
                  to="/admin/jobs"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/jobs')}`}
                >
                  Jobs
                </Link>
                <Link
                  to="/admin/academic"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/academic')}`}
                >
                  Academic
                </Link>
                <Link
                  to="/admin/mentorship"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/mentorship')}`}
                >
                  Mentorship
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/settings')}`}
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 