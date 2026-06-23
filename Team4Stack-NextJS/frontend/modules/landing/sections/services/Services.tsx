'use client'

import React, { useEffect, useState } from 'react'
import { CONTACT_PHONE_NUMBERS } from '@/lib/utils/constants'
import { COURSE_ACCENT_GRADIENT_SHORT } from '@/lib/utils/courseTheme'
import {
  FALLBACK_CATALOG_SERVICES,
  getServiceTheme,
  mapApiServiceToCatalog,
  normalizeServiceTitle,
  prepareCatalogServices,
  type EnrichedCatalogService,
} from './serviceCatalog'
import './Services.css'

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
  const [dbServices, setDbServices] = useState<EnrichedCatalogService[]>([])
  const [selectedService, setSelectedService] = useState<EnrichedCatalogService | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getServices()
        if (Array.isArray(result.data)) {
          const activeServices = result.data
            .filter((s: { active?: boolean }) => s.active !== false)
            .sort((a: { order_index?: number; id?: number }, b: { order_index?: number; id?: number }) => {
              if (a.order_index !== b.order_index) {
                return (a.order_index || 0) - (b.order_index || 0)
              }
              return (a.id || 0) - (b.id || 0)
            })
            .map((service) => mapApiServiceToCatalog(service))

          const catalog = prepareCatalogServices(
            activeServices.length > 0 ? activeServices : FALLBACK_CATALOG_SERVICES
          )

          setDbServices(catalog)
        } else {
          setDbServices(prepareCatalogServices(FALLBACK_CATALOG_SERVICES))
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading services:', err)
        }
        setDbServices(prepareCatalogServices(FALLBACK_CATALOG_SERVICES))
      }
    }

    loadServices()
  }, [])

  // Handle ESC key for modal
  useEscapeKey(() => setSelectedService(null), !!selectedService);

  const openWhatsApp = (serviceTitle?: string, contactNumber?: string) => {
    const number = contactNumber || CONTACT_PHONE_NUMBERS.primary
    const label = serviceTitle ? normalizeServiceTitle(serviceTitle) : ''
    const msg = label
      ? `Hello Team4Stack! I'm interested in your ${label} service.`
      : 'Hello Team4Stack! I want to discuss MERN services/courses.'
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const catalogForSchema =
    dbServices.length > 0 ? dbServices : prepareCatalogServices(FALLBACK_CATALOG_SERVICES)

  const servicesStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Team4Stack Services',
    description:
      'MERN development, Shopify, Figma & Canva design, WordPress, training, and business software by Team4Stack.',
    itemListElement: catalogForSchema.map((service, index) => ({
      '@type': 'Service',
      position: index + 1,
      name: normalizeServiceTitle(service.title),
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: 'Team4Stack',
        url: 'https://www.team4stack.com/',
      },
    })),
  }

  const servicesFaqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services does Team4Stack provide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Team4Stack provides MERN stack website development, online and physical MERN training, portfolio building, and custom business software solutions."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide both online and physical MERN courses?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Team4Stack offers both online and physical MERN training with practical projects, assignments, and mentorship."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact Team4Stack for a project?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact Team4Stack through WhatsApp or the website contact section to discuss your project requirements."
        }
      }
    ]
  };

  return (
    <section id="services" className="home-services section-padding relative overflow-hidden">
      <div className="home-services__backdrop" aria-hidden>
        <div className="home-services__mesh" />
        <div className="home-services__glow home-services__glow--left" />
        <div className="home-services__glow home-services__glow--right" />
        <div className="home-services__grid-bg" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesFaqStructuredData) }}
      />

      <div className="container-custom relative z-10">
        <header className="home-services__header">
          <h2 className="home-services__title">
            Our{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${COURSE_ACCENT_GRADIENT_SHORT}`}>
              Services
            </span>
          </h2>
          <p className="home-services__subtitle">
            Everything MERN — full-stack websites, Shopify & WordPress, Figma & Canva design,
            courses, portfolios, and custom business software.
          </p>
        </header>

        <div className="home-services__cards">
          {dbServices.length > 0 ? (
            dbServices.map((serviceData) => {
              const theme = getServiceTheme(serviceData.title)
              const Icon = theme.Icon

              return (
                <button
                  key={serviceData.id}
                  type="button"
                  className={`home-services__card home-services__card--${theme.variant}`}
                  onClick={() => setSelectedService(serviceData)}
                >
                  <div className="home-services__card-watermark" aria-hidden>
                    <Icon />
                  </div>
                  <div className="home-services__card-shade" aria-hidden />

                  <div className="home-services__card-content">
                    <div className="home-services__card-top">
                      <div className="home-services__card-icon">
                        <Icon aria-hidden />
                      </div>
                      <span className="home-services__card-tag">{theme.category}</span>
                    </div>

                    <h4 className="home-services__card-title">{serviceData.title}</h4>
                    <p className="home-services__card-desc">{serviceData.description}</p>

                    <div className="home-services__card-chips">
                      {serviceData.highlights.map((item) => (
                        <span key={item} className="home-services__card-chip">
                          {item}
                        </span>
                      ))}
                    </div>

                    <span className="home-services__card-cta">Explore service</span>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="home-services__empty">No services available at the moment.</p>
          )}
        </div>

        {selectedService && (() => {
          const modalTheme = getServiceTheme(selectedService.title)
          const ModalIcon = modalTheme.Icon

          return (
          <>
            <div
              className="home-services__modal-backdrop"
              onClick={() => setSelectedService(null)}
              aria-hidden
            />
            <div className="home-services__modal" role="dialog" aria-modal="true" aria-label={selectedService.title}>
              <div
                className="home-services__modal-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="home-services__modal-close"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="home-services__modal-head">
                  <div className={`home-services__modal-icon home-services__modal-icon--${modalTheme.variant}`}>
                    <ModalIcon aria-hidden />
                  </div>
                  <div>
                    <span className="home-services__modal-tag">{modalTheme.category}</span>
                    <h3 className="home-services__modal-title">{selectedService.title}</h3>
                  </div>
                </div>

                {selectedService.description ? (
                  <p className="home-services__modal-desc">{selectedService.description}</p>
                ) : null}

                <button
                  type="button"
                  className="home-services__modal-cta"
                  onClick={() => {
                    openWhatsApp(selectedService.title, selectedService.contact)
                    setSelectedService(null)
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606l.446-.52c.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52l-.916-2.207c-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.712.308 1.27.49 1.702.627.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413a.93.93 0 00-.57-.347z" />
                    <path d="M12.004 22.785h-.005A9.87 9.87 0 016.968 21.41l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 011.12 12C1.121 6.55 5.555 2.116 11.007 2.116a9.88 9.88 0 019.885 9.888c-.003 5.45-4.437 9.884-9.888 9.884z" />
                  </svg>
                  Make a Service Request
                </button>
              </div>
            </div>
          </>
          )
        })()}
      </div>
    </section>
  )
}

export default Services;
