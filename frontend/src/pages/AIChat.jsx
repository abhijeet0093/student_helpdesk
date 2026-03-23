import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';

const MENU = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Raise Complaint', path: '/complaints/new' },
  { name: 'My Complaints', path: '/complaints' },
  { name: 'UT Results', path: '/results' },
  { name: 'Student Corner', path: '/corner' },
  { name: 'AI Assistant', path: '/ai-chat' },
];

const AIChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { loadChatHistory(); }, []);

  const loadChatHistory = async () => {
    try {
      const response = await aiService.getChatHistory(50);
      if (response.success && response.data.messages) {
        setMessages(response.data.messages.map(msg => ({ sender: msg.sender, text: msg.message, timestamp: msg.timestamp })));
      }
    } catch (err) { /* start fresh */ }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || inputMessage.trim().length < 3) { setError('Message must be at least 3 characters'); return; }
    if (inputMessage.trim().length > 1000) { setError('Message is too long (max 1000 characters)'); return; }
    const userMessage = inputMessage.trim();
    setInputMessage(''); setError('');
    setMessages(prev => [...prev, { sender: 'student', text: userMessage, timestamp: new Date().toISOString() }]);
    setIsTyping(true);
    try {
      const response = await aiService.sendMessage(userMessage);
      if (response.success && response.data.aiResponse) {
        setMessages(prev => [...prev, { sender: 'ai', text: response.data.aiResponse, timestamp: new Date().toISOString() }]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get response. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${msg}`, timestamp: new Date().toISOString() }]);
    } finally { setIsTyping(false); }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try { await aiService.clearHistory(); setMessages([]); setError(''); } catch { setError('Failed to clear history'); }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
        <div className="p-6 border-b border-indigo-500/30 relative z-10">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right group ${isActive ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105'}`}>
                <span className="group-hover:scale-110 transition-transform duration-300 text-lg">{item.name === 'Dashboard' ? '🏠' : item.name === 'Raise Complaint' ? '➕' : item.name === 'My Complaints' ? '📋' : item.name === 'UT Results' ? '📊' : item.name === 'Student Corner' ? '💬' : '🤖'}</span>
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
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">AI Assistant</h1>
            <p className="text-sm text-gray-600">Your smart study companion</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleClearHistory}
              className="px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 text-sm">
              Clear History
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {user?.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.rollNumber || 'Student'}</p>
                <p className="text-xs text-indigo-600 font-medium">{user?.department || ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col animate-scale-in">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h2 className="font-semibold">AI Study Assistant</h2>
                <p className="text-sm text-indigo-100">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && !isTyping && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">🤖</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Hello, {user?.fullName || 'Student'}!</h2>
                    <p className="text-gray-600 mb-4 text-sm">Ask me anything about:</p>
                    <div className="bg-white rounded-xl p-4 shadow-md text-left space-y-2 text-sm">
                      {['Study tips and techniques','Exam preparation strategies','Subject explanations','Time management','Academic guidance'].map(tip => (
                        <div key={tip} className="flex items-center text-gray-700"><span className="text-indigo-500 mr-2">•</span>{tip}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${msg.sender === 'student' ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'student' ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4 bg-white">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl mb-3 text-sm text-red-700">{error}</div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                  placeholder="Type your message..." disabled={isTyping} maxLength={1000}
                  className="flex-1 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200 outline-none text-sm" />
                <button type="submit" disabled={isTyping || !inputMessage.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-3 rounded-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
