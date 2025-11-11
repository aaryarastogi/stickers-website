// src/components/StickerCard.jsx
import React, { useState } from 'react';

const StickerCard = ({ imageSrc, title, subtitle, buttonVisible, onClick, gradientClass }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default gradient class if not provided
  const defaultGradient = 'from-purple-400 via-pink-400 to-red-400';
  const gradientClasses = gradientClass || defaultGradient;

  // Placeholder image with customizable gradient
  const placeholderImage = (
    <div className={`w-full h-72 bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
      <div className="text-center text-white">
        <svg 
          className="w-16 h-16 mx-auto mb-2 opacity-90" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
          />
        </svg>
        <p className="text-sm font-semibold drop-shadow-lg">{title}</p>
      </div>
    </div>
  );

  return (
    <div className='flex flex-col'>
      <div
        className="relative flex flex-col items-center transition-transform duration-300 rounded-2xl overflow-hidden shadow-lg w-72 cursor-pointer bg-gray-100"
        onClick={onClick}
      >
        {imageSrc && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            )}
            <img
              src={imageSrc}
              alt={title}
              className={`w-full h-72 object-cover transition-transform duration-300 cursor-pointer hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          </>
        ) : (
          placeholderImage
        )}
      </div>
      <p className="text-gray-800 text-base font-medium pt-4">
        {title}
      </p>
    </div>
  );
};

export default StickerCard;