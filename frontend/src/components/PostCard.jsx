import React, { useState } from 'react';
import '../styles/StudentCorner.css';

const PostCard = ({ post, onLike, onComment, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Comment submit error:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.studentName.charAt(0).toUpperCase()}
          </div>
          <div className="author-info">
            <h4 className="author-name">{post.studentName}</h4>
            <p className="author-meta">
              {post.studentRollNumber} • {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{post.contentText}</p>
        {post.attachmentPath && (
          <div className="post-attachment">
            <img 
              src={`http://localhost:3001${post.attachmentPath}`} 
              alt="Post attachment" 
              className="post-image"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn like-btn ${post.isLikedByMe ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <span className="action-icon">{post.isLikedByMe ? '❤️' : '🤍'}</span>
          <span className="action-text">{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button 
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">{post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="comments-list">
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.studentName}</span>
                      <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              maxLength={500}
              disabled={isSubmittingComment}
            />
            <button 
              type="submit" 
              className="comment-submit-btn"
              disabled={!commentText.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
