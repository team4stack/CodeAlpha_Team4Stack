import emailjs from '@emailjs/browser';

export const generateSixDigitOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

interface SendVerificationOtpEmailArgs {
  otpCode: string;
  userEmail: string;
  displayName?: string;
}

export const sendVerificationOtpEmail = async ({
  otpCode,
  userEmail,
  displayName
}: SendVerificationOtpEmailArgs): Promise<boolean> => {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (
      !serviceId ||
      !templateId ||
      !publicKey ||
      serviceId === 'your_service_id' ||
      templateId === 'your_template_id' ||
      publicKey === 'your_public_key' ||
      serviceId.trim() === '' ||
      templateId.trim() === '' ||
      publicKey.trim() === ''
    ) {
      return false;
    }

    try {
      emailjs.init(publicKey);
    } catch {
      // ignore init failures; send will still attempt
    }

    const fallbackName = displayName || userEmail.split('@')[0] || 'User';
    const templateParams: Record<string, string> = {
      to_email: userEmail,
      to_name: fallbackName,
      verification_code: otpCode,
      code: otpCode,
      otp: otpCode,
      verification_code_6: otpCode,
      user_email: userEmail,
      user_name: fallbackName,
      email: userEmail,
      name: fallbackName,
      from_name: 'Team4Stack',
      subject: 'Team4Stack - Email Verification Code',
      message: `Your verification code is: ${otpCode}. This code expires in 10 minutes.`
    };

    const response = await emailjs.send(
      serviceId.trim(),
      templateId.trim(),
      templateParams,
      publicKey.trim()
    );

    return Boolean(response && response.status === 200);
  } catch {
    return false;
  }
};
