'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { coursesApi } from '@/lib/api'
import { CONTACT_PHONE_NUMBERS, CONTACT_EMAIL, PAYMENT_INFO, getWhatsAppUrl } from '@/lib/utils/constants'
import { devError } from '@/lib/utils/devUtils'
import { useAuth } from '@/contexts/AuthContext'
import type { AdmissionFormValues } from './admission-form/types'
import { sanitizeInput, validatePaymentScreenshotFile } from './admission-form/inputSanitizationAndFileValidation'
import AdmissionFormAnimatedBackground from './admission-form/AdmissionFormAnimatedBackground'
import AdmissionFormSignInRequiredPopup from './admission-form/AdmissionFormSignInRequiredPopup'
import { useAdmissionFormAnimationStyles } from './admission-form/useAdmissionFormAnimationStyles'
import { buildAdmissionSummaryDocumentHtml, fetchAdmissionSummaryLogoDataUrl } from './admission-form/admissionSummaryDocumentBuilder'

type AdmissionStep = 1 | 2 | 3

interface AdmissionApiRow {
  id: number
  name?: string
  father_name?: string
  phone?: string
  email?: string
  cnic?: string
  address?: string
  course_name?: string
  course_name_2?: string | null
  gender?: string
  date_of_birth?: string
  approved?: boolean | null
  approved_1?: boolean | null
  approved_2?: boolean | null
  image_attached?: boolean
}

interface CourseOption {
  id: number
  title: string
}

const TOTAL_STEPS = 3
const STEP_META: Array<{ step: AdmissionStep; title: string; subtitle: string }> = [
  { step: 1, title: 'Required', subtitle: 'Basic details' },
  { step: 2, title: 'More Details', subtitle: 'Extra info' },
  { step: 3, title: 'Attach & Submit', subtitle: 'Final step' }
]

const AdmissionForm: React.FC = () => {
  useAdmissionFormAnimationStyles()
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState<AdmissionStep>(1)
  const [draftAdmissionId, setDraftAdmissionId] = useState<number | null>(null)
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingStep, setIsSavingStep] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set())
  const [rejectedCourses, setRejectedCourses] = useState<Set<string>>(new Set())
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const selectedFileName = paymentScreenshot?.name || 'No file selected'

  const draftStorageKey = user?.id ? `admission_draft_id_${user.id}` : null

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    trigger,
    watch
  } = useForm<AdmissionFormValues>({
    defaultValues: {
      name: '',
      fatherName: '',
      phone: '',
      email: '',
      cnic: '',
      address: '',
      courseName: '',
      courseName2: '',
      gender: '',
      dateOfBirth: ''
    }
  })

  const selectedCourse1 = watch('courseName')

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-white/5 border ${
      hasError ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 hover:bg-white/10'
    } text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm`

  const isAuthenticated = Boolean(user?.email)

  const normalizeCourseTitle = (value: string) => value.trim().toLowerCase()

  const getFilteredCourses = (excludeCourse?: string): CourseOption[] => {
    return availableCourses.filter((course) => {
      const courseTitle = normalizeCourseTitle(course.title)
      const excludeTitle = excludeCourse ? normalizeCourseTitle(excludeCourse) : null

      for (const enrolled of enrolledCourses) {
        if (normalizeCourseTitle(enrolled) === courseTitle) return false
      }

      for (const rejected of rejectedCourses) {
        if (normalizeCourseTitle(rejected) === courseTitle) return false
      }

      if (excludeTitle && excludeTitle === courseTitle) return false
      return true
    })
  }

  const requiredCourses = useMemo(() => getFilteredCourses(), [availableCourses, enrolledCourses, rejectedCourses])
  const optionalCourses = useMemo(() => getFilteredCourses(selectedCourse1), [availableCourses, enrolledCourses, rejectedCourses, selectedCourse1])

  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email.trim().toLowerCase())
    }
  }, [user?.email, setValue])

  useEffect(() => {
    if (authLoading) {
      setLoadingCourses(true)
      return
    }

    const loadCoursesAndHistory = async () => {
      try {
        setLoadingCourses(true)

        const coursesResult = await coursesApi.getAllCourses()
        if (!coursesResult.error && Array.isArray(coursesResult.data) && coursesResult.data.length > 0) {
          const mapped = coursesResult.data
            .map((course) => {
              const row = course as Record<string, unknown>
              const rawId = row.id
              const id =
                typeof rawId === 'number'
                  ? rawId
                  : typeof rawId === 'string'
                    ? Number.parseInt(rawId, 10)
                    : Number.NaN
              const titleSource =
                typeof row.title === 'string'
                  ? row.title
                  : typeof row.name === 'string'
                    ? row.name
                    : ''
              const title = titleSource.trim()
              if (!Number.isFinite(id) || !title) return null
              return { id, title }
            })
            .filter((item): item is CourseOption => Boolean(item))
          setAvailableCourses(mapped)
        } else {
          setAvailableCourses([
            { id: 1, title: 'Physical Training (WE Connect)' },
            { id: 2, title: 'Online Training' }
          ])
        }

        if (!user?.email) return

        const formsResult = await coursesApi.getAdmissionForms({
          email: user.email.toLowerCase().trim()
        })

        const applicationData = Array.isArray(formsResult.data) ? (formsResult.data as AdmissionApiRow[]) : []
        if (!applicationData.length) return

        const enrolled = new Set<string>()
        const rejected = new Set<string>()

        applicationData.forEach((app) => {
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          if (hasNewApprovals) {
            if (app.course_name?.trim()) {
              if (app.approved_1 === true) enrolled.add(app.course_name.trim())
              if (app.approved_1 === false) rejected.add(app.course_name.trim())
            }
            if (app.course_name_2?.trim()) {
              if (app.approved_2 === true) enrolled.add(app.course_name_2.trim())
              if (app.approved_2 === false) rejected.add(app.course_name_2.trim())
            }
            return
          }

          if (app.course_name?.trim()) {
            if (app.approved === true) enrolled.add(app.course_name.trim())
            if (app.approved === false) rejected.add(app.course_name.trim())
          }
        })

        setEnrolledCourses(enrolled)
        setRejectedCourses(rejected)
      } catch (error) {
        devError('Failed to load courses/admission history', error)
      } finally {
        setLoadingCourses(false)
      }
    }

    void loadCoursesAndHistory()
  }, [authLoading, user?.email])

  useEffect(() => {
    if (!isAuthenticated || !draftStorageKey) return
    const authEmail = user?.email?.toLowerCase().trim()
    if (!authEmail) return

    const loadExistingDraft = async () => {
      try {
        const rawId = localStorage.getItem(draftStorageKey)
        if (!rawId) return

        const parsedId = Number.parseInt(rawId, 10)
        if (!Number.isFinite(parsedId)) {
          localStorage.removeItem(draftStorageKey)
          return
        }

        const formsResult = await coursesApi.getAdmissionForms({ email: authEmail })
        const list = Array.isArray(formsResult.data) ? (formsResult.data as AdmissionApiRow[]) : []
        const draft = list.find((item) => item.id === parsedId)
        if (!draft) {
          localStorage.removeItem(draftStorageKey)
          return
        }

        if (draft.image_attached === true) {
          localStorage.removeItem(draftStorageKey)
          return
        }

        setDraftAdmissionId(draft.id)
        setValue('name', draft.name || '')
        setValue('fatherName', draft.father_name || '')
        setValue('phone', draft.phone || '')
        setValue('email', draft.email || authEmail)
        setValue('cnic', draft.cnic || '')
        setValue('address', draft.address || '')
        setValue('courseName', draft.course_name || '')
        setValue('courseName2', draft.course_name_2 || '')
        setValue('gender', (draft.gender || '').toLowerCase())
        setValue('dateOfBirth', draft.date_of_birth || '')

        const hasStepTwoData = Boolean((draft.address || '').trim() || (draft.course_name_2 || '').trim())
        setCurrentStep(hasStepTwoData ? 3 : 2)
      } catch (error) {
        devError('Failed to restore admission draft', error)
      }
    }

    void loadExistingDraft()
  }, [draftStorageKey, isAuthenticated, setValue, user?.email])

  const showSignInPopup = () => {
    setShowSignInPrompt(true)
    setTimeout(() => setShowSignInPrompt(false), 2500)
  }

  const validateDateOfBirthAge = (value: string): boolean => {
    const birthDate = new Date(value)
    const today = new Date()
    if (Number.isNaN(birthDate.getTime()) || birthDate > today) return false

    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age
    return actualAge >= 13 && actualAge <= 100
  }

  const validateStepOne = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      showSignInPopup()
      return false
    }

    const baseValid = await trigger(['name', 'fatherName', 'phone', 'email', 'cnic', 'gender', 'dateOfBirth', 'courseName'])
    if (!baseValid) return false

    const values = getValues()
    if (!validateDateOfBirthAge(values.dateOfBirth)) {
      setError('dateOfBirth', { type: 'manual', message: 'Age must be between 13 and 100 years' })
      return false
    }

    const courseValid = requiredCourses.some((course) => course.title.trim() === values.courseName.trim())
    if (!courseValid) {
      setError('courseName', { type: 'manual', message: 'Please select a valid course' })
      return false
    }

    return true
  }

  const validateStepTwo = async (): Promise<boolean> => {
    const values = getValues()
    if (values.courseName2?.trim()) {
      if (values.courseName2.trim() === values.courseName.trim()) {
        setError('courseName2', { type: 'manual', message: 'Second course must be different from first course' })
        return false
      }

      const optionalValid = optionalCourses.some((course) => course.title.trim() === values.courseName2.trim())
      if (!optionalValid) {
        setError('courseName2', { type: 'manual', message: 'Please select a valid second course' })
        return false
      }
    }

    clearErrors('courseName2')
    return true
  }

  const validateStepThree = (): boolean => {
    if (!acceptedTerms) return false

    const fileValidation = validatePaymentScreenshotFile(paymentScreenshot)
    if (!fileValidation.isValid) {
      setFileError(fileValidation.error || 'Payment screenshot is required')
      return false
    }

    setFileError(null)
    return true
  }

  const buildAdmissionPayload = (isFinalSubmit: boolean, screenshotUrl?: string) => {
    const data = getValues()
    const fallbackEmail = sanitizeInput(data.email).toLowerCase().trim()
    const authEmail = user?.email ? user.email.toLowerCase().trim() : fallbackEmail
    const gender =
      data.gender === 'male'
        ? 'Male'
        : data.gender === 'female'
          ? 'Female'
          : 'Other'

    return {
      name: sanitizeInput(data.name),
      father_name: sanitizeInput(data.fatherName),
      phone: sanitizeInput(data.phone),
      email: authEmail,
      cnic: sanitizeInput(data.cnic),
      address: sanitizeInput(data.address),
      course_name: sanitizeInput(data.courseName),
      course_name_2: data.courseName2 ? sanitizeInput(data.courseName2) : null,
      gender,
      date_of_birth: data.dateOfBirth,
      image_attached: isFinalSubmit ? Boolean(paymentScreenshot) : false,
      payment_screenshot_url: screenshotUrl || null,
      viewed: false
    }
  }

  const persistDraftToDatabase = async (
    isFinalSubmit: boolean,
    screenshotUrl?: string
  ): Promise<{ success: boolean; id?: number }> => {
    if (!isAuthenticated) {
      showSignInPopup()
      return { success: false }
    }

    const payload = buildAdmissionPayload(isFinalSubmit, screenshotUrl)
    const result = draftAdmissionId
      ? await coursesApi.updateAdmissionForm(draftAdmissionId, payload)
      : await coursesApi.createAdmissionForm(payload)

    if (result.error) {
      devError('Failed to save admission draft', result.error)
      alert(typeof result.error === 'string' ? result.error : 'Failed to save your progress. Please try again.')
      return { success: false }
    }

    const row = result.data as { id?: number } | null
    if (!draftAdmissionId && row?.id) {
      setDraftAdmissionId(row.id)
      if (draftStorageKey) localStorage.setItem(draftStorageKey, String(row.id))
    }

    return { success: true, id: row?.id ?? draftAdmissionId ?? undefined }
  }

  const handleSaveStepAndNext = async () => {
    setIsSavingStep(true)
    try {
      if (currentStep === 1) {
        const valid = await validateStepOne()
        if (!valid) return
        const saved = await persistDraftToDatabase(false)
        if (!saved.success) return
        setCurrentStep(2)
        return
      }

      if (currentStep === 2) {
        const valid = await validateStepTwo()
        if (!valid) return
        const saved = await persistDraftToDatabase(false)
        if (!saved.success) return
        setCurrentStep(3)
      }
    } finally {
      setIsSavingStep(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    const validation = validatePaymentScreenshotFile(file)
    if (!validation.isValid) {
      setFileError(validation.error || 'Invalid file')
      event.target.value = ''
      return
    }
    setPaymentScreenshot(file)
    setFileError(null)
  }

  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }
        reject(new Error('Invalid file data'))
      }
      reader.onerror = () => reject(new Error('Unable to read file'))
      reader.readAsDataURL(file)
    })
  }

  const clearDraftState = () => {
    setDraftAdmissionId(null)
    setCurrentStep(1)
    setAcceptedTerms(false)
    setPaymentScreenshot(null)
    setFileError(null)
    if (draftStorageKey) localStorage.removeItem(draftStorageKey)
  }

  const onFinalSubmit: SubmitHandler<AdmissionFormValues> = async () => {
    if (!isAuthenticated) {
      showSignInPopup()
      return
    }

    const stepOneValid = await validateStepOne()
    const stepTwoValid = await validateStepTwo()
    const stepThreeValid = validateStepThree()
    if (!stepOneValid || !stepTwoValid || !stepThreeValid) return

    setIsSubmitting(true)
    const popup = window.open('', '_blank')
    if (popup) {
      popup.document.write(
        `<!doctype html><html><head><title>Preparing Admission Form</title>
        <style>
          body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
          .card{background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.2);padding:28px 32px;border-radius:16px;box-shadow:0 20px 40px rgba(2,6,23,0.4);text-align:center}
          .spinner{width:46px;height:46px;border:4px solid rgba(148,163,184,0.3);border-top-color:#38bdf8;border-radius:50%;margin:0 auto 16px;animation:spin 1s linear infinite}
          .title{font-size:18px;font-weight:700;margin-bottom:6px}
          .sub{font-size:13px;color:#94a3b8}
          @keyframes spin{to{transform:rotate(360deg)}}
        </style>
        </head><body><div class="card"><div class="spinner"></div><div class="title">Preparing your admission form</div><div class="sub">Please wait a moment...</div></div></body></html>`
      )
      popup.document.close()
    }
    try {
      let uploadedScreenshotUrl = ''
      if (paymentScreenshot) {
        const screenshotDataUrl = await convertFileToDataUrl(paymentScreenshot)
        const uploadResult = await coursesApi.uploadImageToCloudinary(
          screenshotDataUrl,
          'team4stack/admission-screenshots'
        )
        const uploadData = (uploadResult.data as { secure_url?: string } | undefined)
        if (uploadResult.error || !uploadData?.secure_url) {
          alert('Unable to upload payment screenshot. Please try again.')
          return
        }
        uploadedScreenshotUrl = uploadData.secure_url
      }

      const saved = await persistDraftToDatabase(true, uploadedScreenshotUrl)
      if (!saved.success) return
      const applicationNumber = String(saved.id || draftAdmissionId || '')

      const payload = buildAdmissionPayload(true, uploadedScreenshotUrl)
      const lines = [
        `Name: ${payload.name}`,
        `Father Name: ${payload.father_name}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email}`,
        `CNIC / B-Form: ${payload.cnic}`,
        `Address: ${payload.address}`,
        `Gender: ${payload.gender}`,
        `Date of Birth: ${payload.date_of_birth}`,
        `Course: ${payload.course_name}`,
        payload.course_name_2 ? `Second Course: ${payload.course_name_2}` : '',
        uploadedScreenshotUrl ? `Payment Screenshot (Cloud): ${uploadedScreenshotUrl}` : ''
      ].filter(Boolean)

      const phoneNumber = CONTACT_PHONE_NUMBERS.primary
      const timestamp = new Date().toLocaleString()
      const waURL = getWhatsAppUrl(
        phoneNumber,
        `New Course Inquiry\nName: ${payload.name}\nFather Name: ${payload.father_name}\nPhone: ${payload.phone}\nEmail: ${payload.email}\nCourse: ${payload.course_name}\nPlease find the form attached.`
      )

      const logoPath = '/Team4stack_Logo.png?v=8'
      let logoDataUrl = ''
      try {
        logoDataUrl = await fetchAdmissionSummaryLogoDataUrl(logoPath)
      } catch {
        // ignore logo fetch failures
      }

      const summaryHtml = buildAdmissionSummaryDocumentHtml({
        logoDataUrl,
        logoPath,
        lines,
        paymentScreenshotUrl: uploadedScreenshotUrl,
        applicationNumber,
        waURL,
        contactEmail: CONTACT_EMAIL,
        phoneNumber,
        timestamp
      })
      if (popup) {
        popup.document.write(summaryHtml)
        popup.document.close()
      } else {
        // If popup blocked, fallback to opening in same tab.
        const temp = window.open('', '_self')
        if (temp) {
          temp.document.write(summaryHtml)
          temp.document.close()
        }
      }
      window.open(waURL, '_blank')

      reset()
      clearDraftState()
    } catch (error) {
      devError('Final admission submission failed', error)
      alert('Unable to submit the form right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepProgressPercent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18] pt-16 sm:pt-20 md:pt-28 pb-10 px-3 sm:px-4 relative overflow-hidden">
      <AdmissionFormAnimatedBackground />

      <div className="container-custom max-w-7xl mx-auto relative z-10 px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 sm:mb-4 leading-tight">
            Admission <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Form</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Complete your application in three clear steps, then submit.
          </p>
          <div className="mt-4 max-w-3xl mx-auto rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-3 text-left">
            <p className="text-xs sm:text-sm text-white/90">
              Before submitting, please ensure your name, phone number, email, CNIC/B-Form number, and selected course are correct.
            </p>
            <p className="mt-2 text-[11px] sm:text-xs text-gray-300">
              Helpful tips: keep your payment screenshot ready (JPG/PNG/WebP), use an active contact number, and review each step carefully to avoid delays in processing.
            </p>
          </div>
        </div>

        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 overflow-hidden w-full">
          <div className="relative z-10">
            <div className="mb-6 sm:mb-8">
              <div className="mx-auto w-full max-w-4xl">
                <div className="mb-3 sm:mb-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                    style={{ width: `${stepProgressPercent}%` }}
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 sm:gap-4" style={{ scrollbarWidth: 'none' }}>
                  {STEP_META.map((item) => {
                    const isDone = currentStep > item.step
                    const isActive = currentStep >= item.step

                    return (
                      <div
                        key={item.step}
                        className="rounded-xl px-3 py-2.5 sm:px-4 transition-all duration-300 bg-transparent min-w-[180px] sm:min-w-0"
                      >
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                          <div
                            className={`h-9 w-9 rounded-full grid place-items-center text-sm font-bold border transition-all duration-300 ${
                              isDone
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : currentStep === item.step
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                  : 'bg-white/5 border-white/20 text-white/60'
                            }`}
                          >
                            {isDone ? '✓' : item.step}
                          </div>
                          <div className="text-center sm:text-left">
                            <p className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-white/70'}`}>{item.title}</p>
                            <p className="text-[10px] sm:text-[11px] text-white/60">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Full Name *</label>
                      <input id="name" type="text" {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} className={inputClass(Boolean(errors.name))} placeholder="Enter your full name" />
                      {errors.name && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="fatherName" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Father Name *</label>
                      <input id="fatherName" type="text" {...register('fatherName', { required: 'Father name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} className={inputClass(Boolean(errors.fatherName))} placeholder="Enter father name" />
                      {errors.fatherName && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.fatherName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Phone Number *</label>
                      <input id="phone" type="tel" {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9+\-\s()]{10,15}$/, message: 'Invalid phone number' } })} className={inputClass(Boolean(errors.phone))} placeholder="03xx-xxxxxxx" />
                      {errors.phone && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Email Address *</label>
                      <input id="email" type="email" readOnly={isAuthenticated} {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} className={inputClass(Boolean(errors.email))} placeholder="your@email.com" />
                      {errors.email && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="cnic" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">CNIC / B-Form *</label>
                      <input id="cnic" type="text" {...register('cnic', { required: 'CNIC / B-Form is required', pattern: { value: /^(\d{5}-\d{7}-\d|\d{13})$/, message: 'Use format: 12345-1234567-1' } })} className={inputClass(Boolean(errors.cnic))} placeholder="CNIC or B-Form (12345-1234567-1)" />
                      {errors.cnic && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.cnic.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Gender *</label>
                      <select id="gender" {...register('gender', { required: 'Gender is required' })} className={inputClass(Boolean(errors.gender))}>
                        <option value="" className="bg-gray-800 text-white">Select gender</option>
                        <option value="male" className="bg-gray-800 text-white">Male</option>
                        <option value="female" className="bg-gray-800 text-white">Female</option>
                        <option value="other" className="bg-gray-800 text-white">Other</option>
                      </select>
                      {errors.gender && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.gender.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Date of Birth *</label>
                      <input id="dateOfBirth" type="date" {...register('dateOfBirth', { required: 'Date of birth is required' })} className={`${inputClass(Boolean(errors.dateOfBirth))} scheme-dark`} />
                      {errors.dateOfBirth && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="courseName" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Primary Course *</label>
                      {loadingCourses ? (
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70">Loading courses...</div>
                      ) : (
                        <select id="courseName" {...register('courseName', { required: 'Course name is required' })} className={inputClass(Boolean(errors.courseName))}>
                          <option value="" className="bg-gray-800 text-white">Select course</option>
                          {requiredCourses.map((course) => (
                            <option key={course.id} value={course.title} className="bg-gray-800 text-white">{course.title}</option>
                          ))}
                        </select>
                      )}
                      {errors.courseName && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.courseName.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <label htmlFor="address" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Address</label>
                      <input id="address" type="text" {...register('address')} className={inputClass(Boolean(errors.address))} placeholder="House/Street, Area, City" />
                    </div>
                    <div>
                      <label htmlFor="courseName2" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Second Course (Optional)</label>
                      {loadingCourses ? (
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70">Loading courses...</div>
                      ) : (
                        <select id="courseName2" {...register('courseName2')} className={inputClass(Boolean(errors.courseName2))}>
                          <option value="" className="bg-gray-800 text-white">Select optional course</option>
                          {optionalCourses.map((course) => (
                            <option key={course.id} value={course.title} className="bg-gray-800 text-white">{course.title}</option>
                          ))}
                        </select>
                      )}
                      {errors.courseName2 && <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.courseName2.message}</p>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 sm:p-4 text-xs sm:text-sm text-cyan-100">
                    Review your information and continue to the next step.
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <label htmlFor="paymentScreenshot" className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">
                        Payment Screenshot *
                      </label>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <label
                            htmlFor="paymentScreenshot"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                          >
                            Choose file
                          </label>
                          <span className="text-xs sm:text-sm text-white/70 break-all">{selectedFileName}</span>
                        </div>
                        <input
                          id="paymentScreenshot"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        {fileError && <p className="mt-2 text-xs sm:text-sm text-red-400">{fileError}</p>}
                        <p className="mt-2 text-[11px] sm:text-xs text-gray-400">Accepted: JPG, PNG, WebP (max 2MB)</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs sm:text-sm font-semibold text-white/90">Payment Info</div>
                      <div className="mt-2 space-y-2 text-[11px] sm:text-xs text-white/70">
                        {PAYMENT_INFO.method ? (
                          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                            <span>Method</span>
                            <span className="font-semibold text-white/90">{PAYMENT_INFO.method}</span>
                          </div>
                        ) : null}
                        {PAYMENT_INFO.number ? (
                          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                            <span>Payment Number</span>
                            <span className="font-semibold text-white/90">{PAYMENT_INFO.number}</span>
                          </div>
                        ) : null}
                        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                          Screenshot required. Use clear, readable payment proof. Max file size 2MB.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <label htmlFor="termsCheckbox" className="text-xs sm:text-sm text-white/90">
                      I agree to the Terms and Conditions and confirm that all information is correct.
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as AdmissionStep)}
                    className="sm:w-auto w-full px-4 sm:px-5 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors text-sm sm:text-base"
                    disabled={isSubmitting || isSavingStep}
                  >
                    Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleSaveStepAndNext}
                    className="sm:ms-auto sm:w-auto w-full px-5 sm:px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-cyan-900/20 text-sm sm:text-base"
                    disabled={isSubmitting || isSavingStep}
                  >
                    {isSavingStep ? 'Saving...' : 'Save & Next'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="sm:ms-auto sm:w-auto w-full px-5 sm:px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-lg shadow-cyan-900/20 text-sm sm:text-base"
                    disabled={isSubmitting || isSavingStep || !acceptedTerms || !paymentScreenshot}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <AdmissionFormSignInRequiredPopup show={showSignInPrompt} />
    </div>
  )
}

export default AdmissionForm
