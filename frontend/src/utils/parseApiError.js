/**
 * Converts axios errors into human-readable messages.
 * Covers network failures, Render cold-starts, CORS, and backend validation errors.
 */
const parseApiError = (err, fallback = 'Something went wrong. Please try again.') => {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // No response — could be: backend not running, CORS block, or real network issue
  if (!err.response) {
    // Explicit timeout
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return isLocalhost
        ? 'Request timed out. Make sure the backend server is running on port 5000.'
        : 'Request timed out. The server may be starting up — please wait a moment and retry.';
    }

    // Network error (ERR_CONNECTION_REFUSED on localhost = backend not started)
    if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
      return isLocalhost
        ? 'Cannot connect to backend. Run "npm start" inside the /backend folder (port 5000).'
        : 'The server is temporarily unavailable. It may be starting up — please retry in a moment.';
    }

    // Fallback for any other no-response error
    return isLocalhost
      ? 'No response from server. Ensure the backend is running on http://localhost:5000'
      : 'Unable to reach the server. Please check your connection and try again.';
  }

  const status = err.response.status;
  const serverMsg = err.response?.data?.message;

  // Prefer the server's own message when it's specific
  if (serverMsg && serverMsg.length > 0 && serverMsg !== 'Internal server error') {
    return serverMsg;
  }

  // Map HTTP status codes to friendly messages
  switch (status) {
    case 400: return 'Invalid request. Please check your input and try again.';
    case 401: return 'Invalid credentials. Please check your details and try again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'A conflict occurred — this record may already exist.';
    case 413: return 'The file you uploaded is too large.';
    case 422: return 'Validation failed. Please review your input.';
    case 429: return 'Too many requests. Please slow down and try again shortly.';
    case 500: return 'A server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504: return 'The server is temporarily unavailable. It may be starting up — please retry in a moment.';
    default:  return fallback;
  }
};

export default parseApiError;
