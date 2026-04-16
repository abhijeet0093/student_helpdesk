import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';
import Sidebar from '../components/Sidebar';
import parseApiError from '../utils/parseApiError';

const MENU = [
  { name: 'Dashboard',       path: '/dashboard',      icon: <span>🏠</span> },
  { name: 'Raise Complaint', path: '/complaints/new', icon: <span>➕</span> },
  { name: 'My Complaints',   path: '/complaints',     icon: <span>📋</span> },
  { name: 'UT Results',      path: '/results',        icon: <span>📊</span> },
  { name: 'Student Corner',  path: '/corner',         icon: <span>💬</span> },
  { name: 'AI Assistant',    path: '/ai-chat',        icon: <span>🤖</span> },
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
        // Replace entire state with DB truth — avoids duplicates on refresh
        setMessages(response.data.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp
        })));
      }
    } catch (err) { /* start fresh */ }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || inputMessage.trim().length < 3) { setError('Message must be at least 3 characters'); return; }
    if (inputMessage.trim().length > 1000) { setError('Message is too long (max 1000 characters)'); return; }
    const userMessage = inputMessage.trim();
    setInputMessage(''); setError('');
    // Optimistic: add student message with a temp id
    const tempId = `temp_${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, sender: 'student', text: userMessage, timestamp: new Date().toISOString() }]);
    setIsTyping(true);
    try {
      const response = await aiService.sendMessage(userMessage);
      if (response.success && response.data) {
        const { studentMessage: sm, aiResponse: ai } = response.data;
        setMessages(prev => {
          // Replace temp student message with confirmed one, then add AI reply
          const withoutTemp = prev.filter(m => m.id !== tempId);
          return [
            ...withoutTemp,
            { id: sm.id, sender: 'student', text: sm.text, timestamp: sm.timestamp },
            { id: ai.id, sender: 'ai', text: ai.text, timestamp: ai.timestamp }
          ];
        });
      }
    } catch (err) {
      const msg = parseApiError(err, 'Failed to get response. Please try again.');
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
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        menuItems={MENU}
        logoLabel="CampusOne"
        gradientClass="bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900"
        onLogout={() => { logout(); navigate('/login'); }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">AI Assistant</h1>
              <p className="text-sm text-gray-600">Your smart study companion</p>
            </div>
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
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <h2 className="font-semibold">AI Study Assistant</h2>
                  <p className="text-sm text-indigo-100">Always here to help</p>
                </div>
              </div>
              {/* 30-day retention notice */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs text-indigo-100">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Messages stored for 30 days
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
                <div key={msg.id ?? index} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${msg.sender === 'student' ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm">{msg?.text}</p>
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
              {/* Mobile 30-day notice */}
              <p className="sm:hidden text-xs text-gray-400 mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Messages stored for 30 days
              </p>
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
