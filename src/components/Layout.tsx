import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../hooks/useTheme';

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} QuizTracker. Making learning fun!</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
