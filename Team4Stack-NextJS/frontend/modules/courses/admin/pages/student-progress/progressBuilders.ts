import type { Course, ProgressRecord, StudentListItem, StudentProgress, User } from './types'
import { getCourseNameKey, normalizeEmail } from './shared'

export const buildStudentProgress = ({
  users,
  studentEnrollments,
  courses,
  rollNumberMap,
  cnicMap,
  videosByCourse,
  progressRecords
}: {
  users: User[]
  studentEnrollments: Record<string, Set<string>>
  courses: Course[]
  rollNumberMap: Record<string, Record<string, string>>
  cnicMap: Record<string, string>
  videosByCourse: Record<string, number>
  progressRecords: ProgressRecord[]
}) => {
  const studentProgress = users
    .map((user) => {
      const normalizedEmail = normalizeEmail(user.email)
      const enrolledCourseNames = Array.from(studentEnrollments[normalizedEmail] || [])

      const enrolledCourses = enrolledCourseNames
        .map((courseName) => {
          const course = courses.find(
            (courseOption) => getCourseNameKey(courseOption) === courseName.toLowerCase().trim()
          )
          return course ? { courseId: course.id, courseName: course.title || course.name || courseName } : null
        })
        .filter(Boolean) as { courseId: string; courseName: string }[]

      const primaryRollNumber =
        enrolledCourses.length > 0 ? rollNumberMap[normalizedEmail]?.[String(enrolledCourses[0].courseId)] : undefined

      const courseProgress = enrolledCourses.map(({ courseId, courseName }) => {
        const courseIdAsString = String(courseId)
        const totalVideos = videosByCourse[courseIdAsString] || 0

        const completedCourseVideos = progressRecords.filter((progress) => {
          const progressCourseId = String(progress.course_id)
          const progressUserId = String(progress.user_id)
          return (
            progressCourseId === courseIdAsString &&
            progressUserId === String(user.id) &&
            progress.completed === true &&
            progress.video_id != null
          )
        })

        const completedVideos = completedCourseVideos.length
        const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

        return {
          courseId,
          courseName,
          totalVideos,
          completedVideos,
          progressPercentage
        }
      })

      const totalVideosCompleted = courseProgress.reduce((sum, current) => sum + current.completedVideos, 0)

      return {
        userId: user.id,
        userName: user.name || 'Unknown',
        userEmail: user.email || 'No email',
        rollNumber: primaryRollNumber,
        cnic: cnicMap[normalizedEmail] || undefined,
        enrolledCourses: courseProgress,
        totalCourses: enrolledCourses.length,
        totalVideosCompleted
      }
    })
    .filter((student) => student.totalCourses > 0)

  studentProgress.sort((a, b) => b.totalVideosCompleted - a.totalVideosCompleted)
  return studentProgress
}

export const buildStudentList = (studentProgress: StudentProgress[]): StudentListItem[] => {
  const list = studentProgress.map((student) => {
    const totalVideos = student.enrolledCourses.reduce((sum, course) => sum + course.totalVideos, 0)
    const overallProgress = totalVideos > 0 ? Math.round((student.totalVideosCompleted / totalVideos) * 100) : 0

    return {
      userId: student.userId,
      userName: student.userName,
      userEmail: student.userEmail,
      rollNumber: student.rollNumber || 'N/A',
      cnic: student.cnic,
      totalCourses: student.totalCourses,
      totalVideosCompleted: student.totalVideosCompleted,
      overallProgress
    }
  })

  list.sort((a, b) => {
    if (a.rollNumber === 'N/A' && b.rollNumber !== 'N/A') return 1
    if (a.rollNumber !== 'N/A' && b.rollNumber === 'N/A') return -1
    return a.rollNumber.localeCompare(b.rollNumber)
  })

  return list
}
