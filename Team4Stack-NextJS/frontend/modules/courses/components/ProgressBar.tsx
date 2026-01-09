import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  if (!total || total === 0) {
    return null;
  }
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      >
        <span className="sr-only">{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;

