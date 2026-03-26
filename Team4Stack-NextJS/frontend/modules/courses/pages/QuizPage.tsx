'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import QuizLoadingState from './quiz-page/components/QuizLoadingState'
import QuizInstructions from './quiz-page/components/QuizInstructions'
import QuizResultView from './quiz-page/components/QuizResultView'
import QuizQuestionsView from './quiz-page/components/QuizQuestionsView'
import type { Quiz, QuizAttempt } from './quiz-page/types'

const QuizPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  
  const videoId = searchParams.get('videoId')
    ? Number.parseInt(searchParams.get('videoId')!, 10)
    : null
  const courseId = searchParams.get('courseId')
    ? Number.parseInt(searchParams.get('courseId')!, 10)
    : null
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [attemptId, setAttemptId] = useState<number | string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // question_id -> selected_option_id
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
        const passedResult = result.data as { passed?: boolean } | null
        if (result.success && passedResult?.passed) {
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
        question_id: questionId,
        selected_option_id: optionId
      }))

      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)
      const attempt = result.data as QuizAttempt
      setResult(attempt)
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
        const quizData = result.data as Quiz
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
      const attempt = result.data as { id: number | string }
      
      setAttemptId(attempt.id)
      setQuizStarted(true)
      setShowInstructions(false)
      setTimeRemaining(quiz.time_limit_minutes * 60)
    } catch (err: any) {
      toast.error(err.message || 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number | string, optionId: number | string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [String(questionId)]: String(optionId) }))
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
        question_id: questionId,
        selected_option_id: optionId
      }))

      const result = await coursesApi.submitQuizAttempt(attemptId, answersArray)
      if (result.error) throw new Error(result.error)
      const attempt = result.data as QuizAttempt

      setResult(attempt)
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

  if (loading && !quiz) {
    return <QuizLoadingState />
  }

  if (!quiz) {
    return null
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <QuizInstructions
        quiz={quiz}
        loading={loading}
        isDarkMode={isDarkMode}
        onStart={handleStartQuiz}
        onCancel={() => router.back()}
      />
    )
  }

  // Results Screen
  if (result) {
    return (
      <QuizResultView
        quiz={quiz}
        result={result}
        isDarkMode={isDarkMode}
        onContinue={handleNextLecture}
        onRetry={handleRetry}
        onBackToDashboard={() => router.push('/student')}
      />
    )
  }

  return (
    <QuizQuestionsView
      quiz={quiz}
      answers={answers}
      submitted={submitted}
      loading={loading}
      timeRemaining={timeRemaining}
      onSelectAnswer={handleAnswerSelect}
      onSubmit={() => handleSubmit(false)}
    />
  )
}

export default QuizPage
