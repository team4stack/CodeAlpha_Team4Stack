import React, { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../../utils/supabaseClient';
import { CONTACT_PHONE_NUMBERS, CONTACT_EMAIL, getWhatsAppUrl } from '../../utils/constants';
import { devWarn, devError } from '../../utils/devUtils';
import { useAuth } from '../../auth';
import { useTheme } from '../../context/ThemeContext';

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

// Helper function to validate and convert Google Maps URL to embed format
const getEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // If it's already an embed URL, return as is
    if (url.includes('/embed') || url.includes('output=embed')) {
      return url;
    }
    
    // Handle Google Maps short URLs (maps.app.goo.gl)
    // Short URLs need to be converted to embed format
    if (urlObj.hostname.includes('maps.app.goo.gl') || urlObj.hostname.includes('goo.gl')) {
      // For short URLs, try to convert to embed format
      // Extract the short code from path
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length > 0) {
        const shortCode = pathParts[pathParts.length - 1];
        // Convert short URL to embed format using Google Maps embed API
        // Format: https://www.google.com/maps/embed?pb=...
        // We'll use the short URL directly with iframe, Google Maps handles it
        // But better approach: convert to full URL first
        // For now, return the short URL - it might work in iframe
        // Short URLs cannot be directly embedded - need embed URL
        return null;
      }
    }
    
    // If it's a regular Google Maps URL, try to convert it
    if (urlObj.hostname.includes('google.com') && urlObj.pathname.includes('/maps')) {
      // Handle /maps/place/ URLs - extract place name and coordinates
      if (urlObj.pathname.includes('/place/')) {
        // Extract place name from URL (e.g., /maps/place/We+Connect+Vehari/@30.0364947,72.3614507)
        const placeMatch = urlObj.pathname.match(/\/place\/([^/@]+)/);
        const coordMatch = urlObj.pathname.match(/@([^/]+)/);
        
        if (placeMatch && coordMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          const coords = coordMatch[1]; // e.g., "30.0364947,72.3614507,17z"
          const coordParts = coords.split(',');
          const lat = coordParts[0]?.trim();
          const lng = coordParts[1]?.trim();
          
          if (lat && lng) {
            // Convert to embed format using coordinates
            // Use standard Google Maps embed format (no API key needed)
            return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=17&output=embed`;
          }
        }
        
        // Fallback: use place name only
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          // Use standard Google Maps embed format with place name
          return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&z=17&output=embed`;
        }
      }
      
      // Extract query parameters
      const params = new URLSearchParams(urlObj.search);
      
      // If it has a 'q' parameter, convert to embed format
      if (params.has('q')) {
        return `https://www.google.com/maps?q=${encodeURIComponent(params.get('q') || '')}&hl=en&z=17&output=embed`;
      }
      
      // Try to convert with output=embed parameter
      const paramsWithEmbed = new URLSearchParams(urlObj.search);
      paramsWithEmbed.set('output', 'embed');
      paramsWithEmbed.set('hl', 'en');
      return `${urlObj.origin}${urlObj.pathname}?${paramsWithEmbed.toString()}`;
    }
    
    // For other map services, return as is
    return url;
  } catch {
    // Invalid URL - try to add output=embed as fallback
    try {
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
        return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
      }
    } catch {
      // Silent fail
    }
    return null;
  }
};

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Admin-controlled contact settings (from site_settings)
  const [contactSettings, setContactSettings] = useState<{
    address?: string;
    website?: string;
    phone?: string;
    mapSrc?: string;
    primaryName?: string;
    primaryTagline?: string;
    whatsapp?: string;
    socials?: Array<{ name: string; href: string }>;
  }>({});

  // Reset map error when mapSrc changes (from admin panel)
  useEffect(() => {
    if (contactSettings.mapSrc) {
      setMapError(false);
    }
  }, [contactSettings.mapSrc]);

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

  // Load admin settings from site_settings (keys prefixed contact_*) with realtime updates
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key,value')
          .in('key', [
            'contact_address',
            'contact_website',
            'contact_phone',
            'contact_map_src',
            'contact_primary_name',
            'contact_primary_tagline',
            'contact_whatsapp',
            'contact_socials_json'
          ]);
        if (!error && data) {
          const kv: Record<string, string> = Object.fromEntries((data as any[]).map(r => [r.key, r.value]));
          let socials: Array<{ name: string; href: string }> = [];
          try { socials = kv['contact_socials_json'] ? JSON.parse(kv['contact_socials_json']) : []; } catch {}
          setContactSettings({
            address: kv['contact_address'] || undefined,
            website: kv['contact_website'] || undefined,
            phone: kv['contact_phone'] || undefined,
            mapSrc: kv['contact_map_src'] || undefined,
            primaryName: kv['contact_primary_name'] || undefined,
            primaryTagline: kv['contact_primary_tagline'] || undefined,
            whatsapp: kv['contact_whatsapp'] || undefined,
            socials
          });
        } else {
          setContactSettings({});
        }
      } catch {
        setContactSettings({});
      }
    };
    load();
    const channel = supabase
      .channel('site_settings_contact_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => load())
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, []);

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
          <a class='btn' href='${window.location.origin}/#contact' onclick='try{if(window.opener){window.opener.focus();}}catch(e){}; setTimeout(()=>window.close(),300); return true;'>Back to Website</a>
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

  const openWhatsApp = () => {
    const phoneNumber = contactSettings.whatsapp || CONTACT_PHONE_NUMBERS.primary;
    const message = 'Hello Team4Stack! I would like to contact your team for support/inquiry.';
    const whatsappUrl = getWhatsAppUrl(phoneNumber, message);
    window.open(whatsappUrl, '_blank');
  };

  const teamMembers = [
    {
      name: 'M. Sami Ullah Khan',
      role: 'Full Stack Manager & Team Lead',
      specialization:
        'Full stack manager responsible for system architecture, code reviews, deployments, and client communication. Leads Team4Stack projects end‑to‑end and mentors the team.',
      github: 'https://github.com/Sami3234',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[0],
      isLeader: true
    },
    {
      name: 'Muhammad Hasnain',
      role: 'Full Stack Developer',
      specialization:
        'Frontend design management: UI/UX alignment, responsive layouts, component library, and structure planning for React + Tailwind. Also owns API integration plans and DB schema coordination for features.',
      github: 'https://github.com/hasnain17576',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[1],
      isLeader: false
    },
    {
      name: 'M. Aftab Akram',
      role: 'Full Stack Developer & Account Manager',
      specialization:
        'Operations focus: manages Team4Stack social media, prepares invoices and tracks payments (accountant manager), maintains project documentation, assists with deployments/monitoring, and coordinates internal handoffs between Dev and QA.',
      github: 'https://github.com/Aftab272/Aftab272',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[2],
      isLeader: false
    },
    {
      name: 'Fiaz Ahmad',
      role: 'Full Stack Developer & QA Lead',
      specialization:
        'Testing management and QA: project passing checks, quality assurance, bug triage, and release readiness. Ensures performance, accessibility and best practices.',
      github: 'https://github.com/fiaz32304',
      whatsapp: CONTACT_PHONE_NUMBERS.teamMembers[3],
      isLeader: false
    }
  ];

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-gray-900 to-black">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Touch</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to start your next MERN stack project? Contact our team leader or send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Location + Primary Contact Cards */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Physical Location Card (WE Connect) */}
          <div className="card text-white">
            <h3 className="text-2xl font-bold mb-4">WE Connect – Physical Location</h3>
            <p className="text-white/80 mb-4">Visit us for on-site MERN physical training and project discussions.</p>
            {(contactSettings.mapSrc || contactSettings.address || contactSettings.website || contactSettings.phone) ? (
              <>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  {contactSettings.mapSrc && !mapError ? (
                    (() => {
                      const embedUrl = getEmbedUrl(contactSettings.mapSrc);
                      const isShortUrl = contactSettings.mapSrc.includes('maps.app.goo.gl') || contactSettings.mapSrc.includes('goo.gl');
                      
                      if (!embedUrl) {
                        return (
                          <div className="w-full h-64 flex flex-col items-center justify-center text-white/70 gap-3 p-4">
                            {isShortUrl ? (
                              <>
                                <svg className="w-12 h-12 text-yellow-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-center font-semibold">Short Google Maps URL Detected</p>
                                <p className="text-sm text-center text-white/60 max-w-md">
                                  Short URLs (maps.app.goo.gl) cannot be embedded directly.
                                </p>
                                <p className="text-xs text-center text-white/50 max-w-md">
                                  To fix: Open map → Share → Embed a map → Copy iframe src URL → Use that in admin panel
                                </p>
                              </>
                            ) : (
                              <p>Invalid map URL format. Please use a valid Google Maps embed URL.</p>
                            )}
                          </div>
                        );
                      }
                      return (
                        <iframe
                          title="WE Connect Location"
                          src={embedUrl}
                          className="w-full h-64"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                          onError={() => {
                            setMapError(true);
                          }}
                        />
                      );
                    })()
                  ) : mapError ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-white/70 gap-2">
                      <p>Map could not be loaded</p>
                      <p className="text-xs text-white/50">Please check the map URL in admin panel</p>
                    </div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-white/70">No map available</div>
                  )}
                </div>
                <div className="mt-4 space-y-1 text-sm text-white/80">
                  <p><span className="font-semibold text-white">Address:</span> {contactSettings.address || 'No data available'}</p>
                  <p><span className="font-semibold text-white">Website:</span> {contactSettings.website ? (<a href={contactSettings.website} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{(contactSettings.website || '').replace(/^https?:\/\//,'')}</a>) : 'No data available'}</p>
                  <p><span className="font-semibold text-white">Phone:</span> {contactSettings.phone ? (<a href={`tel:${contactSettings.phone}`} className="hover:underline text-blue-300">{contactSettings.phone}</a>) : 'No data available'}</p>
                </div>
                {contactSettings.mapSrc && (
                  <a
                    href={contactSettings.mapSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-maps-btn w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2 mt-4"
                    style={{ color: '#ffffff' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ffffff' }}><path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z"/><path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>
                    <span style={{ color: '#ffffff' }}>Open in Google Maps</span>
                  </a>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-white/10 p-6 text-center text-white/70">No data available</div>
            )}
          </div>

          {/* Primary Contact Card */}
          <div className="card text-white bg-gradient-to-r from-purple-600 to-blue-600 text-center flex flex-col items-center justify-center min-h-[300px] py-6">
            <h3 className="text-2xl font-bold mb-4">Primary Contact</h3>
            {(contactSettings.primaryName || contactSettings.primaryTagline || contactSettings.whatsapp) ? (
              <>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div className="text-left">
                    <h4 className="text-xl font-semibold">{contactSettings.primaryName || 'No data available'}</h4>
                    <p className="text-white/80">{contactSettings.primaryTagline || 'No data available'}</p>
                  </div>
                </div>
                {contactSettings.whatsapp ? (
                  <button onClick={openWhatsApp} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                                <path d="M12.004 22.785h-.005A9.87 9.87 0 016.968 21.41l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 011.12 12C1.121 6.55 5.555 2.116 11.007 2.116a9.88 9.88 0 019.885 9.888c-.003 5.45-4.437 9.884-9.888 9.884z"/>
                              </svg>
                    <span>Chat on WhatsApp</span>
                  </button>
                ) : (
                  <div className="text-white/80">No WhatsApp available</div>
                )}
              </>
            ) : (
              <div className="text-white/80">No data available</div>
            )}
            {contactSettings.socials && contactSettings.socials.length > 0 && (
              <>
                <p className="mt-6 text-white/80 text-sm">Connect with us on social media</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  {contactSettings.socials.map((s, idx) => {
                    const slugMap: Record<string,string> = {
                      'Facebook': 'facebook', 'Instagram': 'instagram', 'Twitter/X': 'x', 'LinkedIn': 'linkedin', 'YouTube': 'youtube', 'GitHub': 'github',
                      'WhatsApp': 'whatsapp', 'Telegram': 'telegram', 'TikTok': 'tiktok', 'Snapchat': 'snapchat', 'Pinterest': 'pinterest', 'Reddit': 'reddit',
                      'Medium': 'medium', 'Discord': 'discord', 'Fiverr': 'fiverr', 'Upwork': 'upwork', 'Freelancer': 'freelancer', 'PeoplePerHour': 'peopleperhour',
                      'Guru': 'guru', 'Toptal': 'toptal', 'FlexJobs': 'flexjobs', '99designs': '99designs', 'Upstack': 'upstack', 'SimplyHired': 'simplyhired'
                    };
                    const slug = slugMap[s.name as keyof typeof slugMap];
                    const iconUrl = slug ? `https://cdn.simpleicons.org/${slug}` : '';
                    return (
                      <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20">
                        {slug ? (
                          <img src={iconUrl} alt={s.name} className="w-5 h-5" loading="lazy" />
                        ) : (
                          <span className="text-xs text-white/80">{s.name?.charAt(0)}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Contact Form */}
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
    </section>
  );
};

export default Contact;