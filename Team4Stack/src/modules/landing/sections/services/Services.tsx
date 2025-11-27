import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { CONTACT_PHONE_NUMBERS, FIVERR_PROFILE_URL } from '../../../../utils/constants';
import { supabase } from '../../../../utils/supabaseClient';

// Handle ESC key for modal
const useEscapeKey = (callback: () => void, isActive: boolean) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        callback();
      }
    };
    if (isActive) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isActive, callback]);
};

const Services: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [dbServices, setDbServices] = useState<Array<{ id: string; title: string; description?: string; image_url?: string; emoji?: string; gradient_color?: string; contact?: string }>>([]);
  const [selectedService, setSelectedService] = useState<{ id: string; title: string; description?: string; emoji?: string; gradient_color?: string; contact?: string } | null>(null);

  useEffect(() => {
    // Always try Supabase first; fallback to static grid if empty/error
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id,title,description,image_url,emoji,gradient_color,active,order_index,contact')
          .eq('active', true)
          .order('order_index', { ascending: true, nullsFirst: false })
          .order('id', { ascending: false });
        if (!error && data) {
          setDbServices(data as any);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
        console.error('Error loading services:', err);
        }
      }
    };

    loadServices();

    // Real-time subscription for services changes
    const channel = supabase
      .channel('services-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'services' },
        () => {
          loadServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle ESC key for modal
  useEscapeKey(() => setSelectedService(null), !!selectedService);

  const openWhatsApp = (serviceTitle?: string, contactNumber?: string) => {
    const number = contactNumber || CONTACT_PHONE_NUMBERS.primary;
    const msg = serviceTitle 
      ? `Hello Team4Stack! I'm interested in your ${serviceTitle} service.`
      : 'Hello Team4Stack! I want to discuss MERN services/courses.';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const fiverrHref = FIVERR_PROFILE_URL; // TODO: replace with real Fiverr Gig link later

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M9 3h6v4H9z" />
        </svg>
      ),
      title: 'MERN Stack Websites',
      description: 'Custom full-stack websites (React, Node.js, Express, MongoDB) with modern UI and secure auth.',
      features: ['Responsive UI', 'Secure Auth (JWT/OAuth)', 'Admin Dashboard', 'Deployment (Vercel/Render)']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
        </svg>
      ),
      title: 'Physical MERN Courses',
      description: 'Hands-on classes at WE Connect with real projects, code reviews, and mentorship.',
      features: ['3 Months Program', 'Project Based', 'Certificate', 'Career Guidance']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618V15.5a1 1 0 01-1.447.894L15 14M4 6h8m-8 4h8m-8 4h5" />
        </svg>
      ),
      title: 'Online MERN Courses',
      description: 'Live online classes with recordings, assignments, and support community.',
      features: ['4 Months Program', 'Live + Recordings', 'Assignments', 'Q&A Support']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Portfolio Building',
      description: 'Personal portfolio websites and GitHub/readme setup to showcase your MERN skills.',
      features: ['Personal Branding', 'Live Projects', 'GitHub Optimization', 'Resume Ready']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7l1.5 9.5A2 2 0 008.47 18h7.06a2 2 0 001.97-1.5L19 7M7 7l1-3h8l1 3M7 21h2m6 0h2" />
        </svg>
      ),
      title: 'Shop/Business Software',
      description: 'Custom software for shops (e.g., mobile shops) and businesses: POS, inventory, billing, users, and reports.',
      features: ['POS & Billing', 'Inventory/Stock', 'Customers & Suppliers', 'Reports & Exports']
    },
  ];

  // Structured Data for SEO
  const servicesStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Web Development Services",
    "provider": {
      "@type": "Organization",
      "name": "Team4Stack",
      "url": "https://team4stack.com/"
    },
    "serviceList": services.map(service => ({
      "@type": "Service",
      "name": service.title,
      "description": service.description
    }))
  };

  return (
    <section id="services" className={`section-padding ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-white'}`}>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(servicesStructuredData)}
      </script>
      
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Our Services
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Everything MERN — websites, courses, and portfolios.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {[
            {
              title: 'Fully Responsive for all devices',
              description: 'Our applications work seamlessly across all devices and screen sizes',
              icon: (
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </div>
              ),
              borderColor: 'border-red-500'
            },
            {
              title: 'SEO Friendly and optimized',
              description: 'Built with SEO best practices to ensure maximum visibility',
              icon: (
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              ),
              borderColor: 'border-orange-500'
            },
            {
              title: 'Super fast and secure',
              description: 'Lightning-fast performance with enterprise-grade security',
              icon: (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              ),
              borderColor: 'border-blue-500'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="flex justify-center mb-6">
                <div className={`relative ${feature.borderColor} border-2 rounded-full p-2 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Services Section */}
        <div className="text-center mb-12">
          <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>What We Offer</h3>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Everything MERN — from apps to training</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dbServices.length > 0 ? dbServices.map((s) => {
            // Default emoji fallback based on title
            const getDefaultEmoji = (title: string) => {
              const titleLower = title.toLowerCase();
              if (titleLower.includes('website') || titleLower.includes('mern')) return '≡ƒîÉ';
              if (titleLower.includes('physical')) return '≡ƒÅ½';
              if (titleLower.includes('online')) return '≡ƒÆ╗';
              if (titleLower.includes('portfolio')) return '≡ƒº⌐';
              if (titleLower.includes('shop') || titleLower.includes('business')) return '≡ƒ¢Æ';
              if (titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('design')) return '≡ƒÄ¿';
              if (titleLower.includes('qa') || titleLower.includes('test')) return '≡ƒº¬';
              if (titleLower.includes('devops') || titleLower.includes('deployment')) return '≡ƒÜÇ';
              return '🚀';
            };
            // Default gradient fallback
            const getDefaultGradient = (title: string) => {
              const titleLower = title.toLowerCase();
              if (titleLower.includes('website') || titleLower.includes('mern')) return 'from-blue-500 to-cyan-500';
              if (titleLower.includes('physical')) return 'from-purple-500 to-pink-500';
              if (titleLower.includes('online')) return 'from-green-500 to-emerald-500';
              if (titleLower.includes('portfolio')) return 'from-orange-500 to-red-500';
              if (titleLower.includes('shop') || titleLower.includes('business')) return 'from-fuchsia-500 to-violet-500';
              if (titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('design')) return 'from-rose-500 to-purple-500';
              if (titleLower.includes('qa') || titleLower.includes('test')) return 'from-teal-500 to-emerald-500';
              if (titleLower.includes('devops') || titleLower.includes('deployment')) return 'from-sky-500 to-indigo-500';
              return 'from-purple-500 to-blue-500';
            };
            return {
              title: s.title,
              icon: s.emoji || getDefaultEmoji(s.title),
              color: s.gradient_color || getDefaultGradient(s.title),
              description: s.description
            };
          }).map((service, index) => {
            const serviceData = dbServices[index];
            return (
              <div 
                key={index} 
                className="card text-center group p-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedService({
                  id: serviceData.id,
                  title: service.title,
                  description: service.description,
                  emoji: serviceData.emoji,
                  gradient_color: serviceData.gradient_color,
                  contact: serviceData.contact
                })}
              >
              <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{service.title}</h4>
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No services available at the moment.
              </p>
            </div>
          )}
        </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedService(null)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full p-6 relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                {selectedService.emoji && (
                  <div className={`w-16 h-16 bg-gradient-to-r ${selectedService.gradient_color || 'from-purple-500 to-blue-500'} rounded-full flex items-center justify-center text-3xl flex-shrink-0`}>
                    {selectedService.emoji}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedService.title}</h3>
                </div>
              </div>
              
              {selectedService.description && (
                <div className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedService.description}
                </div>
              )}
              
              <div className="mt-6">
                <button 
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  onClick={() => {
                    openWhatsApp(selectedService.title, selectedService.contact);
                    setSelectedService(null);
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.446-.52c.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52l-.916-2.207c-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.712.308 1.27.49 1.702.627.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413a.93.93 0 00-.57-.347z"/>
                    <path d="M12.004 22.785h-.005A9.87 9.87 0 016.968 21.41l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 011.12 12C1.121 6.55 5.555 2.116 11.007 2.116a9.88 9.88 0 019.885 9.888c-.003 5.45-4.437 9.884-9.888 9.884z"/>
                  </svg>
                  Make a Service Request
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      </div>
    </section>
  );
};

export default Services;
