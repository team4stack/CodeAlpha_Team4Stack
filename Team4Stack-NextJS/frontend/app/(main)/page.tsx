import type { Metadata } from 'next';
import HomePage from '@/modules/landing/pages/HomePage';

export const metadata: Metadata = {
  title: 'Team4Stack - MERN Stack Development, Courses, and Services',
  description:
    'Team4Stack offers MERN web development, mobile app development, project services, and practical training courses.',
  keywords: [
    'Team4Stack',
    'Team Four Stack',
    'T4S',
    'MERN services',
    'MERN courses',
    'React developers',
    'Node.js development',
    'web and app development',
  ],
  alternates: {
    canonical: 'https://www.team4stack.com/',
  },
};

export default function Home() {
  return <HomePage />;
}
