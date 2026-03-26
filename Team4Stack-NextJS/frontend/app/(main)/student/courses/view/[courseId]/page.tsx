import CourseViewPage from '@/modules/courses/pages/CourseViewPage';

export default async function CourseView({
  params
}: Readonly<{ params: Promise<{ courseId: string }> }>) {
  const { courseId } = await params;
  return <CourseViewPage courseId={courseId} />;
}
