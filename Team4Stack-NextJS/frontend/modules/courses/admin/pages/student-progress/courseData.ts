import { coursesApi } from '@/lib/api'
import type { Course } from './types'

export const getVideosByCourse = async (courses: Course[]) => {
  const videosByCourse: Record<string, number> = {}
  const allVideos = await Promise.all(
    courses.map(async (course) => {
      const videosResult = await coursesApi.getCourseVideos(Number.parseInt(course.id, 10))
      return Array.isArray(videosResult.data) ? videosResult.data : []
    })
  )

  allVideos.flat().forEach((video: { course_id?: string | number | null }) => {
    if (!video.course_id) return
    const courseId = String(video.course_id)
    videosByCourse[courseId] = (videosByCourse[courseId] || 0) + 1
  })

  return videosByCourse
}
