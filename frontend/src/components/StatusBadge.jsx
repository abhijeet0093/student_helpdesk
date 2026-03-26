import React from 'react';

const STATUS_STYLES = {
  'Pending':     { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'In Progress': { dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  'Escalated':   { dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-800 border-orange-300' },
  'Resolved':    { dot: 'bg-green-400',  badge: 'bg-green-100 text-green-800 border-green-300' },
  'Rejected':    { dot: 'bg-red-400',    badge: 'bg-red-100 text-red-800 border-red-300' },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-800 border-gray-300' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
