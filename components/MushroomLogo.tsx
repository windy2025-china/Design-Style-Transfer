
import React from 'react';

const MushroomLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center rounded-full bg-red-500 shadow-lg p-2 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white w-full h-full"
      >
        <path d="M12 21v-8M9 21h6" />
        <path d="M18 13a6 6 0 1 0-12 0c0 .3 0 .7.1 1.1C6.4 16.3 8.3 18 10.5 18h3c2.2 0 4.1-1.7 4.4-3.9.1-.4.1-.8.1-1.1z" />
        <circle cx="12" cy="7" r="1" fill="white" />
        <circle cx="9" cy="10" r="1" fill="white" />
        <circle cx="15" cy="10" r="1" fill="white" />
      </svg>
    </div>
  );
};

export default MushroomLogo;
