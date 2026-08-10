import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark via-[#1a2d5e] to-[#162447]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-4xl shadow-lg mb-6">
          <i className="fas fa-map-signs"></i>
        </div>
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="text-2xl font-bold text-white mt-2">Page Not Found</p>
        <p className="text-sm text-white/60 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 transition-all hover:-translate-y-px"
        >
          <i className="fas fa-home"></i> Go to Dashboard
        </button>
      </div>
    </div>
  );
}
