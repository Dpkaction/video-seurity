
import React from 'react';

interface SpinnerProps {
    message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-4 p-4 bg-gray-800/50 rounded-lg">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-brand-text-muted">{message}</p>
    </div>
  );
};

export default Spinner;
