import React from "react";

interface CloudProps {
  className?: string;
}

export const Cloud: React.FC<CloudProps> = ({ className = "" }) => (
  <div className={`absolute ${className}`}>
    <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
      <path
        d="M45 25C48.866 25 52 21.866 52 18C52 14.134 48.866 11 45 11C44.4 11 43.834 11.1 43.3 11.282C42.054 7.424 38.336 4.5 34 4.5C28.2 4.5 23.5 9.2 23.5 15C23.5 15.34 23.52 15.674 23.558 16H15C10.582 16 7 19.582 7 24C7 28.418 10.582 32 15 32H45C48.866 32 52 28.866 52 25Z"
        fill="white"
        stroke="#E5E7EB"
        strokeWidth="2"
      />
    </svg>
  </div>
);