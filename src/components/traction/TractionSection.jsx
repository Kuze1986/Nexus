import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const stats = [
  { value: '193', label: 'Component Platform', sublabel: 'Built in 15 days — Meridian' },
  { value: '5', label: 'Integrated Products', sublabel: 'Unified portfolio' },
  { value: '1', label: 'Intelligence Engine', sublabel: 'BioLoop powers everything' }
];

const milestones = [
  { date: '2025-01', label: 'Meridian Platform Launch', description: '193-component platform built in 15 days' },
  { date: '2025-02', label: 'BioLoop Engine Complete', description: 'Core intelligence layer finalized' },
  { date: '2025-03', label: 'Lumora Beta Release', description: 'Adaptive learning platform enters beta' },
  { date: '2025-06', label: 'Lumis Development Kickoff', description: 'Health intelligence platform development begins' },
  { date: '2025-09', label: 'Flux Prototype', description: 'Connection intelligence prototype completed' }
];

export default function TractionSection() {
  const { data: pressItems = [], isLoading } = useQuery({
    queryKey: ['press-items'],
    queryFn: () => base44.entities.PressItem.list('-published_at')
  });

  return (
    <section id="traction" className="min-h-screen bg-[#080C14] py-24 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Built, Not Pitched.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center hover:border-white/30 transition-all duration-300"
            >
              <div className="text-6xl font-bold text-white mb-3">{stat.value}</div>
              <div className="text-xl text-gray-300 font-medium mb-2">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.sublabel}</div>
            </div>
          ))}
        </div>
        
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-10 text-center">Milestones</h3>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-64 relative"
                >
                  <div className="absolute top-0 left-1/2 w-4 h-4 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 z-10" />
                  <div className="pt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">{milestone.date}</div>
                    <div className="text-lg font-semibold text-white mb-2">{milestone.label}</div>
                    <div className="text-sm text-gray-400">{milestone.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {pressItems.length > 0 && (
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-white mb-10 text-center">Press</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pressItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="text-sm text-gray-400 mb-2">{item.publication}</div>
                  <div className="text-lg font-medium text-white">{item.headline}</div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
          <blockquote className="text-2xl text-gray-400 italic">
            "What our partners say — coming soon."
          </blockquote>
        </div>
      </div>
    </section>
  );
}