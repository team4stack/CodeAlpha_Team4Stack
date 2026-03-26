import React from 'react';

interface CoursePaymentNoticeModalProps {
  isDarkMode: boolean;
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

const CoursePaymentNoticeModal: React.FC<CoursePaymentNoticeModalProps> = ({
  isDarkMode,
  open,
  onContinue,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pt-20 md:pt-24">
      <div className={`w-full max-w-lg rounded-xl sm:rounded-2xl text-white bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/20 max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${
        isDarkMode ? 'shadow-2xl' : 'shadow-xl'
      }`}>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Before You Book</h3>
        <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">Please pay the first month fee via JazzCash and keep the screenshot. Next months: compromise possible.</p>
        <div className="rounded-lg bg-white/10 border border-white/20 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm">JazzCash Number</div>
          <div className="text-lg sm:text-xl font-semibold mt-1">+92 308 3266634</div>
          <div className="text-xs sm:text-sm mt-1">Account Name: <span className="font-medium">Muhammad Sami Ullah</span></div>
        </div>
        <p className="text-white/70 mb-4 text-sm sm:text-base">After submitting the form, send the payment screenshot on WhatsApp.</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button onClick={onContinue} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm sm:text-base">
            Continue to Form
          </button>
          <button onClick={onCancel} className={`flex-1 border-2 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base ${
            isDarkMode ? 'border-white/30 hover:bg-white/10' : 'border-white/30 hover:bg-white/10'
          }`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursePaymentNoticeModal;
