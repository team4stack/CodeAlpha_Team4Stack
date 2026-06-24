'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import CoursesNavbar from '@/navigation/CoursesNavbar'
import ApplyTypeSelector, { type ApplyType } from '../components/ApplyTypeSelector'
import { AdmissionForm } from '../sections'
import DeveloperApplyForm from '../sections/DeveloperApplyForm'
import AdmissionFormAnimatedBackground from '../sections/admission-form/AdmissionFormAnimatedBackground'
import { useAdmissionFormAnimationStyles } from '../sections/admission-form/useAdmissionFormAnimationStyles'

function parseApplyType(raw: string | null): ApplyType {
  return raw === 'developer' ? 'developer' : 'student'
}

const UnifiedApplyPage: React.FC = () => {
  useAdmissionFormAnimationStyles()
  const searchParams = useSearchParams()
  const [applyType, setApplyType] = useState<ApplyType>('student')

  useEffect(() => {
    setApplyType(parseApplyType(searchParams.get('type')))
  }, [searchParams])

  const isStudent = applyType === 'student'

  return (
    <div className="flex min-h-dvh w-full flex-col transition-colors duration-300">
      <CoursesNavbar />
      <div className="relative w-full min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18] pt-16 sm:pt-20 md:pt-28 pb-10 px-3 sm:px-4">
        <AdmissionFormAnimatedBackground />

        <div className="container-custom max-w-7xl mx-auto relative z-10 px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Apply to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                Team4Stack
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto">
              {isStudent
                ? 'Course admission — complete the form in three steps.'
                : 'Developer application — share your skills and join our team.'}
            </p>
          </div>

          <ApplyTypeSelector value={applyType} onChange={setApplyType} />

          {isStudent ? <AdmissionForm embedded /> : <DeveloperApplyForm />}
        </div>
      </div>
    </div>
  )
}

export default UnifiedApplyPage
