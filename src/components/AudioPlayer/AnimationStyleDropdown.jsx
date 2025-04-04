import React from 'react';

const AnimationStyleDropdown = ({ style, onChange, label = "Style" }) => {
  const id = `animation-style-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label htmlFor={id} className="text-sm text-gray-400">
          {label}
        </label>
      )}
      <div className="relative flex-grow">
        <select
          id={id}
          value={style}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-zinc-800 border border-zinc-700 text-white py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="simple">Simple</option>
          <option value="minimal">Minimal</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AnimationStyleDropdown;