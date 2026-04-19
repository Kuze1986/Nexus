import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export default function ProductDetailSection({ product }) {
  const getCtaConfig = (productName) => {
    if (['Meridian', 'Lumora'].includes(productName)) {
      return { text: 'Request Institutional Demo', action: 'demo' };
    }
    if (productName === 'Lumis') {
      return { text: 'Join Waitlist', action: 'waitlist' };
    }
    if (productName === 'Flux') {
      return { text: 'Request Early Access', action: 'access' };
    }
    return { text: 'Learn More', action: 'info' };
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ctaConfig = getCtaConfig(product.name);
  const stageBadgeColors = {
    live: 'bg-green-500/20 text-green-300 border-green-500/30',
    beta: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    development: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    concept: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  return (
    <section 
      id={`product-${product.name.toLowerCase()}`}
      className="min-h-screen bg-[#080C14] py-24 px-6 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-1">
            <div 
              className="w-2 h-full rounded-full"
              style={{ backgroundColor: product.domain_color }}
            />
          </div>
          
          <div className="lg:col-span-11">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-5xl md:text-6xl font-bold text-white">
                  {product.name}
                </h2>
                <Badge className={`${stageBadgeColors[product.stage]} border`}>
                  {product.stage}
                </Badge>
              </div>
              <p className="text-2xl text-gray-300 font-light">{product.tagline}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>
                </div>
                
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">BioLoop Role</h3>
                  <p className="text-gray-300 leading-relaxed">{product.bioloop_role}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={scrollToContact}
                  size="lg"
                  className="w-full py-6 text-lg rounded-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: product.domain_color,
                    color: 'white'
                  }}
                >
                  {ctaConfig.text}
                </Button>
                
                {product.demo_url && (
                  <Button
                    onClick={() => window.open(product.demo_url, '_blank')}
                    size="lg"
                    variant="outline"
                    className="w-full py-6 text-lg border-white/30 text-white hover:bg-white/10 rounded-xl"
                  >
                    See It In Action
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}