import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';

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
  const [fileType, setFileType] = useState(null); // 'image', 'pdf', or null

  // Show success message if redirected from create post
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 3000);
      // Clear the state
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

        // Check if there are more posts
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
    try {
      const response = await postService.toggleLike(postId);
      
      if (response.success) {
        // Update post in state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: response.data.likesCount,
                  isLikedByMe: response.data.isLiked
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const response = await postService.addComment(postId, commentText);
      
      if (response.success) {
        // Update post in state
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  commentsCount: response.data.commentsCount,
                  comments: [...post.comments, response.data.comment]
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Comment error:', err);
      throw err;
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

    try {
      setPostingNew(true);
      
      let response;
      if (selectedFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('contentText', newPost);
        formData.append('attachment', selectedFile);
        
        response = await postService.createPostWithAttachment(formData);
      } else {
        // Text-only post
        response = await postService.createPost({ contentText: newPost });
      }
      
      if (response.success) {
        setNewPost('');
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        setSuccessMessage('Post created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh posts
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
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      // Determine file type
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
      
      // Create preview for images
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-6 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Student Corner</h1>
          <p className="text-gray-600 mt-2">Share & Learn Together 🎓</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 animate-slide-up">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Create Post Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-xl transition-all duration-300">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with your peers... (text, images, PDFs, or links)"
              className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent p-4 resize-none transition-all duration-200"
              rows="4"
              disabled={postingNew}
            />
            
            {/* File Preview */}
            {filePreview && (
              <div className="mt-4 relative">
                {fileType === 'image' ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-64 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : fileType === 'pdf' ? (
                  <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{filePreview}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              {/* Attachment Options */}
              <div className="flex items-center gap-4">
                {/* Image/PDF Upload Button */}
                <label className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedFile ? 'Change File' : 'Attach File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={postingNew}
                  />
                </label>
                
                {/* Info Text */}
                <span className="text-xs text-gray-500">
                  Images, PDFs (max 10MB)
                </span>
              </div>
              
              {/* Post Button */}
              <button
                type="submit"
                disabled={!newPost.trim() || postingNew}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {postingNew ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => fetchPosts(1)} className="text-red-600 hover:text-red-700 font-medium text-sm">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {posts.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-600">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                    {post.studentId?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{post.studentId?.fullName || 'Student'}</h3>
                    <p className="text-sm text-gray-500">
                      {post.studentId?.department} • Year {post.studentId?.year} • Sem {post.studentId?.semester}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* Post Attachment */}
                {post.attachmentUrl && (
                  <div className="mb-4">
                    {post.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={post.attachmentUrl}
                        alt="Post attachment"
                        className="w-full rounded-xl object-cover max-h-96"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : post.attachmentUrl.match(/\.pdf$/i) ? (
                      <a
                        href={post.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
                      >
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">PDF Document</p>
                          <p className="text-sm text-gray-500">Click to view</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                )}
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 hover:text-indigo-600 transition-colors ${
                        post.isLikedByMe ? 'text-indigo-600' : ''
                      }`}
                    >
                      <svg className="w-5 h-5" fill={post.isLikedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likesCount || 0}</span>
                    </button>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full bg-white rounded-xl shadow-md p-4 text-indigo-600 font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-gray-500 py-4">You've reached the end!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCorner;
