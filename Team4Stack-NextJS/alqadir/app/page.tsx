'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';

export default function Home() {
  // Landing images from database
  const [landingImages, setLandingImages] = useState<Record<string, string[]>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  // Card flip carousel state for Garments section
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const garmentsImages = landingImages['garments'] || [];

  // Lace section flip card state
  const [laceFlipped, setLaceFlipped] = useState(false);
  const [laceImageIndex, setLaceImageIndex] = useState(0);
  const laceImages = landingImages['lace'] || [];

  const handleLaceFlip = () => {
    if (!laceFlipped && laceImages.length > 0) {
      setLaceFlipped(true);
      setTimeout(() => {
        setLaceImageIndex((prev) => (prev + 1) % laceImages.length);
        setLaceFlipped(false);
      }, 600);
    }
  };

  // Bag images for Purse section
  const bagImages = landingImages['purse'] || [];

  // Cosmetics images
  const cosmeticsImages = landingImages['cosmetics'] || [];

  // Jewellery images
  const jewelleryImages = landingImages['jewellery'] || [];

  // General store image
  const generalStoreImage = landingImages['general_store']?.[0] || '';

  // Hero banner image
  const heroBannerImage = landingImages['hero']?.[0] || null;
  
  // Debug log
  useEffect(() => {
    console.log('Current heroBannerImage:', heroBannerImage);
    console.log('landingImages:', landingImages);
  }, [heroBannerImage, landingImages]);

  // Fetch landing images from database
  useEffect(() => {
    const fetchLandingImages = async () => {
      try {
        const response = await fetch('/api/landing-images');
        const data = await response.json();
        
        if (data.success && data.images && Array.isArray(data.images)) {
          console.log('Fetched images:', data.images);
          const grouped: Record<string, Array<{url: string, order: number}>> = {};
          data.images.forEach((img: any) => {
            // Only add images that have valid URLs and are active
            if (img.image_url && img.image_url.trim() !== '' && img.is_active !== false) {
              if (!grouped[img.section]) {
                grouped[img.section] = [];
              }
              grouped[img.section].push({
                url: img.image_url,
                order: img.display_order || 0
              });
            }
          });
          
          // Sort by display_order and extract URLs
          const finalGrouped: Record<string, string[]> = {};
          Object.keys(grouped).forEach(section => {
            grouped[section].sort((a, b) => a.order - b.order);
            finalGrouped[section] = grouped[section].map(item => item.url);
          });
          
          console.log('Grouped images:', finalGrouped);
          setLandingImages(finalGrouped);
        } else {
          console.warn('No images found or invalid response:', data);
          setLandingImages({});
        }
      } catch (error) {
        console.error('Error fetching landing images:', error);
        setLandingImages({});
      } finally {
        setLoadingImages(false);
      }
    };

    fetchLandingImages();
  }, []);

  useEffect(() => {
    if (garmentsImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentCardIndex((prev) => (prev + 1) % garmentsImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [garmentsImages.length]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Header />
      
      {/* Hero Section with Enhanced Banner - Full Width */}
      <section 
        style={{ 
          width: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
          paddingTop: '90px',
          paddingBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="hero-section"
      >
        {/* Decorative Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
        
        {/* Full Width Banner Container with Enhanced Effects */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            marginBottom: 'clamp(30px, 5vw, 50px)',
            overflow: 'hidden',
            minHeight: heroBannerImage ? '200px' : '200px',
            maxHeight: 'none',
            backgroundColor: heroBannerImage ? 'transparent' : 'rgba(26, 26, 46, 0.05)',
            borderRadius: heroBannerImage ? '0' : '12px',
            zIndex: 1
          }}
          className="hero-banner-container"
        >
          {/* Banner Image with Enhanced Filters */}
          {heroBannerImage && heroBannerImage.trim() !== '' ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                overflow: 'visible',
                zIndex: 10
              }}
            >
              <img
                src={heroBannerImage}
                alt="Al-Qadir Shopping Mall - Best Deals in Pakistan"
                style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: '200px',
                  maxHeight: 'none',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'brightness(1.05) contrast(1.1) saturate(1.1)',
                  transform: 'scale(1)',
                  transition: 'transform 0.5s ease',
                  position: 'relative',
                  zIndex: 1
                }}
                className="hero-banner-image"
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onError={(e) => {
                  console.error('Image load error:', heroBannerImage, e);
                  const target = e.target as HTMLImageElement;
                  target.style.border = '2px solid red';
                  target.style.backgroundColor = '#ffcccc';
                }}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully:', heroBannerImage);
                  const target = e.target as HTMLImageElement;
                  console.log('Image dimensions:', target.naturalWidth, 'x', target.naturalHeight);
                }}
              />
              {/* Animated Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.1) 0%, rgba(0,0,0,0.15) 50%, rgba(26, 26, 46, 0.1) 100%)',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              />
              {/* Shine Effect Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  zIndex: 3,
                  pointerEvents: 'none',
                  animation: 'shine 3s infinite'
                }}
              />
            </div>
          ) : (
            /* Placeholder space when no banner */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}
            >
              {/* Empty space - maintains section height */}
            </div>
          )}
        </div>

        {/* Hero Content Below Banner */}
        <div
          style={{
            maxWidth: '1300px',
            margin: '0 auto',
            paddingLeft: '15px',
            paddingRight: '15px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(20px, 4vw, 40px) clamp(15px, 3vw, 20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              marginTop: 'clamp(20px, 4vw, 40px)'
            }}
            className="hero-content-box"
          >
            <h1
              style={{
                fontSize: 'clamp(32px, 6vw, 56px)',
                fontWeight: '800',
                color: '#1a1a2e',
                marginBottom: '24px',
                lineHeight: '1.2',
                fontFamily: 'var(--font-poppins), Arial, sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '-0.5px'
              }}
            >
              Welcome to Al-Qadir Shopping Mall
            </h1>
            <p
              style={{
                fontSize: 'clamp(18px, 3vw, 24px)',
                color: '#333',
                marginBottom: '40px',
                maxWidth: '800px',
                margin: '0 auto 40px',
                lineHeight: '1.7',
                fontWeight: '500'
              }}
            >
              Your one-stop destination for premium products with unbeatable deals and free delivery across Pakistan
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(12px, 1.5vw, 12px)', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              marginTop: '20px',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}
            className="hero-buttons-container"
            >
              <Link
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: 'clamp(14px, 3vw, 20px) clamp(30px, 8vw, 50px)',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  fontWeight: '700',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 30px rgba(26, 26, 46, 0.4), 0 0 0 3px rgba(26, 26, 46, 0.1)',
                  transition: 'all 0.3s ease',
                  border: '3px solid #1a1a2e',
                  letterSpacing: '0.5px',
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
                className="hero-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.borderColor = '#4CAF50';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.5), 0 0 0 3px rgba(76, 175, 80, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a2e';
                  e.currentTarget.style.borderColor = '#1a1a2e';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(26, 26, 46, 0.4), 0 0 0 3px rgba(26, 26, 46, 0.1)';
                }}
              >
                <span>Shop Now</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(14px, 3vw, 20px) clamp(30px, 8vw, 50px)',
                  backgroundColor: '#fff',
                  color: '#1a1a2e',
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  fontWeight: '700',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  border: '3px solid #1a1a2e',
                  boxShadow: '0 8px 30px rgba(26, 26, 46, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px',
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}
                className="hero-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a2e';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#1a1a2e';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(26, 26, 46, 0.4), 0 0 0 3px rgba(26, 26, 46, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#1a1a2e';
                  e.currentTarget.style.borderColor = '#1a1a2e';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(26, 26, 46, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.5)';
                }}
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Add CSS Animation for Shine Effect */}
      <style jsx>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-15px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        @keyframes flip {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(180deg);
          }
        }
      `}</style>

      {/* Responsive CSS Media Queries */}
      <style jsx global>{`
        /* Mobile Responsive Styles */
        @media (min-width: 768px) {
          .hero-section {
            padding-top: 90px !important;
            padding-bottom: 60px !important;
          }
          
          .hero-banner-image {
            min-height: 400px !important;
            max-height: 1080px !important;
          }
          
          .hero-banner-container {
            min-height: 400px !important;
            max-height: none !important;
          }
          
          .hero-content-box {
            padding: 40px 20px !important;
            margin-top: 40px !important;
          }
          
          .hero-buttons-container {
            flex-direction: row !important;
            align-items: center !important;
            gap: 8px !important;
          }
          
          .hero-button {
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
          }
          
          .garments-grid,
          .purse-grid,
          .lace-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .garments-carousel {
            height: 500px !important;
            margin-top: 0 !important;
          }
          
          .garment-card {
            width: 400px !important;
            height: 450px !important;
          }
          
          .purse-collage {
            height: 500px !important;
            margin-top: 0 !important;
          }
          
          .purse-collage-container {
            width: 500px !important;
            height: 480px !important;
          }
          
          .cosmetics-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
          }
          
          .general-store-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .promo-left {
            clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%) !important;
          }
        }
        
        @media (max-width: 767px) {
          .hero-section {
            padding-top: 70px !important;
            padding-bottom: 30px !important;
          }
          
          .hero-banner-image {
            min-height: 200px !important;
            max-height: 600px !important;
          }
          
          .hero-banner-container {
            min-height: 200px !important;
            max-height: none !important;
          }
          
          .section-button {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .garments-section,
          .purse-section,
          .lace-section,
          .cosmetics-section,
          .electronics-section,
          .general-store-section {
            padding: 40px 15px !important;
          }
        }
        
        @media (max-width: 480px) {
          .hero-section {
            padding-top: 60px !important;
            padding-bottom: 20px !important;
          }
          
          .hero-content-box {
            padding: 20px 15px !important;
            margin-top: 20px !important;
          }
          
          .garments-section,
          .purse-section,
          .lace-section,
          .cosmetics-section,
          .electronics-section,
          .general-store-section {
            padding: 30px 10px !important;
          }
          
          .garments-carousel,
          .purse-collage {
            height: 300px !important;
            min-height: 300px !important;
          }
          
          .garment-card {
            width: 280px !important;
            height: 320px !important;
          }
          
          .purse-collage-container {
            width: 100% !important;
            height: 350px !important;
            min-height: 350px !important;
          }
        }
      `}</style>

      {/* Section 1: Garments (گارمنٹس) */}
      <section
        id="garments-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)'
        }}
        className="garments-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'clamp(30px, 6vw, 60px)',
            alignItems: 'center'
          }}
          className="garments-grid"
        >
          {/* Left Side - Text Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                backgroundColor: '#1a1a2e',
                color: '#fff',
                padding: '20px 30px',
                borderRadius: '12px',
                display: 'inline-block',
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '2px'
              }}
            >
              گارمنٹس
            </div>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '20px',
                lineHeight: '1.2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              GARMENTS
            </h2>
            <p
              style={{
                fontSize: 'clamp(16px, 3vw, 20px)',
                color: '#1a1a2e',
                marginBottom: 'clamp(20px, 4vw, 30px)',
                fontWeight: '600',
                lineHeight: '1.6'
              }}
            >
              Premium Quality Fashion
            </p>
            <p
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: '#666',
                marginBottom: 'clamp(30px, 5vw, 40px)',
                lineHeight: '1.8'
              }}
            >
              Discover our latest collection of trendy garments. Style meets comfort in every piece.
            </p>
            <Link
              href="/shop?category=cosmetics"
              style={{
                display: 'inline-block',
                padding: 'clamp(14px, 3vw, 18px) clamp(30px, 6vw, 45px)',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontSize: 'clamp(14px, 3vw, 18px)',
                fontWeight: '700',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)',
                width: '100%',
                maxWidth: '300px',
                textAlign: 'center'
              }}
              className="section-button"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(26, 26, 46, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 26, 46, 0.3)';
              }}
            >
              Shop Now →
            </Link>
          </div>

          {/* Right Side - Card Flip Carousel */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              height: 'clamp(300px, 60vw, 500px)',
              minHeight: '300px',
              perspective: '1000px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'clamp(20px, 4vw, 0px)'
            }}
            className="garments-carousel"
          >
            {/* Show empty cards if no images, or show images */}
            {(() => {
              const validImages = garmentsImages.filter(img => img && img.trim() !== '');
              const displayItems = validImages.length === 0 
                ? Array.from({ length: 5 }).map((_, index) => ({ image: '', index }))
                : validImages.map((image, index) => ({ image, index }));
              const totalItems = displayItems.length;
              
              return displayItems.map(({ image, index }) => {
                const isActive = index === currentCardIndex;
                const isNext = index === (currentCardIndex + 1) % totalItems;
                const isPrev = index === (currentCardIndex - 1 + totalItems) % totalItems;
                
                let zIndex = totalItems - Math.abs(index - currentCardIndex);
                if (zIndex > totalItems) zIndex = totalItems;
              
              let translateY = 0;
              let rotateY = 0;
              let scale = 1;
              let opacity = 1;
              
              if (isActive) {
                translateY = 0;
                rotateY = 0;
                scale = 1;
                opacity = 1;
                zIndex = garmentsImages.length + 1;
              } else if (isNext) {
                translateY = 30;
                rotateY = -15;
                scale = 0.9;
                opacity = 0.7;
              } else if (isPrev) {
                translateY = -30;
                rotateY = 15;
                scale = 0.9;
                opacity = 0.7;
              } else {
                translateY = index < currentCardIndex ? -60 : 60;
                rotateY = index < currentCardIndex ? 25 : -25;
                scale = 0.7;
                opacity = 0.4;
              }
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: 'clamp(280px, 70vw, 400px)',
                    height: 'clamp(320px, 80vw, 450px)',
                    transformStyle: 'preserve-3d',
                    transform: `translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentCardIndex(index)}
                  className="garment-card"
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: isActive 
                        ? '0 25px 60px rgba(0,0,0,0.4)' 
                        : '0 10px 30px rgba(0,0,0,0.2)',
                      transform: isActive ? 'rotate(-5deg)' : 'rotate(0deg)',
                      transition: 'all 0.8s ease'
                    }}
                  >
                    {image && image.trim() !== '' ? (
                      <Image
                        src={image}
                        alt={`Garments ${index + 1}`}
                        width={400}
                        height={450}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              );
              });
            })()}
            
            {/* Navigation Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 100
              }}
            >
              {garmentsImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCardIndex(index)}
                  style={{
                    width: index === currentCardIndex ? '30px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: index === currentCardIndex ? '#1a1a2e' : '#ccc',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Purse/Bags (پرکس) */}
      <section
        id="bags-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)'
        }}
        className="purse-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'clamp(30px, 6vw, 60px)',
            alignItems: 'center'
          }}
          className="purse-grid"
        >
          {/* Left Side - Collage Style Bag Cards */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              height: 'clamp(350px, 70vw, 500px)',
              minHeight: '350px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'clamp(20px, 4vw, 0px)'
            }}
            className="purse-collage"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                height: 'clamp(350px, 70vw, 480px)',
                minHeight: '350px'
              }}
              className="purse-collage-container"
            >
              {/* Card 1 - Top Left */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '0px',
                  width: '160px',
                  height: '180px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(-8deg)',
                  zIndex: 1,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(-5deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(-8deg) scale(1)';
                  e.currentTarget.style.zIndex = '1';
                }}
              >
                {bagImages[1] && bagImages[1].trim() !== '' && (
                  <Image
                    src={bagImages[1]}
                    alt="Bag 1"
                    width={160}
                    height={180}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 2 - Top Right */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '20px',
                  width: '150px',
                  height: '170px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(12deg)',
                  zIndex: 2,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(8deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(12deg) scale(1)';
                  e.currentTarget.style.zIndex = '2';
                }}
              >
                {bagImages[2] && bagImages[2].trim() !== '' && (
                  <Image
                    src={bagImages[2]}
                    alt="Bag 2"
                    width={150}
                    height={170}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 3 - Center Big (Horizontal) */}
              <div
                style={{
                  position: 'absolute',
                  top: '120px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-4deg)',
                  width: '280px',
                  height: '200px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  zIndex: 5,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) rotate(-2deg) scale(1.03)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) rotate(-4deg) scale(1)';
                  e.currentTarget.style.zIndex = '5';
                }}
              >
                {bagImages[0] && bagImages[0].trim() !== '' && (
                  <Image
                    src={bagImages[0]}
                    alt="Main Bag"
                    width={280}
                    height={200}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 4 - Bottom Left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '30px',
                  width: '140px',
                  height: '160px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(10deg)',
                  zIndex: 3,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(6deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(10deg) scale(1)';
                  e.currentTarget.style.zIndex = '3';
                }}
              >
                {bagImages[3] && bagImages[3].trim() !== '' && (
                  <Image
                    src={bagImages[3]}
                    alt="Bag 3"
                    width={140}
                    height={160}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 5 - Bottom Right */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '0px',
                  width: '155px',
                  height: '175px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(-10deg)',
                  zIndex: 4,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(-6deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(-10deg) scale(1)';
                  e.currentTarget.style.zIndex = '4';
                }}
              >
                {bagImages[4] && bagImages[4].trim() !== '' && (
                  <Image
                    src={bagImages[4]}
                    alt="Bag 4"
                    width={155}
                    height={175}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 6 - Middle Left */}
              <div
                style={{
                  position: 'absolute',
                  top: '180px',
                  left: '10px',
                  width: '135px',
                  height: '155px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(-15deg)',
                  zIndex: 2,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(-10deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(-15deg) scale(1)';
                  e.currentTarget.style.zIndex = '2';
                }}
              >
                {bagImages[5] && bagImages[5].trim() !== '' && (
                  <Image
                    src={bagImages[5]}
                    alt="Bag 5"
                    width={135}
                    height={155}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>

              {/* Card 7 - Middle Right */}
              <div
                style={{
                  position: 'absolute',
                  top: '200px',
                  right: '10px',
                  width: '145px',
                  height: '165px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  transform: 'rotate(15deg)',
                  zIndex: 3,
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(10deg) scale(1.05)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(15deg) scale(1)';
                  e.currentTarget.style.zIndex = '3';
                }}
              >
                {bagImages[6] && bagImages[6].trim() !== '' && (
                  <Image
                    src={bagImages[6]}
                    alt="Bag 6"
                    width={145}
                    height={165}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                backgroundColor: '#FFD700',
                color: '#1a1a2e',
                padding: '20px 30px',
                borderRadius: '12px',
                display: 'inline-block',
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '2px'
              }}
            >
              پرکس
            </div>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '20px',
                lineHeight: '1.2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              PURSE & BAGS
            </h2>
            <p
              style={{
                fontSize: '20px',
                color: '#1a1a2e',
                marginBottom: '30px',
                fontWeight: '600',
                lineHeight: '1.6'
              }}
            >
              Elegant Designs for Every Occasion
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '40px',
                lineHeight: '1.8'
              }}
            >
              From casual totes to elegant evening bags, find the perfect accessory to complement your style.
            </p>
            <Link
              href="/shop?category=ladiesbag"
              style={{
                display: 'inline-block',
                padding: '18px 45px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(26, 26, 46, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 26, 46, 0.3)';
              }}
            >
              Explore Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Imported Cosmetics (امپورٹڈ کا سٹیکس) */}
      <section
        id="cosmetics-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)'
        }}
        className="cosmetics-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {/* Top Banner */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '50px',
              position: 'relative',
              zIndex: 2
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <span
                style={{
                  backgroundColor: '#FFD700',
                  color: '#1a1a2e',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                امپورٹڈ کا سٹیکس
              </span>
              <span
                style={{
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                IMPORTED COSMETICS
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              Premium Beauty Products
            </h2>
            <p
              style={{
                fontSize: '20px',
                color: '#666',
                fontWeight: '600',
                maxWidth: '700px',
                margin: '0 auto'
              }}
            >
              International brands, authentic quality, delivered to your door
            </p>
          </div>

          {/* Image Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 40vw, 250px), 1fr))',
              gap: 'clamp(15px, 3vw, 30px)',
              marginBottom: 'clamp(30px, 5vw, 40px)'
            }}
            className="cosmetics-grid"
          >
            {(() => {
              const validImages = cosmeticsImages.filter(img => img && img.trim() !== '');
              const displayItems = validImages.length === 0 
                ? Array.from({ length: 5 }).map((_, index) => ({ image: '', index }))
                : (() => {
                    const items = validImages.map((image, index) => ({ image, index }));
                    // Fill remaining slots with empty cards up to max 5
                    while (items.length < 5) {
                      items.push({ image: '', index: items.length });
                    }
                    return items;
                  })();
              
              return displayItems.map(({ image, index }) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: image ? '0 15px 40px rgba(0,0,0,0.3)' : '0 8px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    backgroundColor: image ? 'transparent' : '#f5f5f5',
                    border: image ? 'none' : '2px dashed #ddd',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (image) {
                      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (image) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                >
                  {image && image.trim() !== '' ? (
                    <Image
                      src={image}
                      alt={`Cosmetics ${index + 1}`}
                      width={400}
                      height={300}
                      style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#999',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '8px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p style={{ margin: 0 }}>Empty</p>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/shop?category=makeup"
              style={{
                display: 'inline-block',
                padding: '20px 50px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontSize: '20px',
                fontWeight: '700',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(26, 26, 46, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(26, 26, 46, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 26, 46, 0.3)';
              }}
            >
              Shop Makeup →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Lace (لیس) */}
      <section
        id="lace-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)'
        }}
        className="lace-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'clamp(30px, 6vw, 60px)',
            alignItems: 'center'
          }}
          className="lace-grid"
        >
          {/* Left Side - Text Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                backgroundColor: '#1a1a2e',
                color: '#fff',
                padding: '15px 25px',
                borderRadius: '10px',
                display: 'inline-block',
                marginBottom: '20px',
                fontSize: '16px',
                fontWeight: '700',
                animation: 'fadeInUp 0.8s ease-out'
              }}
            >
              لیس
            </div>
            <h2
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '20px',
                lineHeight: '1.2',
                textTransform: 'uppercase',
                animation: 'fadeInUp 0.8s ease-out 0.2s both'
              }}
            >
              LACE
            </h2>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '15px 20px',
                borderRadius: '8px',
                marginBottom: '25px',
                display: 'inline-block',
                border: '2px solid #1a1a2e',
                animation: 'fadeInUp 0.8s ease-out 0.4s both'
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a1a2e'
                }}
              >
                ELEGANT & DELICATE
              </span>
            </div>
            <p
              style={{
                fontSize: '18px',
                color: '#333',
                marginBottom: '30px',
                fontWeight: '600',
                lineHeight: '1.6',
                animation: 'fadeInUp 0.8s ease-out 0.6s both'
              }}
            >
              Beautiful lace fabrics for your special occasions
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '40px',
                lineHeight: '1.8',
                animation: 'fadeInUp 0.8s ease-out 0.8s both'
              }}
            >
              Discover our exquisite collection of premium lace materials. Perfect for weddings, parties, and special events.
            </p>
            <Link
              href="/shop?category=lace"
              style={{
                display: 'inline-block',
                padding: '18px 45px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)',
                animation: 'fadeInUp 0.8s ease-out 1s both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(26, 26, 46, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 26, 46, 0.3)';
              }}
            >
              View Collection →
            </Link>
          </div>

          {/* Right Side - Flip Card with Lace Images */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              perspective: '1000px'
            }}
          >
            <div
              onClick={handleLaceFlip}
              style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: laceFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of Card */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  transform: 'rotateY(0deg)'
                }}
              >
                {laceImages.length > 0 && laceImages[laceImageIndex] && laceImages[laceImageIndex].trim() !== '' && (
                  <Image
                    src={laceImages[laceImageIndex]}
                    alt="Lace Collection"
                    width={600}
                    height={500}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
                {/* Overlay with click hint */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    padding: '20px',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                    Click to see more →
                  </p>
                </div>
              </div>

              {/* Back of Card */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  transform: 'rotateY(180deg)',
                  backgroundColor: '#1a1a2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: '40px',
                  color: '#fff'
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                  }}
                >
                  ✨
                </div>
                <h3
                  style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}
                >
                  Premium Lace Collection
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    textAlign: 'center',
                    lineHeight: '1.6',
                    opacity: 0.9
                  }}
                >
                  Explore our wide range of elegant lace fabrics
                </p>
              </div>
            </div>

            {/* Image Indicators */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '20px'
              }}
            >
              {laceImages.map((_, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLaceImageIndex(index);
                  }}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: index === laceImageIndex ? '#1a1a2e' : '#ccc',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Electronics (الیکٹرانکس) */}
      <section
        id="electronics-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)'
        }}
        className="electronics-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {/* Center Content */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div
              style={{
                backgroundColor: '#1a1a2e',
                color: '#fff',
                padding: '20px 30px',
                borderRadius: '12px',
                display: 'inline-block',
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '2px'
              }}
            >
              الیکٹرانکس
            </div>
            <h2
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: '900',
                color: '#1a1a2e',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              ELECTRONICS
            </h2>
            <p
              style={{
                fontSize: '22px',
                color: '#1a1a2e',
                fontWeight: '600',
                marginBottom: '10px'
              }}
            >
              Latest Technology
            </p>
            <p
              style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto 40px'
              }}
            >
              Cutting-edge devices and gadgets for modern lifestyle
            </p>
          </div>

          {/* Image Showcase */}
          <div
            style={{
              display: 'flex',
              gap: 'clamp(15px, 3vw, 30px)',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 'clamp(30px, 5vw, 50px)'
            }}
            className="electronics-showcase"
          >
            {(() => {
              const validImages = jewelleryImages.filter(img => img && img.trim() !== '');
              const displayItems = validImages.length === 0 
                ? Array.from({ length: 4 }).map((_, index) => ({ image: '', index }))
                : (() => {
                    const items = validImages.map((image, index) => ({ image, index }));
                    // Fill remaining slots with empty cards up to max 4
                    while (items.length < 4) {
                      items.push({ image: '', index: items.length });
                    }
                    return items;
                  })();
              
              return displayItems.map(({ image, index }) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: image ? '0 20px 60px rgba(0, 0, 0, 0.15)' : '0 8px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    flex: '1',
                    minWidth: 'clamp(280px, 80vw, 300px)',
                    maxWidth: '450px',
                    width: '100%',
                    backgroundColor: image ? 'transparent' : '#f5f5f5',
                    border: image ? 'none' : '2px dashed #ddd',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (image) {
                      e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (image) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                >
                  {image && image.trim() !== '' ? (
                    <Image
                      src={image}
                      alt={`Electronics ${index + 1}`}
                      width={450}
                      height={400}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#999',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '8px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p style={{ margin: 0 }}>Empty</p>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/shop?category=electronics"
              style={{
                display: 'inline-block',
                padding: '20px 50px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                fontSize: '20px',
                fontWeight: '700',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(26, 26, 46, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(26, 26, 46, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 26, 46, 0.3)';
              }}
            >
              Explore Electronics →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: General Store (جنرل سٹور) - Similar to Image Design */}
      <section
        id="general-section"
        style={{
          width: '100%',
          minHeight: 'auto',
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(40px, 8vw, 80px) clamp(15px, 4vw, 20px)',
          background: '#f5f5f5'
        }}
        className="general-store-section"
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {/* Two Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0',
              minHeight: 'auto',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }}
            className="general-store-grid"
          >
            {/* Left Side - Yellow Promotional */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                padding: 'clamp(30px, 6vw, 60px) clamp(25px, 5vw, 50px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                overflow: 'hidden',
                minHeight: '300px'
              }}
              className="promo-left"
            >
              {/* Animated Background Decorations */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'floatSlow 8s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  animation: 'floatSlow 6s ease-in-out infinite 1s'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  animation: 'pulse 4s ease-in-out infinite'
                }}
              />
              {/* Decorative Circles */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  width: '60px',
                  height: '60px',
                  border: '3px solid rgba(26, 26, 46, 0.1)',
                  borderRadius: '50%',
                  animation: 'rotate 20s linear infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '30px',
                  right: '40px',
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgba(26, 26, 46, 0.1)',
                  borderRadius: '50%',
                  animation: 'rotate 15s linear infinite reverse'
                }}
              />
              <h2
                style={{
                  fontSize: 'clamp(32px, 4vw, 56px)',
                  fontWeight: '900',
                  color: '#1a1a2e',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  lineHeight: '1.2',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out'
                }}
              >
                جنرل سٹور
              </h2>
              <h3
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  fontWeight: '800',
                  color: '#1a1a2e',
                  marginBottom: '15px',
                  textTransform: 'uppercase',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.2s both'
                }}
              >
                GENERAL STORE
              </h3>
              <p
                style={{
                  fontSize: '20px',
                  color: '#1a1a2e',
                  marginBottom: '30px',
                  fontWeight: '600',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.4s both'
                }}
              >
                Everything You Need!
              </p>
              <p
                style={{
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '40px',
                  lineHeight: '1.8',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.6s both'
                }}
              >
                Your one-stop shop for daily essentials, groceries, household items, and more. Quality products at great prices.
              </p>
              <Link
                href="/shop?category=general"
                style={{
                  display: 'inline-block',
                  padding: '18px 45px',
                  backgroundColor: '#1a1a2e',
                  color: '#FFD700',
                  fontSize: '18px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)',
                  width: 'fit-content',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.8s both, pulse 2s ease-in-out infinite 2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(26, 26, 46, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 26, 46, 0.3)';
                }}
              >
                Shop Now →
              </Link>
            </div>

            {/* Right Side - Image & Info */}
            <div
              style={{
                background: '#fff',
                padding: 'clamp(25px, 5vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '300px'
              }}
              className="promo-right"
            >
              {/* Animated Background Pattern */}
              <div
                style={{
                  position: 'absolute',
                  top: '-100px',
                  right: '-100px',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'pulse 6s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-80px',
                  left: '-80px',
                  width: '250px',
                  height: '250px',
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
                  borderRadius: '50%',
                  animation: 'pulse 8s ease-in-out infinite 2s'
                }}
              />
              {/* Decorative Lines */}
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                  animation: 'shimmer 3s linear infinite'
                }}
              />
              {/* Top Info Tags */}
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  flexWrap: 'wrap',
                  marginBottom: '30px',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    backgroundColor: '#FFD700',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    animation: 'bounce 2s ease-in-out infinite',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1a1a2e'
                    }}
                  >
                    ONE APP
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: '#FFD700',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    animation: 'bounce 2s ease-in-out infinite 0.5s',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1a1a2e'
                    }}
                  >
                    MANY ADVANTAGES
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '16px',
                  color: '#1a1a2e',
                  fontWeight: '600',
                  marginBottom: '30px',
                  textAlign: 'right',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.3s both'
                }}
              >
                OFFERS & CATALOGUES<br />
                EVERYTHING AT A GLANCE
              </p>

              {/* Main Image */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: generalStoreImage ? '0 15px 40px rgba(0,0,0,0.2)' : '0 8px 20px rgba(0,0,0,0.1)',
                  marginBottom: '20px',
                  animation: 'fadeInUp 1s ease-out 0.5s both',
                  transition: 'transform 0.3s ease',
                  backgroundColor: generalStoreImage ? 'transparent' : '#f5f5f5',
                  border: generalStoreImage ? 'none' : '2px dashed #ddd',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (generalStoreImage) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (generalStoreImage) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {generalStoreImage && generalStoreImage.trim() !== '' ? (
                  <Image
                    src={generalStoreImage}
                    alt="General Store Products"
                    width={600}
                    height={400}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '12px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p style={{ margin: 0 }}>Empty</p>
                  </div>
                )}
              </div>

              {/* Bottom Promo */}
              <div
                style={{
                  backgroundColor: '#FFD700',
                  padding: '15px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'pulse 2.5s ease-in-out infinite',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#1a1a2e'
                  }}
                >
                  BUY MORE, PAY LESS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Floating Action Button */}
      <WhatsAppFab />
    </div>
  );
}
