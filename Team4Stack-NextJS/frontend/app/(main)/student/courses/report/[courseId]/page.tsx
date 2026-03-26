import CourseReportPage from '@/modules/courses/pages/CourseReportPage';

export default async function StudentCourseReport({
  params
}: Readonly<{ params: Promise<{ courseId: string }> }>) {
  const { courseId } = await params;
  return <CourseReportPage courseId={courseId} />;
}
