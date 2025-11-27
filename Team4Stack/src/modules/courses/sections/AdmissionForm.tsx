import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../../../utils/supabaseClient';
import { CONTACT_PHONE_NUMBERS, CONTACT_EMAIL, getWhatsAppUrl } from '../../../utils/constants';
import { devError } from '../../../utils/devUtils';
import { useAuth } from '../../../auth';

// Define the form data types
interface FormData {
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  address: string;
  courseName: string;
  /** Message - optional field */
  message: string;
  /** Gender - required field */
  gender: string;
  /** Age - required field */
  age: string;
}

// Utility function to sanitize input strings
const sanitizeInput = (input: string): string => {
  // Convert to string if it's not already
  let inputStr = typeof input === 'string' ? input : String(input);
  
  // Remove any HTML tags
  let sanitized = inputStr.replace(/<[^>]*>/g, '');
  // Escape special characters that could be used for XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized;
};

// Utility function to validate file type and size
const validateFile = (file: File | null): { isValid: boolean; error: string | null } => {
  // File is now required
  if (!file) return { isValid: false, error: 'Payment screenshot is required' };
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
  }
  
  // Check file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 2MB' };
  }
  
  return { isValid: true, error: null };
};

const AdmissionForm: React.FC = () => {
  const { user } = useAuth();
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      fatherName: '',
      phone: '',
      email: '',
      address: '',
      courseName: '',
      message: '',
      // Gender and age are required fields
      gender: '',
      age: ''
    }
  });

  // Prefill course name from selection (set by Courses Book Now)
  useEffect(() => {
    try {
      const sel = localStorage.getItem('selectedCourse');
      if (sel) {
        setValue('courseName', sel);
        localStorage.removeItem('selectedCourse');
      }
    } catch {}
  }, [setValue]);

  const validateForm = (data: FormData) => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Father name validation
    if (!data.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
    } else if (data.fatherName.trim().length < 2) {
      newErrors.fatherName = 'Father name must be at least 2 characters';
    }
    
    // Phone validation
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Gender validation
    if (!data.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    // Age validation
    if (!data.age) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(data.age.toString(), 10);
      if (isNaN(ageNum) || ageNum < 13) {
        newErrors.age = 'Must be at least 13 years old';
      } else if (ageNum > 100) {
        newErrors.age = 'Must be less than 100 years old';
      }
    }
    
    // Course name validation
    if (!data.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    
    // Payment screenshot validation
    if (!paymentScreenshot) {
      setFileError('Payment screenshot is required');
      newErrors.paymentScreenshot = 'Payment screenshot is required';
    } else {
      const fileValidation = validateFile(paymentScreenshot);
      if (!fileValidation.isValid) {
        setFileError(fileValidation.error);
        newErrors.paymentScreenshot = fileValidation.error || 'Invalid file';
      }
    }
    
    return newErrors;
  };

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const validation = validateFile(file);
    
    if (validation.isValid) {
      setPaymentScreenshot(file);
      setFileError(null);
    } else {
      setFileError(validation.error);
      e.target.value = ''; // Clear the input
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Check if user is signed in - if not, show custom popup only
    if (!user) {
      // Show custom popup only
      setShowSignInPrompt(true);
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowSignInPrompt(false);
      }, 3000);
      return;
    }

    // Validate form
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sanitize all input data before processing
      const sanitizedData = {
        name: sanitizeInput(data.name),
        fatherName: sanitizeInput(data.fatherName),
        phone: sanitizeInput(data.phone),
        email: sanitizeInput(data.email),
        address: sanitizeInput(data.address),
        courseName: sanitizeInput(data.courseName),
        message: sanitizeInput(data.message || ''),
        gender: data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : 'Other',
        age: sanitizeInput(data.age)
      };
      
      // Store data in Supabase (image is NOT uploaded, only flag is saved)
      const { error } = await supabase
        .from('admission_form')
        .insert([
          {
            name: sanitizedData.name,
            father_name: sanitizedData.fatherName,
            phone: sanitizedData.phone,
            email: sanitizedData.email,
            address: sanitizedData.address,
            course_name: sanitizedData.courseName,
            message: sanitizedData.message,
            gender: sanitizedData.gender,
            age: parseInt(sanitizedData.age, 10),
            image_attached: !!paymentScreenshot, // Store flag only, not the image
            viewed: false,
            created_at: new Date()
          }
        ]);
      
      if (error) {
        // No sensitive info in logs
        throw new Error('Failed to store data in database');
      }
      
      // Generate printable summary
      const lines = [
        `Name: ${sanitizedData.name}`,
        `Father Name: ${sanitizedData.fatherName}`,
        `Phone: ${sanitizedData.phone}`,
        `Email: ${sanitizedData.email}`,
        `Address: ${sanitizedData.address}`,
        `Gender: ${sanitizedData.gender}`,
        `Age: ${sanitizedData.age}`,
        `Course: ${sanitizedData.courseName}`,
        ...(sanitizedData.message ? [`Message: ${sanitizedData.message}`] : [])
      ];
      const phoneNumber = CONTACT_PHONE_NUMBERS.primary;
      const timestamp = new Date().toLocaleString();
      const extraNote = encodeURIComponent('Please attach the PDF you downloaded from the website along with the payment screenshot.');
      const msgEncoded = `New Course Inquiry%0AName: ${encodeURIComponent(sanitizedData.name)}%0AFather Name: ${encodeURIComponent(sanitizedData.fatherName)}%0APhone: ${encodeURIComponent(sanitizedData.phone)}%0AEmail: ${encodeURIComponent(sanitizedData.email)}%0AAddress: ${encodeURIComponent(sanitizedData.address)}%0AGender: ${encodeURIComponent(sanitizedData.gender)}%0AAge: ${encodeURIComponent(sanitizedData.age)}%0ACourse: ${encodeURIComponent(sanitizedData.courseName)}${sanitizedData.message ? `%0AMessage: ${encodeURIComponent(sanitizedData.message)}` : ''}%0A%0A${extraNote}`;
      const waURL = getWhatsAppUrl(phoneNumber, decodeURIComponent(msgEncoded));
      const logoPath = '/Team4stack_Logo.png?v=8';
      let logoDataUrl = '';
      try {
        const resp = await fetch(logoPath, { cache: 'no-cache' });
        const blob = await resp.blob();
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {}
      const summaryHtml = `<!doctype html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>Team4Stack Admission Form</title>
        <style>
          :root{--primary:#7c3aed;--accent:#10b981}
          body{font-family:Arial, sans-serif;padding:24px;color:#111;background:#fff}
          .header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
          .logo-container{height:48px;width:48px;border-radius:10px;background:#000;padding:4px;display:flex;align-items:center;justify-content:center}
          .logo{height:100%;width:100%;object-fit:contain;border-radius:6px}
          h1{margin:0;font-size:22px}
          .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:12px}
          .row{margin:8px 0}
          .label{font-weight:bold}
          img.shot{max-width:100%;height:auto;margin-top:12px;border:1px solid #ddd;border-radius:8px}
          .actions{margin-top:16px;display:flex;gap:10px}
          .btn{padding:10px 14px;border-radius:8px;border:1px solid #e5e7eb;cursor:pointer;text-decoration:none;color:#111}
          .btn-primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border:none}
          .footer{margin-top:16px;font-size:12px;color:#4b5563}
          .title{font-weight:700;font-size:18px;margin-top:6px}
        </style>
        </head><body>
        <div class='topbar'>
          <a class='btn' href='${window.location.origin}/courses' onclick='try{if(window.opener){window.opener.focus();}}catch(e){}; setTimeout(()=>window.close(),300); return true;'>Back to Courses</a>
          <button class='btn' onclick='window.close()'>Close Window</button>
        </div>
        <div id='pdf-root'>
          <div class='header'><div class='logo-container'><img class='logo' src='${logoDataUrl || logoPath}' alt='Team4Stack'/></div><div><h1>Team4Stack</h1><div class='title'>Admission Form</div></div></div>
          <div class='card'>
          ${lines.map(l => `<div class='row'>${l.replace(/</g,'&lt;')}</div>`).join('')}
          ${paymentScreenshot ? `<div class='row'><span class='label'>Payment Screenshot:</span><br/><img class='shot' src='${paymentScreenshot ? URL.createObjectURL(paymentScreenshot) : ''}' /></div>` : ''}
          </div>
        </div>
        <div class='actions'>
          <button class='btn btn-primary' onclick='generatePDF()'>Download PDF</button>
          <a id='sendWA' class='btn' href='${waURL}' target='_blank' rel='noopener'>Send on WhatsApp</a>
        </div>
        <div class='footer'>Team4Stack | Email: ${CONTACT_EMAIL} | WhatsApp: ${phoneNumber} | Generated: ${timestamp}</div>
          <script src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'></script>
          <script src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'></script>
          <script>
        function generatePDF(){
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p','pt','a4');
          const root = document.getElementById('pdf-root');
          pdf.html(root, {
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            margin: [20,20,40,20],
            autoPaging: 'text',
            callback(doc){
              doc.setFontSize(10);
              doc.text('Team4Stack | Email: ${CONTACT_EMAIL} | WhatsApp: ${phoneNumber}', 20, doc.internal.pageSize.getHeight() - 30);
              doc.text('Generated: ${timestamp}', 20, doc.internal.pageSize.getHeight() - 18);
              doc.save('Team4Stack-AdmissionForm.pdf');
            }
          });
        }
          </script>
        </body></html>`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(summaryHtml);
        w.document.close();
      }

      // Open WhatsApp with prefilled message
      window.open(waURL, '_blank');
      
      // Reset form
      reset();
      setPaymentScreenshot(null);
      setFileError(null);
    } catch (error) {
      devError('Form submission error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Admission <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Form</span>
          </h1>
          <p className="text-xl text-gray-300">
            Fill out the form below to apply for our courses
          </p>
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold mb-6 text-white text-center">Admission Form</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-white mb-2">
                  Father Name
                </label>
                <input
                  type="text"
                  id="fatherName"
                  {...register('fatherName', { 
                    required: 'Father name is required',
                    minLength: { value: 2, message: 'Father name must be at least 2 characters' }
                  })}
                  className={`form-input ${errors.fatherName ? 'border-red-500' : ''}`}
                  placeholder="Your father name"
                  aria-invalid={!!errors.fatherName}
                  aria-describedby={errors.fatherName ? "fatherName-error" : undefined}
                />
                {errors.fatherName && (
                  <p id="fatherName-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.fatherName.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9+\-\s()]{10,15}$/, message: 'Please enter a valid phone number' }
                  })}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="03xx-xxxxxxx"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                  })}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Gender and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  {...register('gender', { required: 'Gender is required' })}
                  className={`form-input ${errors.gender ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.gender}
                  aria-describedby={errors.gender ? "gender-error" : undefined}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p id="gender-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.gender.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-white mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  {...register('age', { 
                    required: 'Age is required',
                    min: { value: 13, message: 'Must be at least 13 years old' },
                    max: { value: 100, message: 'Must be less than 100 years old' },
                    valueAsNumber: true
                  })}
                  min="13"
                  max="100"
                  step="1"
                  className={`form-input ${errors.age ? 'border-red-500' : ''}`}
                  placeholder="Your age"
                  aria-invalid={!!errors.age}
                  aria-describedby={errors.age ? "age-error" : undefined}
                />
                {errors.age && (
                  <p id="age-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.age.message}</p>
                )}
              </div>
            </div>

            {/* Address Row */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="form-input"
                placeholder="House/Street, Area, City, Postal Code"
              />
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-white mb-2">
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                {...register('courseName', { 
                  required: 'Course name is required'
                })}
                className={`form-input ${errors.courseName ? 'border-red-500' : ''}`}
                placeholder="Which course are you interested in?"
                aria-invalid={!!errors.courseName}
                aria-describedby={errors.courseName ? "courseName-error" : undefined}
              />
                {errors.courseName && (
                  <p id="courseName-error" className="mt-1 text-xs sm:text-sm text-red-500 break-words">{errors.courseName.message}</p>
                )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                className="form-input"
                placeholder="Tell us about your project or any questions you have..."
              />
            </div>

            <div>
              <label htmlFor="paymentScreenshot" className="form-label">Payment Screenshot *</label>
              <input
                id="paymentScreenshot"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className={`form-input ${fileError ? 'border-red-500' : ''}`}
                required
              />
              {fileError && (
                <p className="mt-1 text-red-500 text-xs md:text-sm">{fileError}</p>
              )}
              <p className="mt-1 text-gray-400 text-xs md:text-sm">Attach payment screenshot (JPG, PNG, WebP, max 2MB)</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="admission-submit-btn w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ color: '#ffffff' }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span style={{ color: '#ffffff' }}>Submitting...</span>
                </>
              ) : (
                <span style={{ color: '#ffffff' }}>Submit Form</span>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Custom Sign In Prompt Popup */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-scale-in pointer-events-auto border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">Please Sign In First</p>
                <p className="text-sm text-white/90">You must be signed in to submit the contact form.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionForm;

