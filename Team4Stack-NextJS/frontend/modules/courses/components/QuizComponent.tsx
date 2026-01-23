'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'

type Quiz = {
  id: number
  video_id: number
  title: string
  description?: string
  total_marks: number
  passing_percentage: number
  time_limit_minutes: number
  questions?: QuizQuestion[]
}

type QuizQuestion = {
  id: number
  question_text: string
  order_index: number
  marks: number
  options?: QuizOption[]
}

type QuizOption = {
  id: number
  option_text: string
  is_correct: boolean
  order_index: number
}

type QuizAttempt = {
  id: number
  score: number
  total_marks: number
  percentage: number
  passed: boolean
  time_taken_seconds?: number
}

interface QuizComponentProps {
  videoId: number
  courseId: number
  onQuizComplete: (passed: boolean, attemptCount: number) => void
  onClose: () => void
}

const QuizComponent: React.FC<QuizComponentProps> = ({ videoId, courseId, onQuizComplete, onClose }) => {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(600)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizAttempt | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)

  useEffect(() => {
    if (!videoId || !user?.id) return
    
    loadQuiz()
    loadAttemptCount()
  }, [videoId, user?.id])

  const loadAttemptCount = async () => {
    if (!videoId || !user?.id) return
    
    try {
      const result = await coursesApi.getUserQuizAttempts(videoId, user.id)
      if (result.success && result.data) {
        setAttemptCount(result.data.length)
      }
    } catch (err) {
      console.error('Error loading attempt count:', err)
    }
  }

  const handleAutoSubmit = useCallback(async () => {
    if (submitted || !attemptId || !quiz || !user?.id) return
    
    try {
      setLoading(true)
      setSubmitted(true)

      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: questionId, // Keep as string/number - backend will handle conversion
        selected_option_id: optionId
      }))

      // Submit immediately - don't wait for calculations
      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)

      // Show result immediately
      setResult(result.data)
      
      // Calculate correct answers count in background (non-blocking)
      calculateCorrectAnswers(quiz, answersArray).then(correctCount => {
        setCorrectAnswersCount(correctCount)
      }).catch(err => {
        console.error('Error calculating correct answers:', err)
        // Estimate from score if calculation fails
        const totalQuestions = quiz.questions?.length || 1
        const estimatedCorrect = Math.round((result.data.score / (quiz.total_marks / totalQuestions)))
        setCorrectAnswersCount(estimatedCorrect)
      })
      
      // Call onQuizComplete but don't close - let user see result first
      // onClose will be called when user clicks button on result screen
      onQuizComplete(result.data.passed, attemptCount + 1)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz')
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }, [submitted, attemptId, quiz, user?.id, answers, onQuizComplete, attemptCount])

  const calculateCorrectAnswers = async (quiz: Quiz, answersArray: Array<{ question_id: number; selected_option_id: number }>): Promise<number> => {
    let correctCount = 0
    
    for (const answer of answersArray) {
      const question = quiz.questions?.find(q => q.id === answer.question_id)
      if (question) {
        const option = question.options?.find(opt => opt.id === answer.selected_option_id)
        if (option && option.is_correct) {
          correctCount++
        }
      }
    }
    
    return correctCount
  }

  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizStarted, timeRemaining, submitted, handleAutoSubmit])

  const loadQuiz = async () => {
    if (!videoId) return
    
    try {
      setLoading(true)
      const result = await coursesApi.getQuizByVideoId(videoId)
      if (result.success && result.data) {
        const quizData = result.data
        if (!quizData.questions || quizData.questions.length === 0) {
          toast.error('Quiz has no questions. Please contact admin.')
          onClose()
          return
        }
        // Sort questions by order_index
        quizData.questions.sort((a: QuizQuestion, b: QuizQuestion) => a.order_index - b.order_index)
        setQuiz(quizData)
      } else {
        toast.error('Quiz not found')
        onClose()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load quiz')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    if (!quiz || !user?.id || !videoId) return

    try {
      setLoading(true)
      const result = await coursesApi.startQuizAttempt(quiz.id, user.id, videoId)
      if (result.error) throw new Error(result.error)
      
      setAttemptId(result.data.id)
      setQuizStarted(true)
      setShowInstructions(false)
      setTimeRemaining(quiz.time_limit_minutes * 60)
      setCurrentQuestionIndex(0)
    } catch (err: any) {
      toast.error(err.message || 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleNext = () => {
    if (quiz && currentQuestionIndex < (quiz.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!quiz || !attemptId || !user?.id) return

    const totalQuestions = quiz.questions?.length || 0
    const answeredQuestions = Object.keys(answers).length
    
    if (answeredQuestions < totalQuestions) {
      if (!confirm(`You have answered ${answeredQuestions} out of ${totalQuestions} questions. Submit anyway?`)) {
        return
      }
    }

    try {
      setLoading(true)
      setSubmitted(true)

      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: questionId, // Keep as string/number - backend will handle conversion
        selected_option_id: optionId
      }))

      // Calculate correct answers count
      const correctCount = await calculateCorrectAnswers(quiz, answersArray)
      setCorrectAnswersCount(correctCount)

      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)

      setResult(result.data)
      onQuizComplete(result.data.passed, attemptCount + 1)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz')
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }, [quiz, attemptId, user?.id, answers, onQuizComplete, attemptCount])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg m-4`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</h1>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ✕ Close
            </button>
          </div>
          
          {quiz.description && (
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{quiz.description}</p>
          )}

          <div className="space-y-4 mb-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Quiz Details:</h3>
              <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                <li>• Total Questions: {quiz.questions?.length || 0}</li>
                <li>• Total Marks: {quiz.total_marks}</li>
                <li>• Passing Percentage: {quiz.passing_percentage}%</li>
                <li>• Time Limit: {quiz.time_limit_minutes} minutes</li>
                <li>• You need {Math.ceil((quiz.passing_percentage / 100) * quiz.total_marks)} correct answers to pass</li>
                {attemptCount > 0 && (
                  <li>• Previous Attempts: {attemptCount}</li>
                )}
              </ul>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>Instructions:</h3>
              <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                <li>• Read each question carefully</li>
                <li>• Select the correct answer for each question</li>
                <li>• You can navigate between questions using Next/Previous buttons</li>
                <li>• You can change your answers before submitting</li>
                <li>• Timer will start when you click "Start Quiz"</li>
                <li>• Quiz will auto-submit when time expires</li>
                <li>• You must score {quiz.passing_percentage}% or higher to pass</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              Start Quiz
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (result || (submitted && loading)) {
    // Show loading while calculating result
    if (submitted && loading && !result) {
      return (
        <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg m-4`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Submitting Quiz...
              </h2>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please wait while we calculate your results
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!result) return null;
    const passed = result.passed
    const percentage = result.percentage
    const totalQuestions = quiz.questions?.length || 0
    const requiredCorrect = Math.ceil((quiz.passing_percentage / 100) * totalQuestions)

    return (
      <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-lg m-4`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{passed ? '🎉' : '😔'}</div>
            <h1 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {passed ? 'Congratulations! You Passed!' : 'Quiz Failed'}
            </h1>
            <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {percentage.toFixed(1)}%
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Score: {result.score} / {result.total_marks} marks
            </p>
            <p className={`text-lg font-semibold mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Correct Answers: {correctAnswersCount} / {totalQuestions}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Required: {requiredCorrect} correct answers to pass
            </p>
            {result.time_taken_seconds && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Time taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
              </p>
            )}
          </div>

          {passed ? (
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-center ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                🎊 Great job! You've successfully completed this quiz. Next lecture will unlock automatically.
              </p>
            </div>
          ) : (
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-center mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                You need {quiz.passing_percentage}% ({requiredCorrect} correct answers) to pass. You got {correctAnswersCount} correct.
              </p>
              {attemptCount + 1 === 1 ? (
                <p className={`text-center text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                  You can retake this quiz. Click "Reattempt Quiz" to try again.
                </p>
              ) : attemptCount + 1 === 2 ? (
                <p className={`text-center text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                  This was your second attempt. You need to watch the video again before retaking the quiz.
                </p>
              ) : null}
            </div>
          )}

          <div className="flex gap-4">
            {passed ? (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Next Lecture
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                {attemptCount + 1 === 2 ? 'Watch Video Again' : 'Reattempt Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Quiz Screen - One Question at a Time
  const totalQuestions = quiz.questions?.length || 0
  const currentQuestion = quiz.questions?.[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined

  return (
    <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Header with Timer and Progress */}
        <div className={`rounded-xl shadow-lg p-4 mb-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            <div className={`text-center px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-500' : timeRemaining < 300 ? 'bg-yellow-500' : 'bg-green-500'} text-white font-bold text-lg`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className={`rounded-xl shadow-lg p-6 mb-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentQuestion.question_text}
                </h3>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => {
                    const isSelected = selectedOptionId === option.id
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
                          name={`question-${currentQuestion.id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                          disabled={submitted}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span className={`flex-1 text-base ${isSelected ? 'text-purple-900 dark:text-purple-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {option.option_text}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion || submitted || loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isFirstQuestion || submitted || loading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            ← Previous
          </button>

          <div className="flex-1 text-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {Object.keys(answers).length} of {totalQuestions} answered
            </span>
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitted || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {submitted || loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={submitted || loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizComponent
