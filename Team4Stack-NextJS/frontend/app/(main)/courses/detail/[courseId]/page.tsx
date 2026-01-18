import CourseDetailPage from '@/modules/courses/pages/CourseDetailPage';

export default function CourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  return <CourseDetailPage params={params} />;
}
