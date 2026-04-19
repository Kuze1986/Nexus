import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import ParticleField from './ParticleField';

export default function HeroSection() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-white/80 tracking-wide">NEXUS HOLDINGS</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
          Human-State Intelligence<br/>
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            for the Way People Actually Live
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          NEXUS Holdings builds adaptive platforms powered by BioLoop — the behavioral intelligence engine that learns how people behave and adjusts systems around them.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => scrollToSection('portfolio')}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            Explore the Portfolio
          </Button>
          <Button
            onClick={() => scrollToSection('contact')}
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-medium rounded-full transition-all duration-300"
          >
            Request a Demo
          </Button>
        </div>
        
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/50" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080C14] pointer-events-none" />
    </section>
  );
}