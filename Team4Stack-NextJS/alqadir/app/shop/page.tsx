'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import { useProducts } from '@/context/ProductContext';
import { getProductTitle } from '@/utils/getProductText';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Update active category when URL changes
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setActiveCategory(category);
  }, [searchParams]);
  
  // Get only active products from context
  const { getActiveProducts } = useProducts();
  const activeProducts = getActiveProducts();

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let filtered = activeProducts;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const productTitle = getProductTitle(product);
        return productTitle.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [activeCategory, searchQuery, activeProducts]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ 
        background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f6 50%, #f5f7fa 100%)',
        minHeight: '100vh',
        position: 'relative',
        paddingTop: '90px'
      }}
    >
      {/* Header */}
      <Header />
      
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} searchQuery={searchQuery} />
      
      {/* Category Navigation with Filter */}
      <CategoryNav 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      
      {/* Main Content - Product Grid */}
      <main className="flex-1">
        <ProductGrid products={filteredProducts} />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Floating Action Button */}
      <WhatsAppFab />
    </motion.div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f7fa 0%, #eef2f6 50%, #f5f7fa 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}

