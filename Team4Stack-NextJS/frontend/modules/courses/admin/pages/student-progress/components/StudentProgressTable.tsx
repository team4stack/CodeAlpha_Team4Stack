import React from 'react'
import type { ProgressFilter, StudentListItem, StudentProgress } from '../types'

interface StudentProgressTableProps {
  loading: boolean
  searchQuery: string
  filterCourse: string
  filterProgress: ProgressFilter
  studentList: StudentListItem[]
  studentProgress: StudentProgress[]
  onViewDetails: (student: StudentProgress | null) => void
}

const studentMatchesFilters = ({
  student,
  searchQuery,
  filterCourse,
  filterProgress,
  studentProgress
}: {
  student: StudentListItem
  searchQuery: string
  filterCourse: string
  filterProgress: ProgressFilter
  studentProgress: StudentProgress[]
}) => {
  if (searchQuery.trim()) {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      student.rollNumber.toLowerCase().includes(searchLower) ||
      student.userName.toLowerCase().includes(searchLower) ||
      student.userEmail.toLowerCase().includes(searchLower)
    if (!matchesSearch) return false
  }

  if (filterCourse !== 'all') {
    const fullProgress = studentProgress.find((progress) => progress.userId === student.userId)
    const hasCourse = fullProgress?.enrolledCourses.some((course) => String(course.courseId) === filterCourse)
    if (!hasCourse) return false
  }

  if (filterProgress !== 'all') {
    if (filterProgress === 'high' && student.overallProgress < 80) return false
    if (filterProgress === 'medium' && (student.overallProgress < 50 || student.overallProgress >= 80)) return false
    if (filterProgress === 'low' && student.overallProgress >= 50) return false
  }

  return true
}

const StudentProgressTable: React.FC<StudentProgressTableProps> = ({
  loading,
  searchQuery,
  filterCourse,
  filterProgress,
  studentList,
  studentProgress,
  onViewDetails
}) => {
  const visibleStudents = studentList.filter((student) =>
    studentMatchesFilters({
      student,
      searchQuery,
      filterCourse,
      filterProgress,
      studentProgress
    })
  )

  return (
    <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Roll Number
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Student Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                CNIC
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Courses
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Videos Completed
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-black text-white/80 uppercase tracking-wider">
                Overall Progress
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-black text-white/80 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/10">
            {visibleStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/60 font-semibold">
                  {loading ? 'Loading students...' : 'No students found'}
                </td>
              </tr>
            ) : (
              visibleStudents.map((student) => {
                const fullProgress = studentProgress.find((progress) => progress.userId === student.userId)
                return (
                  <tr key={student.userId} className="hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-black text-purple-300">{student.rollNumber}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs font-black text-white">
                          {student.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-white">{student.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-purple-300">{student.cnic || '-'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-white/70">{student.userEmail}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-white">{student.totalCourses}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-400">{student.totalVideosCompleted}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden min-w-[100px]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              student.overallProgress === 100
                                ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                : student.overallProgress >= 50
                                  ? 'bg-gradient-to-r from-orange-400 to-red-400'
                                  : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                            }`}
                            style={{ width: `${student.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-white min-w-[45px]">
                          {student.overallProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => onViewDetails(fullProgress || null)}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white rounded-lg hover:shadow-lg transition-all text-xs font-bold border border-white/20"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentProgressTable
