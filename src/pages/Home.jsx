import React, { useState } from 'react';
import Navigation from '../components/navigation/Navigation';
import HeroSection from '../components/hero/HeroSection';
import PortfolioSection from '../components/portfolio/PortfolioSection';
import ProductDetailSection from '../components/portfolio/ProductDetailSection';
import BioLoopSection from '../components/bioloop/BioLoopSection';
import TractionSection from '../components/traction/TractionSection';
import AboutSection from '../components/about/AboutSection';
import FAQSection from '../components/faq/FAQSection';
import ContactSection from '../components/contact/ContactSection';
import Footer from '../components/footer/Footer';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { data: products = [] } = useQuery({
    queryKey: ['portfolio-products'],
    queryFn: () => base44.entities.PortfolioProduct.list('order_index')
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      document.getElementById(`product-${product.name.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="bg-[#080C14] min-h-screen">
      <Navigation />
      <HeroSection />
      <PortfolioSection onProductClick={handleProductClick} />
      {products.map((product) => (
        <ProductDetailSection key={product.id} product={product} />
      ))}
      <BioLoopSection />
      <TractionSection />
      <AboutSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}