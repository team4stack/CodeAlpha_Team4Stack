'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LandingAdminFormMountProps {
  usePortal: boolean;
  onBackdropClose: () => void;
  children: React.ReactNode;
}

/** Renders children in document.body so modal overlays are not clipped by admin scroll containers. */
const LandingAdminFormMount: React.FC<LandingAdminFormMountProps> = ({
  usePortal,
  onBackdropClose,
  children
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!usePortal) {
    return <>{children}</>;
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 overflow-y-auto overflow-x-hidden admin-custom-scrollbar">
      <button
        type="button"
        aria-label="Close"
        className="btn-no-liquid fixed inset-0 z-0 rounded-none border-0 bg-black/60 backdrop-blur-md"
        onClick={onBackdropClose}
      />
      <div
        className="relative z-1 flex min-h-full justify-center px-4 pb-10 pointer-events-none"
        style={{ paddingTop: 'max(1rem, calc(var(--admin-header-height, 80px) + 0.5rem))' }}
      >
        <div className="pointer-events-auto w-full max-w-full flex justify-center">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default LandingAdminFormMount;
