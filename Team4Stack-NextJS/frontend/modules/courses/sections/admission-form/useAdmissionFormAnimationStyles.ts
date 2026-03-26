import { useEffect } from 'react';

export const useAdmissionFormAnimationStyles = () => {
  useEffect(() => {
    const styleId = 'admission-form-animations';
    if (typeof document === 'undefined' || document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }
      @keyframes gradient-shift {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      .animate-shimmer {
        animation: shimmer 3s ease-in-out infinite;
      }
      .animate-gradient-shift {
        animation: gradient-shift 4s ease-in-out infinite;
      }
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
        opacity: 0.7;
      }
      input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, []);
};
