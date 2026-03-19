import React, { Suspense } from 'react';
import { home, about, services, projects, reviews, contact } from '../sections';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <home.Hero />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <about.About />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <services.Services />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <projects.Projects />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <reviews.Reviews />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>}>
        <contact.Contact />
      </Suspense>
    </div>
  );
};

export default HomePage;