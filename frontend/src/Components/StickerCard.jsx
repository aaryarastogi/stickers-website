// src/components/StickerCard.jsx
import React, { useState } from 'react';

const StickerCard = ({ imageSrc, title, subtitle, buttonVisible, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className='flex flex-col'>
    <div
        className="relative flex flex-col items-center transition-transform duration-300 rounded-2xl overflow-hidden shadow-lg w-72 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        <img
            src={imageSrc}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105 brightness-90' : 'scale-100'} cursor-pointer`}
        />
        {isHovered && (
            <button
            className="absolute inset-0 flex justify-center items-center bg-black/70 transition-opacity duration-300"
            onClick={onClick}
            >
            <span className="bg-white text-gray-800 font-semibold px-6 py-2 rounded-md shadow-md hover:bg-gray-100">
                See templates
            </span>
            </button>
        )}
    </div>
    <p className="text-gray-800 text-base font-medium pt-4 ">
        {title}
    </p>
    </div>
  );
};

export default StickerCard;