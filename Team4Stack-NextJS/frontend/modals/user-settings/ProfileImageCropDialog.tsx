'use client';

import React from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface ProfileImageCropDialogProps {
  isOpen: boolean;
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (_croppedArea: Area, croppedAreaPixels: Area) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirming: boolean;
}

const ProfileImageCropDialog: React.FC<ProfileImageCropDialogProps> = ({
  isOpen,
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onConfirm,
  confirming
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10010 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crop profile picture</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Move and zoom image, then save.</p>

        <div className="relative mt-4 h-72 overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="profileCropZoom" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
            Zoom
          </label>
          <input
            id="profileCropZoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? 'Applying...' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageCropDialog;
