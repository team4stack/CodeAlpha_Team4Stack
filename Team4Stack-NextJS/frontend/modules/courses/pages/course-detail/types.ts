export interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export interface CourseDetailCourse {
  id: number | string;
  title: string;
  description: string;
  duration?: string;
  price?: string;
  note?: string;
  level?: string;
  features?: string[];
}

export type ListMarker = 'dot-cyan' | 'check-cyan' | 'dot-emerald' | 'check-amber';

export interface CourseSectionConfig {
  id: string;
  title: string;
  iconColorClassName: string;
  iconBackgroundClassName: string;
  iconPath: string;
  intro?: string;
  outro?: string;
  listMarker: ListMarker;
  items: string[];
}
