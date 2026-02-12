import React from 'react';

const StatusBadge = ({ status }) => {
  // Define Tailwind classes for different statuses
  const getStatusClasses = () => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
