'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

// Category images mapping - Update these URLs with actual category images
const categoryImages: Record<string, string> = {
  'all': 'https://res.cloudinary.com/drn7iks5k/image/upload/v1765379988/categories/all.png',
  'cosmetics': 'https://res.cloudinary.com/drn7iks5k/image/upload/v1765380116/categories/cosmetics.jpg',
  'ladiesbag': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop',
  'wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&h=200&fit=crop',
  'makeup': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
  'lace': 'https://res.cloudinary.com/drn7iks5k/image/upload/v1765379914/categories/lace.jpg',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
  'general': 'https://res.cloudinary.com/drn7iks5k/image/upload/v1765379570/categories/general.webp'
};

const categoryIds = ['all', 'cosmetics', 'ladiesbag', 'wallets', 'makeup', 'lace', 'electronics', 'general'];

const categoryLabels: Record<string, string> = {
  'all': 'All',
  'cosmetics': 'Cosmetics',
  'ladiesbag': 'Ladies Bags',
  'wallets': 'Wallets',
  'makeup': 'Makeup',
  'lace': 'Lace',
  'electronics': 'Electronics',
  'general': 'General'
};

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {

  return (
    <nav 
      className="category-nav"
      style={{ 
        background: 'transparent',
        paddingTop: '20px',
        paddingBottom: '24px'
      }}
    >
      {/* Centered Container */}
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <motion.ul 
          className="category-list flex items-center justify-center overflow-x-auto scrollbar-hide"
          style={{
            paddingTop: '8px',
            paddingBottom: '8px',
            gap: '24px',
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {categoryIds.map((categoryId, index) => {
            const categoryImage = categoryImages[categoryId];
            const isActive = activeCategory === categoryId;
            return (
              <motion.li 
                key={categoryId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 'fit-content'
                }}
              >
                <motion.button
                  onClick={() => {
                    // Map categories to home page sections
                    const sectionMap: Record<string, string> = {
                      'all': '',
                      'cosmetics': 'cosmetics-section',
                      'ladiesbag': 'bags-section',
                      'wallets': 'bags-section',
                      'makeup': 'cosmetics-section',
                      'lace': 'lace-section',
                      'electronics': 'electronics-section',
                      'general': 'general-section',
                    };
                    
                    const sectionId = sectionMap[categoryId];
                    
                    // If on shop page, navigate to home page section
                    if (typeof window !== 'undefined' && window.location.pathname === '/shop') {
                      if (categoryId === 'all') {
                        window.location.href = '/';
                      } else if (sectionId) {
                        window.location.href = `/#${sectionId}`;
                      }
                    } else {
                      // If already on home page, scroll to section
                      if (categoryId === 'all') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (sectionId) {
                        setTimeout(() => {
                          const element = document.getElementById(sectionId);
                          if (element) {
                            const offset = 90; // Header height
                            const elementPosition = element.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - offset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                          }
                        }, 100);
                      }
                      // Still update category for shop page if needed
                      onCategoryChange(categoryId);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: isActive ? '88px' : '80px',
                    height: isActive ? '88px' : '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                    outline: 'none',
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: isActive 
                      ? '0px 12px 35px rgba(102, 126, 234, 0.6), 0px 6px 20px rgba(118, 75, 162, 0.4), 0px 0px 0px 4px rgba(102, 126, 234, 0.2)' 
                      : '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                  whileHover={{ 
                    scale: isActive ? 1.08 : 1.1,
                    boxShadow: isActive 
                      ? '0px 15px 40px rgba(102, 126, 234, 0.7), 0px 8px 25px rgba(118, 75, 162, 0.5), 0px 0px 0px 4px rgba(102, 126, 234, 0.3)'
                      : '0px 12px 30px rgba(102, 126, 234, 0.4), 0px 6px 15px rgba(118, 75, 162, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Gradient Border Effect - More visible for active */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: isActive ? '-4px' : '-3px',
                      borderRadius: '50%',
                      background: isActive
                        ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 20%, #667eea 40%, #764ba2 60%, #4facfe 80%, #00f2fe 100%)'
                        : 'linear-gradient(135deg, #e53e3e 0%, #c53030 25%, #667eea 50%, #764ba2 75%, #4facfe 100%)',
                      opacity: isActive ? 1 : 0.6,
                      zIndex: -1,
                      transition: 'all 0.3s ease',
                      filter: isActive ? 'brightness(1.2)' : 'brightness(1)'
                    }}
                  />
                  
                  {/* Inner Circle with Image - Different background for active */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,244,255,0.9) 100%)'
                        : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                      overflow: 'hidden',
                      border: isActive ? '2px solid rgba(102, 126, 234, 0.3)' : 'none',
                      boxShadow: isActive 
                        ? 'inset 0px 2px 8px rgba(102, 126, 234, 0.15)' 
                        : 'none'
                    }}
                  >
                    {categoryImage && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        overflow: 'hidden'
                      }}>
                        <Image
                          src={categoryImage}
                          alt={categoryLabels[categoryId] || categoryId}
                          fill
                          sizes="80px"
                          style={{
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            filter: isActive ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
                          }}
                          className="category-image"
                        />
                      </div>
                    )}
                  </div>
                </motion.button>
                
                {/* Category Label Below Circle */}
                <motion.span
                  style={{
                    marginTop: '12px',
                    fontSize: isActive ? '14px' : '13px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#667eea' : '#4a5568',
                    textAlign: 'center',
                    maxWidth: '90px',
                    lineHeight: '1.4',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                  whileHover={{ color: '#667eea', scale: 1.05 }}
                >
                  {categoryLabels[categoryId] || categoryId}
                </motion.span>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .category-image {
          transition: transform 0.3s ease;
        }
        button:hover .category-image {
          transform: scale(1.1);
        }
      `}</style>
    </nav>
  );
}
