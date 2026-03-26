import React from 'react';
import type { Quiz } from '../types';

interface QuizQuestionsViewProps {
  quiz: Quiz;
  answers: Record<string, string>;
  submitted: boolean;
  loading: boolean;
  timeRemaining: number;
  onSelectAnswer: (questionId: number | string, optionId: number | string) => void;
  onSubmit: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const QuizQuestionsView: React.FC<QuizQuestionsViewProps> = ({
  quiz,
  answers,
  submitted,
  loading,
  timeRemaining,
  onSelectAnswer,
  onSubmit
}) => {
  const totalQuestions = quiz.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {answeredCount} of {totalQuestions} answered
              </p>
            </div>
            <div className={`text-center px-6 py-3 rounded-lg ${timeRemaining < 60 ? 'bg-red-500' : timeRemaining < 300 ? 'bg-yellow-500' : 'bg-green-500'} text-white font-bold text-xl`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {quiz.questions?.map((question, idx) => {
            const selectedOptionId = answers[String(question.id)];

            return (
              <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {question.question_text}
                    </h3>
                    <div className="space-y-2">
                      {question.options?.map((option) => {
                        const isSelected = selectedOptionId === String(option.id);
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${String(question.id)}`}
                              checked={isSelected}
                              onChange={() => onSelectAnswer(question.id, option.id)}
                              disabled={submitted}
                              className="w-5 h-5 text-purple-600"
                            />
                            <span className={`flex-1 ${isSelected ? 'text-purple-900 dark:text-purple-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {option.option_text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={submitted || loading}
            className="px-8 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {submitted ? 'Submitting...' : `Submit Quiz (${answeredCount}/${totalQuestions})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionsView;
