import CourseViewPage from '@/modules/courses/pages/CourseViewPage';

export default function CourseView({ params }: { params: { courseId: string } }) {
  return <CourseViewPage courseId={params.courseId} />;
}
