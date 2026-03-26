export const sanitizeInput = (input: string): string => {
  const inputStr = typeof input === 'string' ? input : String(input);

  let sanitized = inputStr.replace(/<[^>]*>/g, '');
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized;
};

export const validatePaymentScreenshotFile = (file: File | null): { isValid: boolean; error: string | null } => {
  if (!file) return { isValid: false, error: 'Payment screenshot is required' };

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 2MB' };
  }

  return { isValid: true, error: null };
};
