export type ApplicationRow = {
  id: number
  name: string
  father_name: string
  phone: string
  email: string
  address: string | null
  course_name: string
  course_name_2: string | null
  message: string | null
  gender: string
  age: number
  image_attached: boolean
  viewed: boolean
  approved: boolean | null
  approved_1: boolean | null
  approved_2: boolean | null
  rejection_message: string | null
  rejection_message_1: string | null
  rejection_message_2: string | null
  created_at: string
  is_blocked?: boolean
}

export type ApplicationFilter = 'all' | 'pending' | 'approved' | 'rejected'

export type CourseNumber = 1 | 2
