import React from 'react';

const AdmissionFormAnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -left-24 w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl animate-pulse" style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.45), rgba(56,189,248,0) 60%)',
        animationDuration: '4s'
      }}></div>
      <div className="absolute -bottom-28 -right-24 w-[60vw] h-[60vw] rounded-full opacity-15 blur-3xl animate-pulse" style={{
        background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.45), rgba(168,85,247,0) 60%)',
        animationDuration: '5s',
        animationDelay: '1s'
      }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full opacity-10 blur-3xl animate-pulse" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.4), rgba(236,72,153,0) 60%)',
        animationDuration: '6s',
        animationDelay: '2s'
      }}></div>

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite'
      }}></div>
    </div>
  );
};

export default AdmissionFormAnimatedBackground;
