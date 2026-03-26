import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import Toast from '../components/Toast';

const MENU = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Raise Complaint', path: '/complaints/new' },
  { name: 'My Complaints', path: '/complaints' },
  { name: 'UT Results', path: '/results' },
  { name: 'Student Corner', path: '/corner' },
  { name: 'AI Assistant', path: '/ai-chat' },
];

const CATEGORIES = [
  'Academic', 'Infrastructure', 'Hostel', 'Library',
  'Canteen', 'Transport', 'Administration', 'Other',
];

const ICONS = {
  Dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'Raise Complaint': 'M12 4v16m8-8H4',
  'My Complaints': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'UT Results': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'Student Corner': 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
  'AI Assistant': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
};


function SidebarIcon({ name }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[name] || ICONS['AI Assistant']} />
    </svg>
  );
}

function CreateComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', description: '', priority: 'medium' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.category || !form.description.trim()) {
      setError('Title, category and description are required.');
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('priority', form.priority);
      if (image) formData.append('image', image);
      await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast({ type: 'success', message: 'Complaint submitted successfully!' });
      setForm({ title: '', category: '', description: '', priority: 'medium' });
      setImage(null);
      setImagePreview(null);
      setTimeout(() => navigate('/complaints'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
        <div className="p-6 border-b border-indigo-500/30 relative z-10 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm animate-float">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Smart Campus</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {MENU.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right group ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/50 scale-105'
                    : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105 hover:shadow-md'
                }`}>
                <span className="group-hover:scale-110 transition-transform duration-300"><SidebarIcon name={item.name} /></span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-indigo-500/30 relative z-10">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-300 z-20">
          <svg className={`w-4 h-4 transform transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center animate-slide-up sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Raise Complaint</h1>
            <p className="text-sm text-gray-600">Submit a new complaint</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.rollNumber || 'Student'}</p>
              <p className="text-xs text-indigo-600 font-medium">{user?.department || ''}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">New Complaint</h2>
              </div>

              {error && (
                <div className="mb-5">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief title of your complaint"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors bg-white">
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map(p => (
                      <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                          form.priority === p
                            ? p === 'high' ? 'bg-red-500 text-white shadow-md'
                              : p === 'medium' ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your complaint in detail..." rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Attach Image (optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-xl p-1" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Click to upload image</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => navigate('/complaints')}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateComplaint;
