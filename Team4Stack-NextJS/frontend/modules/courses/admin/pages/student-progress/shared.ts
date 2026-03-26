import type { Course } from './types'

export interface ApprovedApplicationRow {
  id: number | string
  email?: string | null
  course_name?: string | null
  course_name_2?: string | null
  approved?: boolean | null
  approved_1?: boolean | null
  approved_2?: boolean | null
  roll_number?: string | null
  cnic?: string | null
}

export const normalizeEmail = (value?: string | null) => (value || '').toLowerCase().trim()

export const getCourseNameKey = (course: { title?: string | null; name?: string | null }) =>
  (course.title || course.name || '').toLowerCase().trim()

export const mapCourseOption = (course: { id: string | number; title?: string; name?: string }): Course => ({
  id: String(course.id),
  title: course.title || course.name
})
