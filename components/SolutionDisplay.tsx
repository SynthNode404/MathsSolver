import React from 'react';
import { Icon } from './Icon';

interface SolutionDisplayProps {
  solution: string;
  onReset: () => void;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, onReset }) => {
  // Simple markdown-like replacement for bold text.
  const formatSolution = (text: string) => {
    return text
      .split('**')
      .map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part));
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 text-gray-200 animate-fade-in">
      <div className="w-full text-left mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="sparkles" className="w-6 h-6 text-fuchsia-400" />
          <h2 className="text-2xl font-bold text-white">Solution</h2>
        </div>
        <div className="prose prose-invert max-w-none bg-gray-900/50 rounded-lg p-4 h-96 overflow-y-auto border border-gray-700">
           <div className="whitespace-pre-wrap font-mono text-sm">
             {formatSolution(solution)}
            </div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-50"
      >
        Solve Another Problem
      </button>
    </div>
  );
};
