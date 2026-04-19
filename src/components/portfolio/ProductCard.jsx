import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const stageBadgeColors = {
    live: 'bg-green-500/20 text-green-300 border-green-500/30',
    beta: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    development: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    concept: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
      style={{ borderColor: product.domain_color + '40' }}
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${product.domain_color}, transparent)` }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-1 h-16 rounded-full"
            style={{ backgroundColor: product.domain_color }}
          />
          <Badge className={`${stageBadgeColors[product.stage]} border`}>
            {product.stage}
          </Badge>
        </div>
        
        <h3 className="text-3xl font-bold text-white mb-3">{product.name}</h3>
        <p className="text-lg text-gray-300 mb-6">{product.tagline}</p>
        
        <div className="mb-6 pb-6 border-b border-white/10">
          <p className="text-sm text-gray-400 mb-2">BioLoop Role</p>
          <p className="text-white/90">{product.bioloop_role}</p>
        </div>
        
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 group/btn w-full justify-between"
        >
          Learn More
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}