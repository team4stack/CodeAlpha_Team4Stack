import CourseViewPage from '@/modules/courses/pages/CourseViewPage';

export default function CourseView({ params }: { params: Promise<{ courseId: string }> }) {
  return <CourseViewPage params={params} />;
}
