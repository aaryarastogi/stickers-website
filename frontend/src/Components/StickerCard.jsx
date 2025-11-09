// src/components/StickerCard.jsx
import React from 'react';

const StickerCard = ({ imageSrc, title, subtitle, buttonVisible, onClick }) => {
  return (
    <div className='flex flex-col'>
    <div
        className="relative flex flex-col items-center transition-transform duration-300 rounded-2xl overflow-hidden shadow-lg w-72 cursor-pointer"
        onClick={onClick}
        >
        <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 cursor-pointer hover:scale-105"
        />
    </div>
    <p className="text-gray-800 text-base font-medium pt-4 ">
        {title}
    </p>
    </div>
  );
};

export default StickerCard;