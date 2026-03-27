'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'

type Quiz = {
  id?: number
  video_id: number
  title: string
  description?: string
  total_marks: number
  passing_percentage: number
  time_limit_minutes: number
  questions?: QuizQuestion[]
}

type QuizQuestion = {
  id?: number
  quiz_id?: number
  question_text: string
  order_index: number
  marks: number
  options?: QuizOption[]
}

type QuizOption = {
  id?: number
  question_id?: number
  option_text: string
  is_correct: boolean
  order_index: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  videoId: number
  videoTitle: string
  variant?: 'modal' | 'page'
}

const QuizManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  variant = 'modal'
}) => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const parseIntegerInput = (value: string, fallback: number) => {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: `Quiz for ${videoTitle}`,
    description: 'Please answer all questions. You need 80% to pass.',
    total_marks: 10,
    passing_percentage: 80,
    time_limit_minutes: 10
  })

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    order_index: 0,
    marks: 1,
    options: [
      { option_text: '', is_correct: false, order_index: 0 },
      { option_text: '', is_correct: false, order_index: 1 },
      { option_text: '', is_correct: false, order_index: 2 },
      { option_text: '', is_correct: false, order_index: 3 }
    ] as Array<{ option_text: string; is_correct: boolean; order_index: number }>
  })

  useEffect(() => {
    if (isOpen && videoId) {
      loadQuiz()
    }
  }, [isOpen, videoId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const result = await coursesApi.getQuizByVideoId(videoId)
      const quizData = result.data as Quiz | null | undefined
      if (result.success && quizData) {
        setQuiz(quizData)
        setQuizForm({
          title: quizData.title || `Quiz for ${videoTitle}`,
          description: quizData.description || 'Please answer all questions. You need 80% to pass.',
          total_marks: quizData.total_marks || 10,
          passing_percentage: quizData.passing_percentage || 80,
          time_limit_minutes: quizData.time_limit_minutes || 10
        })
      } else {
        setQuiz(null)
      }
    } catch (err: any) {
      console.error('Error loading quiz:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdateQuiz = async () => {
    try {
      if (!quizForm.title.trim()) {
        toast.error('Quiz title is required')
        return
      }
      if (quizForm.total_marks < 1) {
        toast.error('Total marks must be at least 1')
        return
      }
      if (quizForm.passing_percentage < 1 || quizForm.passing_percentage > 100) {
        toast.error('Passing percentage must be between 1 and 100')
        return
      }
      if (quizForm.time_limit_minutes < 1 || quizForm.time_limit_minutes > 180) {
        toast.error('Time limit must be between 1 and 180 minutes')
        return
      }

      setLoading(true)
      
      if (quiz?.id) {
        // Update existing quiz
        const result = await coursesApi.updateQuiz(quiz.id, {
          ...quizForm,
          video_id: videoId
        })
        if (result.error) throw new Error(result.error)
        toast.success('Quiz updated successfully!')
      } else {
        // Create new quiz
        const result = await coursesApi.createQuiz({
          ...quizForm,
          video_id: videoId
        })
        if (result.error) throw new Error(result.error)
        toast.success('Quiz created successfully!')
      }
      
      await loadQuiz()
      setShowQuizForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    if (!quiz?.id) {
      toast.error('Please create quiz first')
      return
    }
    
    const nextOrder = (quiz.questions?.length || 0) + 1
    setQuestionForm({
      question_text: '',
      order_index: nextOrder,
      marks: 1,
      options: [
        { option_text: '', is_correct: false, order_index: 0 },
        { option_text: '', is_correct: false, order_index: 1 },
        { option_text: '', is_correct: false, order_index: 2 },
        { option_text: '', is_correct: false, order_index: 3 }
      ]
    })
    setEditingQuestion(null)
    setShowQuestionForm(true)
  }

  const handleEditQuestion = (question: QuizQuestion) => {
    setQuestionForm({
      question_text: question.question_text,
      order_index: question.order_index,
      marks: question.marks,
      options: question.options || [
        { option_text: '', is_correct: false, order_index: 0 },
        { option_text: '', is_correct: false, order_index: 1 },
        { option_text: '', is_correct: false, order_index: 2 },
        { option_text: '', is_correct: false, order_index: 3 }
      ]
    })
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const handleSaveQuestion = async () => {
    try {
      if (!quiz?.id) {
        toast.error('Quiz not found')
        return
      }

      // Validate
      if (!questionForm.question_text.trim()) {
        toast.error('Question text is required')
        return
      }

      const hasOptions = questionForm.options.some(opt => opt.option_text.trim())
      if (!hasOptions) {
        toast.error('At least one option is required')
        return
      }

      const correctOptions = questionForm.options.filter(opt => opt.is_correct && opt.option_text.trim())
      if (correctOptions.length !== 1) {
        toast.error('Exactly one correct option is required')
        return
      }

      setLoading(true)

      let questionId: number

      if (editingQuestion?.id) {
        // Update question
        const result = await coursesApi.updateQuestion(editingQuestion.id, {
          quiz_id: quiz.id,
          question_text: questionForm.question_text,
          order_index: questionForm.order_index,
          marks: questionForm.marks
        })
        if (result.error) throw new Error(result.error)
        questionId = editingQuestion.id

        // Delete old options
        if (editingQuestion.options) {
          for (const option of editingQuestion.options) {
            if (option.id) {
              await coursesApi.deleteOption(option.id)
            }
          }
        }
      } else {
        // Create question
        const result = await coursesApi.createQuestion({
          quiz_id: quiz.id,
          question_text: questionForm.question_text,
          order_index: questionForm.order_index,
          marks: questionForm.marks
        })
        if (result.error) throw new Error(result.error)
        const created = result.data as any
        questionId = created?.id
      }

      // Create options
      for (const option of questionForm.options) {
        if (option.option_text.trim()) {
          await coursesApi.createOption({
            question_id: questionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: option.order_index
          })
        }
      }

      toast.success(editingQuestion ? 'Question updated!' : 'Question added!')
      await loadQuiz()
      setShowQuestionForm(false)
      setEditingQuestion(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      setLoading(true)
      const result = await coursesApi.deleteQuestion(questionId)
      if (result.error) throw new Error(result.error)
      toast.success('Question deleted!')
      await loadQuiz()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async () => {
    if (!quiz?.id) return
    if (!confirm('Are you sure you want to delete this quiz? All questions will be deleted.')) return

    try {
      setLoading(true)
      const result = await coursesApi.deleteQuiz(quiz.id)
      if (result.error) throw new Error(result.error)
      toast.success('Quiz deleted!')
      setQuiz(null)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete quiz')
    } finally {
      setLoading(false)
    }
  }

  const isPage = variant === 'page'
  if (!isOpen && !isPage) return null

  const content = (
    <div
      className={
        isPage
          ? 'w-full flex flex-col'
          : `bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col ${
              isDarkMode ? 'border border-gray-700' : 'border border-gray-200'
            }`
      }
      style={isPage ? undefined : { maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Header */}
      <div
        className={
          isPage
            ? 'mb-6 flex items-start justify-between gap-4 rounded-xl border px-5 py-4 bg-linear-to-r from-purple-600/20 via-indigo-600/10 to-purple-600/20 border-purple-500/30'
            : 'bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between'
        }
      >
        <h2 className={isPage ? `text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}` : 'text-xl font-bold text-white'}>
          Quiz Management - {videoTitle}
        </h2>
        {isPage ? (
          <button
            onClick={onClose}
            className={`px-3 py-1 text-sm font-semibold rounded-lg border transition-colors self-center ${
              isDarkMode
                ? 'border-gray-700 text-gray-200 hover:bg-gray-800'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Back
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-red-300 hover:text-red-200 hover:bg-red-500/30 rounded-full p-1.5 transition-all duration-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className={isPage ? 'flex-1 p-6' : 'flex-1 overflow-y-auto p-6'}>
          {loading && !quiz ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : showQuizForm ? (
            /* Quiz Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description/Instructions
                </label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={quizForm.total_marks}
                    min={1}
                    max={500}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        total_marks: parseIntegerInput(e.target.value, quizForm.total_marks)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Passing % (80%)
                  </label>
                  <input
                    type="number"
                    value={quizForm.passing_percentage}
                    min={1}
                    max={100}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        passing_percentage: parseIntegerInput(e.target.value, quizForm.passing_percentage)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={quizForm.time_limit_minutes}
                    min={1}
                    max={180}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        time_limit_minutes: parseIntegerInput(e.target.value, quizForm.time_limit_minutes)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateOrUpdateQuiz}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {quiz?.id ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button
                  onClick={() => setShowQuizForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : showQuestionForm ? (
            /* Question Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  rows={3}
                  placeholder="Enter question..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={questionForm.order_index}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        order_index: Number.parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        marks: Number.parseInt(e.target.value, 10) || 1
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options (Mark one as correct) *
                </label>
                {questionForm.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options]
                        newOptions[idx].option_text = e.target.value
                        setQuestionForm({ ...questionForm, options: newOptions })
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={option.is_correct}
                        onChange={() => {
                          const newOptions = questionForm.options.map((opt, i) => ({
                            ...opt,
                            is_correct: i === idx
                          }))
                          setQuestionForm({ ...questionForm, options: newOptions })
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Correct</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button
                  onClick={() => {
                    setShowQuestionForm(false)
                    setEditingQuestion(null)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Overview */
            <div className="space-y-4">
              {!quiz ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No quiz created for this video yet.</p>
                  <button
                    onClick={() => setShowQuizForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Marks: {quiz.total_marks}</span>
                      <span className="text-gray-600 dark:text-gray-400">Passing: {quiz.passing_percentage}%</span>
                      <span className="text-gray-600 dark:text-gray-400">Time: {quiz.time_limit_minutes} min</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowQuizForm(true)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Edit Quiz
                      </button>
                      <button
                        onClick={handleDeleteQuiz}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm disabled:opacity-50"
                      >
                        Delete Quiz
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Questions ({quiz.questions?.length || 0}/10)
                    </h3>
                    {(!quiz.questions || quiz.questions.length < 10) && (
                      <button
                        onClick={handleAddQuestion}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        + Add Question
                      </button>
                    )}
                  </div>

                  {quiz.questions && quiz.questions.length > 0 ? (
                    <div className="space-y-3">
                      {quiz.questions.map((question, idx) => (
                        <div key={question.id || idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                Q{idx + 1}: {question.question_text}
                              </p>
                              <div className="mt-2 space-y-1">
                                {question.options?.map((option, optIdx) => (
                                  <div key={option.id || optIdx} className="flex items-center gap-2 text-sm">
                                    <span className={`w-2 h-2 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className={option.is_correct ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                                      {option.option_text}
                                      {option.is_correct && ' ✓'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditQuestion(question)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => question.id && handleDeleteQuestion(question.id)}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No questions added yet.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );

  return isPage ? (
    <div className="w-full px-6 py-4">{content}</div>
  ) : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-4xl w-full">{content}</div>
    </div>
  )
}

export default QuizManagementModal



