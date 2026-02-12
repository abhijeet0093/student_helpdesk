import api from './api';

const postService = {
  // Create post (text only)
  createPost: async (contentText) => {
    const response = await api.post('/posts', { contentText });
    return response.data;
  },

  // Create post with attachment
  createPostWithAttachment: async (formData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get feed (all posts)
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Like/Unlike post (toggle)
  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Add comment
  addComment: async (postId, text) => {
    const response = await api.post(`/posts/${postId}/comment`, { text });
    return response.data;
  },

  // Report post
  reportPost: async (postId) => {
    const response = await api.post(`/posts/${postId}/report`);
    return response.data;
  },

  // Delete own post
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
};

export default postService;
