import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const MyComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/complaints');
      setComplaints(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredComplaints = () => {
    if (filter === 'all') return complaints;
    return complaints.filter(complaint => {
      if (filter === 'pending') return complaint.status === 'Pending';
      if (filter === 'inProgress') return complaint.status === 'In Progress';
      if (filter === 'resolved') return complaint.status === 'Resolved';
      return true;
    });
  };

  const filteredComplaints = getFilteredComplaints();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Loader message="Loading complaints..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          </div>
          <button
            onClick={() => navigate('/complaints/new')}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Raise New Complaint
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({complaints.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('pending')}
          >
            Pending ({complaints.filter(c => c.status === 'Pending').length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === 'inProgress'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('inProgress')}
          >
            In Progress ({complaints.filter(c => c.status === 'In Progress').length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === 'resolved'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({complaints.filter(c => c.status === 'Resolved').length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchComplaints}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Complaints List */}
        {!error && (
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No complaints found</h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all'
                    ? "You haven't raised any complaints yet."
                    : `No ${filter} complaints.`}
                </p>
                <button
                  onClick={() => navigate('/complaints/new')}
                  className="btn-primary"
                >
                  Raise Your First Complaint
                </button>
              </div>
            ) : (
              filteredComplaints.map(complaint => (
                <div
                  key={complaint._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 animate-slide-up"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{complaint.complaintId}</h3>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {complaint.category}
                      </span>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">{complaint.title}</h4>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">{complaint.description}</p>

                  {/* Image */}
                  {complaint.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:3001${complaint.image}`}
                        alt="Complaint"
                        className="w-full max-w-md h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        complaint.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : complaint.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        Priority: {complaint.priority}
                      </span>
                      {complaint.assignedTo && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Assigned to: {complaint.assignedTo.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span>Created: {formatDate(complaint.createdAt)}</span>
                      <span>Updated: {formatDate(complaint.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Admin Remarks */}
                  {complaint.adminRemarks && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                      <p className="text-sm">
                        <strong className="text-blue-900">Admin Remarks:</strong>{' '}
                        <span className="text-blue-800">{complaint.adminRemarks}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
