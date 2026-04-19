import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

export default function PortfolioSection({ onProductClick }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['portfolio-products'],
    queryFn: () => base44.entities.PortfolioProduct.list('order_index')
  });

  const featuredProducts = products.filter(p => p.is_featured);
  const otherProducts = products.filter(p => !p.is_featured);
  const sortedProducts = [...featuredProducts, ...otherProducts];

  return (
    <section id="portfolio" className="min-h-screen bg-[#080C14] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Five platforms. One intelligence layer.
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Built for the full spectrum of human experience.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}