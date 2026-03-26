import React from 'react';
import type { Quiz } from '../types';

interface QuizInstructionsProps {
  quiz: Quiz;
  loading: boolean;
  isDarkMode: boolean;
  onStart: () => void;
  onCancel: () => void;
}

const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  quiz,
  loading,
  isDarkMode,
  onStart,
  onCancel
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Quiz Details:</h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>• Total Questions: {quiz.questions?.length || 0}</li>
              <li>• Total Marks: {quiz.total_marks}</li>
              <li>• Passing Percentage: {quiz.passing_percentage}%</li>
              <li>• Time Limit: {quiz.time_limit_minutes} minutes</li>
              <li>• You need {Math.ceil((quiz.passing_percentage / 100) * quiz.total_marks)} correct answers to pass</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Instructions:</h3>
            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
              <li>• Read each question carefully</li>
              <li>• Select the correct answer for each question</li>
              <li>• You can change your answers before submitting</li>
              <li>• Timer will start when you click "Start Quiz"</li>
              <li>• Quiz will auto-submit when time expires</li>
              <li>• You must score {quiz.passing_percentage}% or higher to pass</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onStart}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            Start Quiz
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;
