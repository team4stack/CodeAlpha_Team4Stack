import React from 'react';
import type { Quiz, QuizAttempt } from '../types';

interface QuizResultViewProps {
  quiz: Quiz;
  result: QuizAttempt;
  isDarkMode: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

const QuizResultView: React.FC<QuizResultViewProps> = ({
  quiz,
  result,
  isDarkMode,
  onContinue,
  onRetry,
  onBackToDashboard
}) => {
  const passed = result.passed;
  const percentage = result.percentage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{passed ? '🎉' : '😔'}</div>
          <h1 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {passed ? 'Congratulations! You Passed!' : 'Quiz Failed'}
          </h1>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {percentage.toFixed(1)}%
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Score: {result.score} / {result.total_marks}
          </p>
          {result.time_taken_seconds && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Time taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
            </p>
          )}
        </div>

        {passed ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-300 text-center">
              🎊 Great job! You've successfully completed this quiz. You can now proceed to the next lecture.
            </p>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 text-center mb-4">
              You need {quiz.passing_percentage}% to pass. You scored {percentage.toFixed(1)}%.
            </p>
            <p className="text-red-700 dark:text-red-400 text-center text-sm">
              Please watch the video again and retake the quiz.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          {passed ? (
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Continue to Next Lecture
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              Watch Video Again & Retry
            </button>
          )}
          <button
            onClick={onBackToDashboard}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultView;
