
import React from 'react';

interface CardProps {
  title: string;
  step: number;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, step, children }) => {
  return (
    <div className="bg-brand-surface border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-700 bg-gray-800/50">
        <h2 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-brand-bg font-bold mr-4 text-sm">{step}</span>
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
