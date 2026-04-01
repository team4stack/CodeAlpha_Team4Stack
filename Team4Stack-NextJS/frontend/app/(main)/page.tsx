import type { Metadata } from 'next';
import HomePage from '@/modules/landing/pages/HomePage';

const DASHBOARD_IMAGE_URL =
  'https://raw.githubusercontent.com/Sami3234/Images/main/team4stack/Team4stack_Dashboard.png';
const COURSE_IMAGE_URL =
  'https://raw.githubusercontent.com/Sami3234/Images/main/team4stack/Mern_Stack_Course.png';

export const metadata: Metadata = {
  title: 'Team4Stack - MERN Stack Development, Courses, and Services',
  description:
    'Team4Stack offers MERN web development, mobile app development, project services, practical training courses, and dashboard-ready digital products.',
  keywords: [
    'Team4Stack',
    'Team Four Stack',
    'T4S',
    'team4stack dashboard',
    'team4stack course',
    'MERN services',
    'MERN courses',
    'React developers',
    'Node.js development',
    'web and app development',
  ],
  alternates: {
    canonical: 'https://www.team4stack.com/',
  },
  openGraph: {
    title: 'Team4Stack - MERN Stack Development, Courses, and Services',
    description:
      'Explore Team4Stack services, MERN courses, dashboards, and practical digital solutions.',
    url: 'https://www.team4stack.com/',
    type: 'website',
    images: [
      {
        url: DASHBOARD_IMAGE_URL,
        alt: 'Team4Stack dashboard preview',
      },
      {
        url: COURSE_IMAGE_URL,
        alt: 'Team4Stack MERN Stack course preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team4Stack - MERN Stack Development, Courses, and Services',
    description:
      'Explore Team4Stack services, MERN courses, dashboards, and practical digital solutions.',
    images: [DASHBOARD_IMAGE_URL],
  },
};

export default function Home() {
  return <HomePage />;
}
