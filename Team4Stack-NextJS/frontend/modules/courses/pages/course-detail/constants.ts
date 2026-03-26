import type { CourseDetailCourse, CourseSectionConfig } from './types';

export const DEFAULT_COURSES: CourseDetailCourse[] = [
  {
    id: 'physical',
    title: 'Physical Training (WE Connect)',
    description: 'Hands-on MERN stack training with real projects at WE Connect Software House.',
    duration: '3 months',
    price: 'Rs 10,000 (first month)',
    note: 'Next months: compromise possible',
    level: 'Physical',
    features: [
      'In-person classes + project work',
      'Monthly payment via JazzCash',
      'Certificate on completion',
      'Limited seats',
    ],
  },
  {
    id: 'online',
    title: 'Online Training',
    description: 'Live online MERN stack course with recordings and support community.',
    duration: '4 months',
    price: 'Rs 5,000 (first month)',
    note: 'Next months: compromise possible',
    level: 'Online',
    features: [
      'Live classes + recordings',
      'Monthly payment via JazzCash',
      'Assignments and projects',
      'Flexible timings',
    ],
  },
];

export const COURSE_DETAILS_BODY =
  'The MERN Stack Web Development Course offers complete training in building powerful web applications using MongoDB, Express.js, React.js, and Node.js. You will learn the full journey from frontend UI to backend APIs and database management. This practical, project-based course is designed to help you build real-world skills for jobs and freelancing.';

export const COURSE_SECTIONS: CourseSectionConfig[] = [
  {
    id: 'who-can-join',
    title: 'Who Can Join This Course?',
    iconColorClassName: 'text-purple-400',
    iconBackgroundClassName: 'from-purple-500/20 to-pink-500/20',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    intro: 'This course is ideal for:',
    outro:
      'No previous experience is required. This course takes you from beginner level to advanced level, step by step.',
    listMarker: 'dot-cyan',
    items: [
      'Students: Looking to build professional web development skills',
      'Beginners: No prior experience required; start from scratch',
      'Frontend Developers: Want to learn backend development with Node.js and MongoDB',
      'Backend Developers: Interested in mastering React for frontend development',
      'Freelancers: Wanting to offer full-stack development services',
      'IT Professionals: Seeking to upgrade skills on modern web technologies',
    ],
  },
  {
    id: 'what-you-will-learn',
    title: 'What Will You Learn?',
    iconColorClassName: 'text-pink-400',
    iconBackgroundClassName: 'from-pink-500/20 to-orange-500/20',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    listMarker: 'check-cyan',
    items: [
      'Introduction to NoSQL databases',
      'Creating and managing collections and documents',
      'Querying, updating, and deleting data',
      'Setting up the server environment',
      'Building RESTful APIs',
      'Middleware and routing',
      'React fundamentals: components, state, and props',
      'React hooks and functional components',
      'Managing routes and navigation',
      'Integrating React frontend with Express backend',
    ],
  },
  {
    id: 'requirements',
    title: 'Requirements',
    iconColorClassName: 'text-emerald-400',
    iconBackgroundClassName: 'from-emerald-500/20 to-teal-500/20',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    listMarker: 'dot-emerald',
    items: [
      'Basic computer and internet skills',
      'A laptop or desktop with internet access',
      'Basic understanding of HTML, CSS, and JavaScript',
      'Interest in full-stack development',
      'Willingness to learn modern JavaScript frameworks',
    ],
  },
  {
    id: 'material-includes',
    title: 'Material Includes',
    iconColorClassName: 'text-amber-400',
    iconBackgroundClassName: 'from-amber-500/20 to-orange-500/20',
    iconPath:
      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    listMarker: 'check-amber',
    items: [
      'Complete MERN stack training',
      'MongoDB database setup and management',
      'Express.js API development guides',
      'React.js frontend development materials',
      'Node.js backend development tutorials',
      'Project-based learning resources',
    ],
  },
];
