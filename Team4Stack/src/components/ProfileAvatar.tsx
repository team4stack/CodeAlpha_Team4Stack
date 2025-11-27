import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ProfileAvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  showGlow?: boolean;
  showIcon?: React.ReactNode;
  iconPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  alt,
  size = 'md',
  onClick,
  className = '',
  showGlow = true,
  showIcon,
  iconPosition = 'top-right'
}) => {
  const { isDarkMode } = useTheme();
  const isLogo = src.includes('Team4stack_Logo');
  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // Icon position classes
  const iconPositionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Profile Image Container */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          overflow-hidden 
          ring-4 
          transition-all 
          duration-300 
          cursor-pointer
          group
          ring-white/30 
          dark:ring-white/30 
          hover:ring-purple-400/50 
          dark:hover:ring-purple-400/50
          ${isLogo && !isDarkMode ? 'bg-black p-1' : ''}
        `}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        aria-label={onClick ? `${alt} profile picture` : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={`
            ${isLogo ? 'object-contain' : 'object-cover'}
            w-full 
            h-full 
            transition-all 
            duration-500
            group-hover:scale-110
            brightness-100 
            contrast-100
            dark:brightness-110 
            dark:contrast-110
            dark:saturate-110
            ${isLogo && !isDarkMode ? 'rounded-lg' : 'rounded-full'}
          `}
          loading="lazy"
        />
      </div>

      {/* Glow Effect */}
      {showGlow && (
        <div className={`
          absolute 
          inset-0 
          rounded-full 
          blur-lg 
          transition-all 
          duration-300
          bg-gradient-to-r 
          from-purple-400/20 
          to-blue-400/20 
          dark:from-purple-400/30 
          dark:to-blue-400/30
        `}></div>
      )}

      {/* Icon */}
      {showIcon && (
        <div className={`
          absolute 
          ${iconPositionClasses[iconPosition]}
          z-10
          transition-all 
          duration-300
          group-hover:scale-110
        `}>
          {showIcon}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
