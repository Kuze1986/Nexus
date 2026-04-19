import React from 'react';
import { Brain, Activity, Zap, RefreshCw } from 'lucide-react';

const capabilities = [
  {
    icon: Activity,
    title: 'State Detection',
    description: 'Continuously monitors behavioral signals and environmental context to understand current human state.'
  },
  {
    icon: Brain,
    title: 'Pattern Recognition',
    description: 'Identifies recurring patterns across time, context, and behavior to predict future states.'
  },
  {
    icon: Zap,
    title: 'Adaptive Response',
    description: 'Dynamically adjusts system behavior in real-time based on detected patterns and predicted needs.'
  },
  {
    icon: RefreshCw,
    title: 'Continuous Learning',
    description: 'Refines predictions and responses through ongoing feedback loops and outcome tracking.'
  }
];

export default function BioLoopSection() {
  return (
    <section id="bioloop" className="min-h-screen bg-gradient-to-b from-[#080C14] to-[#0a0f1a] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white" />
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            BioLoop — The Intelligence Layer
          </h2>
          <p className="text-2xl text-gray-300 font-light max-w-2xl mx-auto">
            Not a feature. Infrastructure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div 
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{capability.title}</h3>
                <p className="text-gray-400 leading-relaxed">{capability.description}</p>
              </div>
            );
          })}
        </div>
        
        <div className="mb-20">
          <div className="relative py-16">
            <svg className="w-full h-auto" viewBox="0 0 800 400" fill="none">
              <circle cx="400" cy="200" r="60" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2" />
              <text x="400" y="210" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">BioLoop</text>
              
              <line x1="400" y1="140" x2="200" y2="50" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="200" cy="50" r="40" fill="#64748B" fillOpacity="0.2" stroke="#64748B" strokeWidth="2" />
              <text x="200" y="55" textAnchor="middle" fill="white" fontSize="14">Meridian</text>
              
              <line x1="400" y1="140" x2="600" y2="50" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="600" cy="50" r="40" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" />
              <text x="600" y="55" textAnchor="middle" fill="white" fontSize="14">Lumora</text>
              
              <line x1="400" y1="260" x2="200" y2="350" stroke="#14B8A6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="200" cy="350" r="40" fill="#14B8A6" fillOpacity="0.2" stroke="#14B8A6" strokeWidth="2" />
              <text x="200" y="355" textAnchor="middle" fill="white" fontSize="14">Lumis</text>
              
              <line x1="400" y1="260" x2="400" y2="350" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="400" cy="350" r="40" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2" />
              <text x="400" y="355" textAnchor="middle" fill="white" fontSize="14">Flux</text>
              
              <line x1="400" y1="260" x2="600" y2="350" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              <circle cx="600" cy="350" r="40" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2" />
              <text x="600" y="355" textAnchor="middle" fill="white" fontSize="14">Core</text>
            </svg>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            BioLoop is domain-agnostic. The same engine that predicts a student's dropout risk also anticipates a glucose spike and detects emotional depletion. One system. Five domains. Infinite applications.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-yellow-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">The Cadence System</h3>
              <p className="text-gray-300 leading-relaxed">
                Inside Lumora, BioLoop powers Cadence — an adaptive learning rhythm engine that knows when to push and when to rest. It tracks cognitive load, engagement patterns, and performance trends to optimize study timing and intensity for each individual learner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}