import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const StudentCorner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postingNew, setPostingNew] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  // Tab: 'active' | 'archived'
  const [activeTab, setActiveTab] = useState('active');

  const DAILY_POST_LIMIT = 5;
  const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

  // Count posts created today by this student
  const todayPostCount = posts.filter(p => {
    const isToday = new Date(p.createdAt).toDateString() === new Date().toDateString();
    const isMine = p.studentRollNumber === user?.rollNumber;
    return isToday && isMine;
  }).length;

  const dailyLimitReached = todayPostCount >= DAILY_POST_LIMIT;

  // Split posts into active (< 6 months) and archived (6–12 months)
  const now = Date.now();
  const activePosts = posts.filter(p => now - new Date(p.createdAt).getTime() < SIX_MONTHS_MS);
  const archivedPosts = posts.filter(p => {
    const age = now - new Date(p.createdAt).getTime();
    return age >= SIX_MONTHS_MS;
  });
  const displayedPosts = activeTab === 'active' ? activePosts : archivedPosts;

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const response = await postService.getFeed(pageNum, 10);
      
      if (response.success) {
        const newPosts = response.data.posts;
        
        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }

        const { currentPage, totalPages } = response.data.pagination;
        setHasMore(currentPage < totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1, isLikedByMe: !p.isLikedByMe }
        : p
    ));

    try {
      const response = await postService.toggleLike(postId);
      if (response.success) {
        // Sync with server truth
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, likesCount: response.data.likesCount, isLikedByMe: response.data.isLiked }
            : p
        ));
      }
    } catch (err) {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1, isLikedByMe: !p.isLikedByMe }
          : p
      ));
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    // Optimistic update
    const tempComment = {
      id: `temp_${Date.now()}`,
      studentName: user?.name || 'You',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, commentsCount: p.commentsCount + 1, comments: [...p.comments, tempComment] }
        : p
    ));
    setCommentText(prev => ({ ...prev, [postId]: '' }));

    try {
      const response = await postService.addComment(postId, text);
      if (response.success) {
        // Replace temp comment with real one from server
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? {
                ...p,
                commentsCount: response.data.commentsCount,
                comments: p.comments.map(c => c.id === tempComment.id ? response.data.comment : c)
              }
            : p
        ));
      }
    } catch (err) {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount - 1, comments: p.comments.filter(c => c.id !== tempComment.id) }
          : p
      ));
      setCommentText(prev => ({ ...prev, [postId]: text }));
      console.error('Comment error:', err);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || postingNew) return;

    if (dailyLimitReached) {
      setError('You can only post 5 times per day');
      return;
    }

    try {
      setPostingNew(true);
      
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('contentText', newPost);
        formData.append('attachment', selectedFile);
        
        response = await postService.createPostWithAttachment(formData);
      } else {
        response = await postService.createPost({ contentText: newPost });
      }
      
      if (response.success) {
        setNewPost('');
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        setSuccessMessage('Post created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchPosts(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setPostingNew(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      let type = null;
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type === 'application/pdf') {
        type = 'pdf';
      } else {
        setError('Please select an image or PDF file');
        return;
      }
      
      setSelectedFile(file);
      setFileType(type);
      
      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(file.name);
      }
      
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-slide-up">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-all duration-300 hover:gap-3 gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          {/* Modern Header Card */}
          <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-20 w-40 h-40 bg-purple-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span>📚</span> Student Corner
              </h1>
              <p className="text-indigo-100 text-lg">Share knowledge, opportunities, and connect with peers</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 animate-bounce-in shadow-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-semibold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Create Post Card - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-xl transition-all duration-300 animate-scale-in border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user?.name || 'Student'}</p>
              <p className="text-sm text-gray-500">Share your thoughts...</p>
            </div>
          </div>
          
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What do you want to share? (Study materials, job opportunities, internships, career guidance...)"
              className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-4 resize-none transition-all duration-200 text-gray-700"
              rows="4"
              disabled={postingNew}
            />
            
            {/* File Preview */}
            {filePreview && (
              <div className="mt-4 relative animate-slide-up">
                {fileType === 'image' ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-64 w-full rounded-xl object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : fileType === 'pdf' ? (
                  <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{filePreview}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              {/* Attachment Options */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all duration-300 rounded-lg group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={postingNew}
                  />
                </label>
                
                <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all duration-300 rounded-lg group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Document</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={postingNew}
                  />
                </label>
              </div>
              
              {/* Post Button */}
              <button
                type="submit"
                disabled={!newPost.trim() || postingNew || dailyLimitReached}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
              >
                {postingNew ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Daily limit warning */}
        {dailyLimitReached && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-yellow-800 font-medium">You can only post 5 times per day. Try again tomorrow.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-1.5 mb-6 flex gap-1 border border-gray-100">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active Posts
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {activePosts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'archived'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Archived
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'archived' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {archivedPosts.length}
            </span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 animate-shake shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-700 font-medium text-sm">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed - LinkedIn Style */}
        {displayedPosts.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-bounce-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-500 mb-6">Be the first to share something with your peers!</p>
            <button
              onClick={() => document.querySelector('textarea').focus()}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPosts.map((post, index) => (
              <div
                key={post.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-scale-in"
              >
                {/* Post Header */}
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {post.studentName?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{post.studentName || 'Student'}</h3>
                        <p className="text-sm text-gray-500">{post.studentRollNumber || 'Roll Number'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === 'archived' && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Archived</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.contentText}</p>
                </div>
                
                {/* Post Attachment */}
                {post.attachmentPath && (
                  <div className="mb-4">
                    {post.attachmentPath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={post.attachmentPath.startsWith('http') ? post.attachmentPath : `${BACKEND_URL}${post.attachmentPath}`}
                        alt="Post attachment"
                        className="w-full rounded-xl object-cover max-h-96 shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(post.attachmentPath.startsWith('http') ? post.attachmentPath : `${BACKEND_URL}${post.attachmentPath}`, '_blank')}
                      />
                    ) : (post.attachmentPath.match(/\.pdf$/i) || post.attachmentPath.startsWith('http')) ? (
                      <a
                        href={post.attachmentPath.startsWith('http') ? post.attachmentPath : `${BACKEND_URL}${post.attachmentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4 hover:bg-red-100 hover:scale-[1.02] transition-all duration-300"
                      >
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">PDF Document</p>
                          <p className="text-sm text-gray-500">Click to view</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        post.isLikedByMe 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg className={`w-6 h-6 ${post.isLikedByMe ? 'fill-current' : ''}`} fill={post.isLikedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-semibold">{post.likesCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-semibold">{post.commentsCount || 0}</span>
                    </button>
                  </div>
                  
                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-up">
                      {/* Comment Input */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                          {user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleComment(post.id);
                              }
                            }}
                            placeholder="Write a comment..."
                            className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-2 transition-all duration-200"
                          />
                        </div>
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {comment.studentName?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 text-sm">{comment.studentName}</p>
                                  <span className="text-xs text-gray-400">
                                    {new Date(comment.timestamp).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full bg-white rounded-2xl shadow-lg p-4 text-indigo-600 font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 border border-gray-100"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Load More Posts'
                )}
              </button>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">You've reached the end! 🎉</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCorner;
