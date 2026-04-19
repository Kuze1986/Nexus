import React from 'react';
import ProductCard from './ProductCard';

export default function PortfolioSection({ products = [], onProductClick }) {
  const featuredProducts = products.filter((p) => p.is_featured);
  const otherProducts = products.filter((p) => !p.is_featured);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
