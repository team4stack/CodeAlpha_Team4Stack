import React from 'react';

interface CourseViewLectureHeaderProps {
  isDarkMode: boolean;
  courseTitle: string;
  lectureTitle: string;
  lecturePosition: string;
  lectureDescription?: string;
  watched: boolean;
  canComplete: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  quizExists: boolean;
  quizPassed: boolean;
  onPrev: () => void;
  onTakeQuiz: () => void;
  onNext: () => void;
  onCompleteAndNext: () => Promise<void> | void;
}

const CourseViewLectureHeader: React.FC<CourseViewLectureHeaderProps> = ({
  isDarkMode,
  courseTitle,
  lectureTitle,
  lecturePosition,
  lectureDescription,
  watched,
  canComplete,
  hasPrev,
  hasNext,
  quizExists,
  quizPassed,
  onPrev,
  onTakeQuiz,
  onNext,
  onCompleteAndNext
}) => {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 mb-4 sm:mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${
      isDarkMode
        ? 'bg-gray-800/70 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="min-w-0">
        <p className={`text-xs uppercase tracking-widest mb-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Course
        </p>
        <h1 className={`text-lg sm:text-xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {courseTitle}
        </h1>
        <p className={`text-sm mt-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Lecture: {lectureTitle}{lecturePosition ? ` - ${lecturePosition}` : ''}
        </p>
        {lectureDescription && (
          <p className={`text-sm mt-2 line-clamp-2 ${
            isDarkMode ? 'text-gray-300/90' : 'text-gray-600'
          }`}>
            {lectureDescription}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 items-end">
        <div className="flex flex-wrap gap-2 justify-end">
          {hasPrev && (
            <button
              onClick={onPrev}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all border ${
                isDarkMode
                  ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
          )}

          {watched ? (
            quizExists && !quizPassed ? (
              <button
                onClick={onTakeQuiz}
                className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Take Quiz
              </button>
            ) : hasNext ? (
              <button
                onClick={onNext}
                className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next Lecture
              </button>
            ) : (
              <span className={`px-3 py-2 text-xs rounded-lg border ${
                isDarkMode
                  ? 'border-emerald-700/50 text-emerald-200/90'
                  : 'border-emerald-300 text-emerald-700'
              }`}>
                All lectures completed
              </span>
            )
          ) : (
            <button
              onClick={onCompleteAndNext}
              disabled={!canComplete}
              className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md ${
                canComplete
                  ? isDarkMode
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              {canComplete ? (hasNext ? 'Complete & Next' : 'Mark Complete') : 'Complete & Next (90%+)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewLectureHeader;
