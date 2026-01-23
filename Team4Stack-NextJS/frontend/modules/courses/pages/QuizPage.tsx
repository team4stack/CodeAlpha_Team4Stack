'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

const QuizPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  
  const videoId = searchParams.get('videoId') ? parseInt(searchParams.get('videoId')!) : null
  const courseId = searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : null
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // question_id -> selected_option_id
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizAttempt | null>(null)

  useEffect(() => {
    if (!videoId || !user?.id) {
      router.push('/student')
      return
    }
    
    // Check if user has already passed this quiz
    const checkPassed = async () => {
      try {
        const result = await coursesApi.hasUserPassedQuiz(videoId, user.id)
        if (result.success && result.data?.passed) {
          // Already passed - redirect to course view
          if (courseId) {
            router.push(`/student/courses/view/${courseId}?video=${videoId}`)
          } else {
            router.push('/student')
          }
          return
        }
      } catch (err) {
        console.error('Error checking quiz pass status:', err)
      }
      
      // Not passed or error - load quiz
      loadQuiz()
    }
    
    checkPassed()
  }, [videoId, user?.id, courseId, router])

  const handleAutoSubmit = useCallback(async () => {
    if (submitted || !attemptId || !quiz || !user?.id) return
    
    try {
      setLoading(true)
      setSubmitted(true)

      // Convert answers to array format
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: optionId
      }))

      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)

      setResult(result.data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz')
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }, [submitted, attemptId, quiz, user?.id, answers])

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
        // Validate quiz has questions
        if (!quizData.questions || quizData.questions.length === 0) {
          toast.error('Quiz has no questions. Please contact admin.')
          router.back()
          return
        }
        setQuiz(quizData)
      } else {
        toast.error('Quiz not found')
        router.back()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load quiz')
      router.back()
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

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!quiz || !attemptId || !user?.id) return

    // Check if all questions answered
    const totalQuestions = quiz.questions?.length || 0
    const answeredQuestions = Object.keys(answers).length
    
    if (!autoSubmit && answeredQuestions < totalQuestions) {
      if (!confirm(`You have answered ${answeredQuestions} out of ${totalQuestions} questions. Submit anyway?`)) {
        return
      }
    }

    try {
      setLoading(true)
      setSubmitted(true)

      // Convert answers to array format
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: optionId
      }))

      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)

      setResult(result.data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quiz')
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }, [quiz, attemptId, user?.id, answers])

  const handleRetry = () => {
    // User needs to watch video again, then retake quiz
    if (courseId && videoId) {
      router.push(`/student/courses/view/${courseId}?video=${videoId}`)
    } else {
      router.push('/student')
    }
  }

  const handleNextLecture = async () => {
    // After passing quiz, navigate to course view
    // The next lecture will be automatically unlocked
    if (courseId) {
      router.push(`/student/courses/view/${courseId}`)
    } else {
      router.push('/student')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  // Instructions Screen
  if (showInstructions) {
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
              onClick={handleStartQuiz}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              Start Quiz
            </button>
            <button
              onClick={() => router.back()}
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
  if (result) {
    const passed = result.passed
    const percentage = result.percentage

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
          <div className="text-center mb-6">
            <div className={`text-6xl mb-4 ${passed ? '🎉' : '😔'}`}></div>
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
                onClick={handleNextLecture}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Next Lecture
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Watch Video Again & Retry
              </button>
            )}
            <button
              onClick={() => router.push('/student')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Screen
  const currentQuestionIndex = 0 // For now, show all questions at once
  const totalQuestions = quiz.questions?.length || 0
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
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

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions?.map((question, idx) => {
            const selectedOptionId = answers[question.id]
            
            return (
              <div key={question.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {question.question_text}
                    </h3>
                    <div className="space-y-2">
                      {question.options?.map((option) => {
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
                              name={`question-${question.id}`}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(question.id, option.id)}
                              disabled={submitted}
                              className="w-5 h-5 text-purple-600"
                            />
                            <span className={`flex-1 ${isSelected ? 'text-purple-900 dark:text-purple-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {option.option_text}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitted || loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {submitted ? 'Submitting...' : `Submit Quiz (${answeredCount}/${totalQuestions})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizPage
