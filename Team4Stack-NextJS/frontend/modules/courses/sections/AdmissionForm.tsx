'use client'

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { coursesApi } from '@/lib/api';
import { CONTACT_PHONE_NUMBERS, CONTACT_EMAIL, getWhatsAppUrl } from '@/lib/utils/constants';
import { devError } from '@/lib/utils/devUtils';
import { useAuth } from '@/contexts/AuthContext';

// Define the form data types
interface FormData {
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  cnic: string; // CNIC - required field
  address: string;
  courseName: string; // Required course
  courseName2: string; // Optional course
  /** Gender - required field */
  gender: string;
  /** Date of Birth - required field */
  dateOfBirth: string;
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
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: number; title: string }>>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [rejectedCourses, setRejectedCourses] = useState<Set<string>>(new Set());
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      fatherName: '',
      phone: '',
      email: '',
      cnic: '',
      address: '',
      courseName: '', // Required
      courseName2: '', // Optional
      // Gender and date of birth are required fields
      gender: '',
      dateOfBirth: ''
    }
  });

  // Watch selected courses to filter dropdowns
  const selectedCourse1 = watch('courseName');
  const selectedCourse2 = watch('courseName2');

  // Load available courses from Supabase and enrolled courses for logged-in user
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        
        // Load all courses
        const result = await coursesApi.getAllCourses();

        if (result.error) {
          console.error('Error loading courses:', result.error);
          setAvailableCourses([]);
        } else if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          setAvailableCourses(result.data.map((c: any) => ({ id: c.id, title: c.title || c.name })));
        } else {
          // Fallback to default courses if no courses in database
          setAvailableCourses([
            { id: 1, title: 'Physical Training (WE Connect)' },
            { id: 2, title: 'Online Training' }
          ]);
        }
        
        // Load enrolled and rejected courses for logged-in user
        if (user && user.email) {
          const result = await coursesApi.getAdmissionForms({
            email: user.email.toLowerCase().trim()
          });
          
          if (result.error) {
            console.error('Error loading admission forms:', result.error);
            // Continue without blocking - user can still submit new applications
          }
          
          const applicationData = Array.isArray(result.data) ? result.data : [];
          if (applicationData && applicationData.length > 0) {
            const enrolled = new Set<string>();
            const rejected = new Set<string>();
            
            applicationData.forEach((app: any) => {
              const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined;
              
              if (hasNewApprovals) {
                // New system: check per-course approvals
                if (app.course_name?.trim()) {
                  if (app.approved_1 === true) {
                    enrolled.add(app.course_name.trim());
                  } else if (app.approved_1 === false) {
                    // Course is rejected - add to rejected set
                    rejected.add(app.course_name.trim());
                  }
                }
                if (app.course_name_2?.trim()) {
                  if (app.approved_2 === true) {
                    enrolled.add(app.course_name_2.trim());
                  } else if (app.approved_2 === false) {
                    // Course is rejected - add to rejected set
                    rejected.add(app.course_name_2.trim());
                  }
                }
              } else {
                // Old system
                if (app.course_name?.trim()) {
                  if (app.approved === true) {
                    enrolled.add(app.course_name.trim());
                  } else if (app.approved === false) {
                    // Course is rejected - add to rejected set
                    rejected.add(app.course_name.trim());
                  }
                }
              }
            });
            
            setEnrolledCourses(enrolled);
            setRejectedCourses(rejected);
          }
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setAvailableCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [user]);
  
  // Filter courses for dropdowns - exclude already selected, enrolled, and rejected courses
  const getFilteredCourses = (excludeCourse?: string) => {
    return availableCourses.filter(course => {
      const courseTitle = course.title.trim().toLowerCase();
      const excludeTitle = excludeCourse?.trim().toLowerCase();
      
      // Exclude if already enrolled (case-insensitive)
      for (const enrolled of enrolledCourses) {
        if (enrolled.toLowerCase() === courseTitle) return false;
      }
      
      // Exclude if rejected (case-insensitive)
      for (const rejected of rejectedCourses) {
        if (rejected.toLowerCase() === courseTitle) return false;
      }
      
      // Exclude if already selected in another dropdown (case-insensitive)
      if (excludeTitle && courseTitle === excludeTitle) return false;
      
      return true;
    });
  };
  
  // Get filtered courses for required dropdown
  const requiredCourses: Array<{ id: number; title: string }> = getFilteredCourses();
  
  // Get filtered courses for optional dropdown (exclude selected required course)
  const optionalCourses: Array<{ id: number; title: string }> = getFilteredCourses(selectedCourse1);

  // Prefill course name from selection (set by Courses Book Now)
  useEffect(() => {
    try {
      const sel = localStorage.getItem('selectedCourse');
      if (sel) {
        setValue('courseName', sel);
        localStorage.removeItem('selectedCourse');
      }
    } catch {}
  }, [setValue, availableCourses]);

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
    
    // Date of Birth validation
    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (actualAge < 13) {
        newErrors.dateOfBirth = 'Must be at least 13 years old';
      } else if (actualAge > 100) {
        newErrors.dateOfBirth = 'Must be less than 100 years old';
      } else if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    
    // Course name validation - first course is required and must be a valid course (not empty/placeholder)
    if (!data.courseName.trim() || data.courseName.trim() === '') {
      newErrors.courseName = 'Course name is required';
    } else {
      // Check if selected course is actually available (not just placeholder)
      // Recalculate filtered courses for validation
      const validRequiredCourses = getFilteredCourses();
      const isValidCourse = validRequiredCourses.some(c => c.title.trim() === data.courseName.trim());
      if (!isValidCourse) {
        newErrors.courseName = 'Please select a valid course';
      }
    }
    // Optional course validation - if selected, must be different from required course and valid
    if (data.courseName2 && data.courseName2.trim()) {
      if (data.courseName2.trim() === data.courseName.trim()) {
        newErrors.courseName2 = 'Optional course must be different from required course';
      } else {
        // Recalculate filtered courses for validation (exclude selected required course)
        const validOptionalCourses = getFilteredCourses(data.courseName);
        const isValidOptionalCourse = validOptionalCourses.some(c => c.title.trim() === data.courseName2.trim());
        if (!isValidOptionalCourse) {
          newErrors.courseName2 = 'Please select a valid optional course';
        }
      }
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
        cnic: sanitizeInput(data.cnic),
        address: sanitizeInput(data.address),
        courseName: sanitizeInput(data.courseName),
        courseName2: data.courseName2 ? sanitizeInput(data.courseName2) : '',
        gender: data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : 'Other',
        dateOfBirth: data.dateOfBirth || ''
      };
      
      // Store data via API (image is NOT uploaded, only flag is saved)
      const result = await coursesApi.createAdmissionForm({
        name: sanitizedData.name,
        father_name: sanitizedData.fatherName,
        phone: sanitizedData.phone,
        email: sanitizedData.email,
        cnic: sanitizedData.cnic,
        address: sanitizedData.address,
        course_name: sanitizedData.courseName,
        course_name_2: sanitizedData.courseName2 || null,
        gender: sanitizedData.gender,
        date_of_birth: sanitizedData.dateOfBirth,
        image_attached: !!paymentScreenshot, // Store flag only, not the image
        viewed: false
      });
      
      if (result.error) {
        // No sensitive info in logs
        throw new Error('Failed to store data in database');
      }
      
      // Generate printable summary
      const lines = [
        `Name: ${sanitizedData.name}`,
        `Father Name: ${sanitizedData.fatherName}`,
        `Phone: ${sanitizedData.phone}`,
        `Email: ${sanitizedData.email}`,
        `CNIC: ${sanitizedData.cnic}`,
        `Address: ${sanitizedData.address}`,
        `Gender: ${sanitizedData.gender}`,
        `Date of Birth: ${sanitizedData.dateOfBirth}`,
        `Course: ${sanitizedData.courseName}`,
      ];
      const phoneNumber = CONTACT_PHONE_NUMBERS.primary;
      const timestamp = new Date().toLocaleString();
      const extraNote = encodeURIComponent('Please attach the PDF you downloaded from the website along with the payment screenshot.');
      const msgEncoded = `New Course Inquiry%0AName: ${encodeURIComponent(sanitizedData.name)}%0AFather Name: ${encodeURIComponent(sanitizedData.fatherName)}%0APhone: ${encodeURIComponent(sanitizedData.phone)}%0AEmail: ${encodeURIComponent(sanitizedData.email)}%0AAddress: ${encodeURIComponent(sanitizedData.address)}%0AGender: ${encodeURIComponent(sanitizedData.gender)}%0ADate of Birth: ${encodeURIComponent(sanitizedData.dateOfBirth)}%0ACourse: ${encodeURIComponent(sanitizedData.courseName)}%0A%0A${extraNote}`;
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0b1226] to-[#060b18] pt-20 md:pt-28 pb-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
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
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      <div className="container-custom max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-white/80 font-medium">Course Application</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
            Admission <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Form</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join our MERN Stack training program. Fill out the form below to start your journey
          </p>
        </div>

        {/* Modern Glassmorphism Card */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 overflow-hidden w-full">
          {/* Animated background elements behind card */}
          <div className="absolute -inset-4 -z-10 overflow-hidden pointer-events-none">
            {/* Floating orbs */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Animated gradient lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-shimmer"></div>
            <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-shimmer" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Card gradient overlay with animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none animate-gradient-shift"></div>
          
          {/* Card content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Personal Information</h3>
                <p className="text-sm text-gray-400 mt-1">Please provide your details below</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.name ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="fatherName" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Father Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="fatherName"
                  {...register('fatherName', { 
                    required: 'Father name is required',
                    minLength: { value: 2, message: 'Father name must be at least 2 characters' }
                  })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.fatherName ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.fatherName ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                  placeholder="Enter your father's name"
                  aria-invalid={!!errors.fatherName}
                  aria-describedby={errors.fatherName ? "fatherName-error" : undefined}
                />
                {errors.fatherName && (
                  <p id="fatherName-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.fatherName.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9+\-\s()]{10,15}$/, message: 'Please enter a valid phone number' }
                  })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.phone ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                  placeholder="03xx-xxxxxxx"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                  })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.email ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                  placeholder="your@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* CNIC Row */}
            <div>
              <label htmlFor="cnic" className="block text-sm font-semibold text-white/90 mb-2.5">
                CNIC Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="cnic"
                {...register('cnic', { 
                  required: 'CNIC number is required',
                  pattern: { 
                    value: /^(\d{5}-\d{7}-\d{1}|\d{13})$/, 
                    message: 'CNIC must be 13 digits (format: 12345-1234567-1)' 
                  }
                })}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.cnic ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.cnic ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                placeholder="12345-1234567-1"
                maxLength={15}
                aria-invalid={!!errors.cnic}
                aria-describedby={errors.cnic ? "cnic-error" : undefined}
              />
              {errors.cnic && (
                <p id="cnic-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.cnic.message}
                </p>
              )}
            </div>

            {/* Gender and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  id="gender"
                  {...register('gender', { required: 'Gender is required' })}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.gender ? 'border-red-500/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.gender ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                  aria-invalid={!!errors.gender}
                  aria-describedby={errors.gender ? "gender-error" : undefined}
                >
                  <option value="" className="bg-gray-800 text-white">Select Gender</option>
                  <option value="male" className="bg-gray-800 text-white">Male</option>
                  <option value="female" className="bg-gray-800 text-white">Female</option>
                  <option value="other" className="bg-gray-800 text-white">Other</option>
                </select>
                {errors.gender && (
                  <p id="gender-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-white/90 mb-2.5">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  {...register('dateOfBirth', { 
                    required: 'Date of birth is required'
                  })}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.dateOfBirth ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.dateOfBirth ? 'bg-red-500/10' : 'hover:bg-white/10'} [color-scheme:dark]`}
                  aria-invalid={!!errors.dateOfBirth}
                  aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                />
                {errors.dateOfBirth && (
                  <p id="dateOfBirth-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address Row */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-white/90 mb-2.5">
                Address
              </label>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm hover:bg-white/10"
                placeholder="House/Street, Area, City, Postal Code"
              />
            </div>

            <div>
              <label htmlFor="courseName" className="block text-sm font-semibold text-white/90 mb-2.5">
                Course Name <span className="text-red-400">*</span>
              </label>
              {loadingCourses ? (
                <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-white/70">Loading courses...</span>
                </div>
              ) : requiredCourses.length > 0 ? (
                  <select
                    id="courseName"
                    {...register('courseName', { 
                      required: 'Course name is required'
                    })}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.courseName ? 'border-red-500/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm ${errors.courseName ? 'bg-red-500/10' : 'hover:bg-white/10'}`}
                    aria-invalid={!!errors.courseName}
                    aria-describedby={errors.courseName ? "courseName-error" : undefined}
                  >
                    <option value="" className="bg-gray-800 text-white">Select a course (Required)</option>
                    {requiredCourses.map((course: { id: number; title: string }) => (
                      <option key={course.id} value={course.title} className="bg-gray-800 text-white">
                        {course.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed backdrop-blur-sm">
                    No courses available
                  </div>
                )}
              {errors.courseName && (
                <p id="courseName-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.courseName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="courseName2" className="block text-sm font-semibold text-white/90 mb-2.5">
                Second Course (Optional)
              </label>
              {loadingCourses ? (
                <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-white/70">Loading courses...</span>
                </div>
              ) : optionalCourses.length > 0 ? (
                <select
                  id="courseName2"
                  {...register('courseName2')}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.courseName2 ? 'border-red-500/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm hover:bg-white/10`}
                  aria-invalid={!!errors.courseName2}
                  aria-describedby={errors.courseName2 ? "courseName2-error" : undefined}
                >
                  <option value="" className="bg-gray-800 text-white">Select an optional course</option>
                  {optionalCourses.map((course: { id: number; title: string }) => (
                    <option key={course.id} value={course.title} className="bg-gray-800 text-white">
                      {course.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed backdrop-blur-sm">
                  No optional courses available
                </div>
              )}
              {errors.courseName2 && (
                <p id="courseName2-error" className="mt-2 text-xs sm:text-sm text-red-400 break-words flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.courseName2.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paymentScreenshot" className="block text-sm font-semibold text-white/90 mb-2.5">
                Payment Screenshot <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="paymentScreenshot"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${fileError ? 'border-red-500/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm hover:bg-white/10 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-500/30 ${fileError ? 'bg-red-500/10' : ''}`}
                  required
                />
              </div>
              {fileError && (
                <p className="mt-2 text-red-400 text-xs md:text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fileError}
                </p>
              )}
              <p className="mt-2 text-gray-400 text-xs md:text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Attach payment screenshot (JPG, PNG, WebP, max 2MB)
              </p>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="termsCheckbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer transition-all hover:border-cyan-400/50"
                required
              />
              <label htmlFor="termsCheckbox" className="text-sm text-white/90 cursor-pointer flex-1">
                I have read and agree to the <span className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">Terms and Conditions</span> of Team4Stack courses
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !acceptedTerms}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transform"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Application</span>
                </>
              )}
            </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Custom Sign In Prompt Popup */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-4">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-scale-in pointer-events-auto border border-white/20 backdrop-blur-sm max-w-md w-full">
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

// Add custom animations via style tag
if (typeof document !== 'undefined') {
  const styleId = 'admission-form-animations';
  if (!document.getElementById(styleId)) {
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
  }
}

