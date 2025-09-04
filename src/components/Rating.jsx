'use client'

import React, { useState } from "react";

const Rating = ({ value = 0, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= (hover || value) ? "gold" : "gray"}
          viewBox="0 0 24 24"
          stroke="black"
          className="w-6 h-6 cursor-pointer"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M11.48 3.5l2.26 4.58 5.05.73-3.65 3.56.86 5.02-4.52-2.37-4.52 2.37.86-5.02-3.65-3.56 5.05-.73L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
};

export default Rating;