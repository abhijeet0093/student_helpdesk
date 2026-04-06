import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Eye icons inline — no extra dependency needed
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    rollNumber: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clear form fields on component mount
  useEffect(() => {
    setFormData({
      rollNumber: '',
      username: '',
      email: '',
      password: '',
    });
    setError('');
  }, []);

  // Clear form fields when user type changes
  useEffect(() => {
    setFormData({
      rollNumber: '',
      username: '',
      email: '',
      password: '',
    });
    setError('');
  }, [userType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let credentials = {};
      
      if (userType === 'student') {
        credentials = {
          rollNumber: formData.rollNumber,
          password: formData.password,
        };
      } else if (userType === 'admin') {
        credentials = {
          username: formData.username,
          password: formData.password,
        };
      } else if (userType === 'staff') {
        credentials = {
          email: formData.email,
          password: formData.password,
        };
      }

      await login(credentials, userType);
      
      // Clear form after successful login
      setFormData({
        rollNumber: '',
        username: '',
        email: '',
        password: '',
      });
      
      // Redirect based on role
      if (userType === 'student') {
        navigate('/dashboard');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      } else if (userType === 'staff') {
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* LEFT SECTION - Illustration & Welcome */}
            <div className="order-2 lg:order-1 text-center lg:text-left animate-fade-in">
              {/* Illustration Container */}
              <div className="mb-8 animate-float">
                <div className="relative inline-block">
                  {/* SVG Illustration - Students Studying */}
                  <svg className="w-full h-auto max-w-lg mx-auto" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Desk */}
                    <rect x="50" y="280" width="400" height="20" rx="10" fill="#6366F1" opacity="0.2"/>
                    
                    {/* Laptop */}
                    <rect x="150" y="220" width="200" height="120" rx="8" fill="#6366F1" opacity="0.3"/>
                    <rect x="160" y="230" width="180" height="90" rx="4" fill="#818CF8"/>
                    <rect x="170" y="240" width="160" height="70" rx="2" fill="#C7D2FE"/>
                    
                    {/* Books */}
                    <rect x="80" y="240" width="50" height="60" rx="4" fill="#8B5CF6" opacity="0.8"/>
                    <rect x="90" y="235" width="50" height="60" rx="4" fill="#A78BFA" opacity="0.9"/>
                    
                    {/* Coffee Cup */}
                    <ellipse cx="400" cy="260" rx="20" ry="15" fill="#F59E0B" opacity="0.8"/>
                    <rect x="380" y="260" width="40" height="30" rx="8" fill="#FBBF24" opacity="0.9"/>
                    
                    {/* Student Character */}
                    <circle cx="250" cy="150" r="40" fill="#6366F1"/>
                    <rect x="220" y="190" width="60" height="80" rx="30" fill="#818CF8"/>
                    
                    {/* Floating Icons */}
                    <g className="animate-float animation-delay-2000">
                      <circle cx="100" cy="100" r="25" fill="#C7D2FE" opacity="0.6"/>
                      <path d="M100 90 L100 110 M90 100 L110 100" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
                    </g>
                    
                    <g className="animate-float animation-delay-4000">
                      <circle cx="400" cy="120" r="25" fill="#DDD6FE" opacity="0.6"/>
                      <path d="M390 120 L400 110 L410 120" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="space-y-4 animate-slide-up">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  Welcome to Smart Campus Helpdesk
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
                  Manage complaints, view results, and stay connected with your campus community.
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-6">
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Quick Resolution</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">AI Assistance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION - Glassmorphism Login Card */}
            <div className="order-1 lg:order-2 animate-scale-in">
              {/* Glass Card */}
              <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10 shine-effect">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-in">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-600">Access your campus account</p>
                </div>

                {/* User Type Tabs */}
                <div className="flex gap-2 mb-6 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl">
                  {['student', 'admin', 'staff'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        userType === type
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:scale-105'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                  {/* Student Input */}
                  {userType === 'student' && (
                    <div className="transform transition-all duration-300">
                      <label htmlFor="rollNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                        Roll Number
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="rollNumber"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleChange}
                          placeholder="Enter your roll number"
                          autoComplete="off"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/80 focus:outline-none transition-all duration-300 hover:border-indigo-300 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin Input */}
                  {userType === 'admin' && (
                    <div className="transform transition-all duration-300">
                      <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter admin username"
                          autoComplete="off"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/80 focus:outline-none transition-all duration-300 hover:border-indigo-300 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Staff Input */}
                  {userType === 'staff' && (
                    <div className="transform transition-all duration-300">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          autoComplete="off"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/80 focus:outline-none transition-all duration-300 hover:border-indigo-300 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="off"
                        required
                        className="w-full pl-12 pr-12 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/80 focus:outline-none transition-all duration-300 hover:border-indigo-300 placeholder-gray-400"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-100/80 backdrop-blur-sm text-red-600 p-4 rounded-xl text-sm animate-shake border border-red-200">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-bold text-lg flex items-center justify-center group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Additional Links */}
                {userType === 'student' && (
                  <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a
                        href="/register"
                        className="font-semibold text-indigo-600 hover:text-purple-600 transition-colors hover:underline"
                      >
                        Register here
                      </a>
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/20 text-center">
                  <p className="text-xs text-gray-500">
                    © 2024 Smart Campus. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
