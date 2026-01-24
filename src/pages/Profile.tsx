import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { User, Mail, Phone, Save, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/me', {
        ...formData,
        age: Number(formData.age),
      });
      updateUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-purple-600 border-4 border-orange-400">
            {user?.name.charAt(0)}
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-purple-100">{user?.role} Account</p>
          </div>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h3>
          <p className="text-gray-500">Switch between light and dark themes</p>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all ${
            theme === 'dark' 
              ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
              : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
          }`}
        >
          {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>
    </div>
  );
};

export default Profile;
