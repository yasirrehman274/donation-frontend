import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading data...</p>
    </div>
  );
}
