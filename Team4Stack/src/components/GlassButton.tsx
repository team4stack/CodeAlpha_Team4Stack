import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  rel?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  target,
  rel,
}) => {
  // Base classes for glassmorphic effect
  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    font-bold
    border
    transition-all
    duration-300
    overflow-hidden
    group
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-4 py-2 rounded-lg',
    md: 'text-sm px-6 py-2.5 rounded-full',
    lg: 'text-base px-8 py-3.5 rounded-full',
  };

  // Variant styles - glassmorphic holographic effect
  const variantClasses = {
    primary: `
      bg-white/6
      backdrop-blur-md
      backdrop-saturate-180
      text-white/90
      border-white/15
      hover:bg-white/10
      hover:border-white/25
      hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
      active:bg-white/8
      active:scale-[0.98]
    `,
    secondary: `
      bg-white/10
      backdrop-blur-lg
      backdrop-saturate-150
      text-white
      border-white/20
      hover:bg-white/15
      hover:border-white/30
      hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
      active:bg-white/12
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent
      backdrop-blur-sm
      text-white/90
      border-white/10
      hover:bg-white/5
      hover:border-white/20
      hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
      active:bg-white/3
      active:scale-[0.98]
    `,
  };

  // White gradient overlay for holographic texture effect
  const gradientOverlay = `
    before:content-['']
    before:absolute
    before:inset-0
    before:bg-gradient-to-b
    before:from-white/10
    before:via-white/3
    before:to-transparent
    before:pointer-events-none
    before:rounded-inherit
    before:transition-opacity
    before:duration-300
    group-hover:before:from-white/15
    group-hover:before:via-white/5
    group-hover:before:to-transparent
  `;

  // 3D layered effect - light from top left
  const layeredEffect = `
    after:content-['']
    after:absolute
    after:inset-0
    after:bg-gradient-to-br
    after:from-white/5
    after:via-transparent
    after:to-transparent
    after:pointer-events-none
    after:rounded-inherit
    after:opacity-0
    after:transition-opacity
    after:duration-300
    group-hover:after:opacity-100
  `;

  // Glowing text effect
  const textGlow = `
    [text-shadow:0_0_8px_rgba(255,255,255,0.3)]
    group-hover:[text-shadow:0_0_12px_rgba(255,255,255,0.5)]
  `;

  const allClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${gradientOverlay}
    ${layeredEffect}
    ${textGlow}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // If href is provided, render as anchor tag
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={allClasses}
        target={target}
        rel={rel}
        aria-disabled={disabled}
      >
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={allClasses}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default GlassButton;

