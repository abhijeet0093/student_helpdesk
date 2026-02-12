import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import '../styles/StudentCorner.css';

const CreatePost = () => {
  const navigate = useNavigate();
  
  const [contentText, setContentText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload only image files (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setAttachment(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate content
    if (!contentText.trim()) {
      setError('Please write something to post');
      return;
    }

    if (contentText.trim().length < 10) {
      setError('Post must be at least 10 characters long');
      return;
    }

    if (contentText.length > 2000) {
      setError('Post is too long. Maximum 2000 characters allowed.');
      return;
    }

    setLoading(true);

    try {
      if (attachment) {
        // Create post with attachment
        const formData = new FormData();
        formData.append('contentText', contentText.trim());
        formData.append('attachment', attachment);
        
        await postService.createPostWithAttachment(formData);
      } else {
        // Create text-only post
        await postService.createPost(contentText.trim());
      }

      // Success - redirect to feed
      navigate('/corner', { 
        state: { message: 'Post created successfully!' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <header className="create-post-header">
        <button onClick={() => navigate('/corner')} className="back-btn">
          ← Back
        </button>
        <h1>Create Post</h1>
        <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
      </header>

      <main className="create-post-main">
        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Text Area */}
          <div className="form-group">
            <label htmlFor="contentText">What's on your mind?</label>
            <textarea
              id="contentText"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Share your thoughts, study tips, or ask questions..."
              className="post-textarea"
              rows={8}
              maxLength={2000}
              disabled={loading}
            />
            <div className="char-count">
              {contentText.length} / 2000 characters
            </div>
          </div>

          {/* Attachment Preview */}
          {attachmentPreview && (
            <div className="attachment-preview">
              <img src={attachmentPreview} alt="Preview" />
              <button 
                type="button" 
                onClick={removeAttachment} 
                className="remove-attachment-btn"
                disabled={loading}
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="attachment" className="file-upload-label">
              <span className="upload-icon">📷</span>
              <span>Add Image (Optional)</span>
              <input
                type="file"
                id="attachment"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                disabled={loading}
              />
            </label>
            <p className="file-hint">Supported: JPEG, PNG, GIF (Max 5MB)</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-post-btn"
            disabled={loading || !contentText.trim()}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>

        {/* Guidelines */}
        <div className="post-guidelines">
          <h3>📝 Posting Guidelines</h3>
          <ul>
            <li>Keep content academic and respectful</li>
            <li>Share study tips, notes, or ask questions</li>
            <li>No spam or inappropriate content</li>
            <li>Be helpful and supportive to fellow students</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
