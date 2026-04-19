import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openItem, setOpenItem] = useState(0);
  
  const { data: faqItems = [] } = useQuery({
    queryKey: ['faq-items'],
    queryFn: () => base44.entities.FAQItem.list('order_index')
  });

  const categories = ['product', 'bioloop', 'investment', 'partnership'];
  const groupedFAQs = categories.reduce((acc, category) => {
    acc[category] = faqItems.filter(item => item.category === category);
    return acc;
  }, {});

  const categoryLabels = {
    product: 'Products',
    bioloop: 'BioLoop Technology',
    investment: 'Investment',
    partnership: 'Partnerships'
  };

  return (
    <section id="faq" className="min-h-screen bg-[#080C14] py-24 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
        </div>
        
        {categories.map((category) => {
          const items = groupedFAQs[category];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/10">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-4">
                {items.map((item, index) => {
                  const itemIndex = faqItems.findIndex(f => f.id === item.id);
                  const isOpen = openItem === itemIndex;
                  
                  return (
                    <div 
                      key={item.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenItem(isOpen ? -1 : itemIndex)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg font-medium text-white pr-4">{item.question}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}