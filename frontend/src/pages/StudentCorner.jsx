import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import '../styles/StudentCorner.css';

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

  if (loading) {
    return <Loader message="Loading posts..." />;
  }

  return (
    <div className="student-corner-container">
      {/* Header */}
      <header className="corner-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back
        </button>
        <div className="header-info">
          <h1>Student Corner</h1>
          <p>Share & Learn Together</p>
        </div>
        <div style={{ width: '60px' }}></div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          ✓ {successMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="corner-main">
        {/* Error Message */}
        {error && (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => fetchPosts(1)} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Posts Feed */}
        {!error && (
          <>
            {posts.length === 0 ? (
              <div className="no-posts">
                <div className="no-posts-icon">📝</div>
                <h2>No Posts Yet</h2>
                <p>Be the first to share something!</p>
                <button 
                  onClick={() => navigate('/corner/create')} 
                  className="create-first-post-btn"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <div className="posts-feed">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    currentUserId={user?._id}
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <button 
                    onClick={handleLoadMore} 
                    className="load-more-btn"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Posts'}
                  </button>
                )}

                {!hasMore && posts.length > 0 && (
                  <p className="end-of-feed">You've reached the end!</p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Create Button */}
      <button 
        onClick={() => navigate('/corner/create')} 
        className="floating-create-btn"
        title="Create Post"
      >
        <span className="plus-icon">+</span>
      </button>
    </div>
  );
};

export default StudentCorner;
