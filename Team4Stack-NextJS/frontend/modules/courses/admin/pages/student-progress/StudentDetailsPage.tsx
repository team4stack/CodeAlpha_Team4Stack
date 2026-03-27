'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StudentDetailsModal from './components/StudentDetailsModal'
import { loadStudentProgressData } from './loadStudentProgressData'
import type { StudentProgress } from './types'

const StudentDetailsPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setError('Missing student id')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const { studentProgress } = await loadStudentProgressData('all')
        const found = studentProgress.find((student) => student.userId === userId) || null
        setSelectedStudent(found)
        if (!found) setError('Student not found')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [userId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
      <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/admincourset4s/progress')}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Back to Progress
          </button>
          <div className="text-center flex-1">
            <h1 className="text-white font-black text-xl">Student Details</h1>
            <p className="text-xs text-white/60">Progress, marks, and submissions review</p>
          </div>
          <div className="hidden sm:block w-[120px]" />
        </div>

        {loading ? (
          <div className="bg-white/10 rounded-xl border border-white/20 p-6 text-white/70">
            Loading student details...
          </div>
        ) : error ? (
          <div className="bg-red-500/20 rounded-xl border border-red-500/40 p-6 text-red-200">
            {error}
          </div>
        ) : (
          <StudentDetailsModal selectedStudent={selectedStudent} isOpen={true} onClose={() => router.push('/admincourset4s/progress')} variant="page" />
        )}
      </div>
    </div>
  )
}

export default StudentDetailsPage
