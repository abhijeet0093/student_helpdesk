import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[200px] gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default Loader;
