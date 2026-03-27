import React from 'react';
import type { CourseDetailCourse } from '../types';
import styles from './CourseDetailHero.module.css';

interface CourseDetailHeroProps {
  course: CourseDetailCourse;
}

const normalizeImageUrl = (value?: string): string => {
  const raw = (value || '').trim();
  if (!raw) return '';
  if (raw.includes('github.com') && raw.includes('/blob/')) {
    return raw
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('http://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
  }
  if (raw.includes('drive.google.com/file/d/')) {
    const match = /drive\.google\.com\/file\/d\/([^/]+)/.exec(raw);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:') ||
    raw.startsWith('/')
  ) {
    return raw;
  }
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('res.cloudinary.com') || raw.startsWith('images.') || raw.startsWith('cdn.')) {
    return `https://${raw}`;
  }
  if (raw.startsWith('drive.google.com')) return `https://${raw}`;
  return raw;
};

const CourseDetailHero: React.FC<CourseDetailHeroProps> = ({ course }) => {
  const courseImage = normalizeImageUrl(course.thumbnail_url || course.image_url);

  return (
    <section className="relative pt-20 md:pt-28 pb-12 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-24 -left-24 w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl ${styles.glowPrimary}`}
        ></div>
        <div
          className={`absolute -bottom-28 -right-24 w-[60vw] h-[60vw] rounded-full opacity-15 blur-3xl ${styles.glowSecondary}`}
        ></div>
      </div>

      <div className="container-custom max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-sm text-white/80 font-medium">
                {course.level || 'Course'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              {course.title}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl lg:max-w-none mx-auto lg:mx-0 mb-8 leading-relaxed">
              {course.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto lg:mx-0 mb-8">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-cyan-400 text-sm font-semibold mb-1">
                  Duration
                </div>
                <div className="text-white text-lg font-bold">
                  {course.duration || 'N/A'}
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-purple-400 text-sm font-semibold mb-1">
                  Price
                </div>
                <div className="text-white text-lg font-bold">
                  {course.price || 'N/A'}
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-pink-400 text-sm font-semibold mb-1">
                  Level
                </div>
                <div className="text-white text-lg font-bold">
                  {course.level || 'All Levels'}
                </div>
              </div>
            </div>

            {course.note && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {course.note}
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
              {courseImage ? (
                <img
                  src={courseImage}
                  alt={course.title}
                  className="relative w-full h-full object-cover aspect-[16/10] sm:aspect-[16/9]"
                />
              ) : (
                <div className="relative flex flex-col items-center justify-center text-center p-10 aspect-[16/10] sm:aspect-[16/9]">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-cyan-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm4 5h6m-6 4h6m-6 4h6"
                      />
                    </svg>
                  </div>
                  <p className="text-white/80 font-semibold">Course Preview</p>
                  <p className="text-white/50 text-sm mt-1">
                    Image will appear here once added.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetailHero;
