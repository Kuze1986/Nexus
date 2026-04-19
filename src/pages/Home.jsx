import React from 'react';
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

const PRODUCTS = [
  {
    id: '1',
    name: 'Keystone',
    tagline: 'The Workforce Operating System',
    description:
      'Full-stack workforce management platform: student intake, cohorts, attendance, case files, credentials, career hub, and employer management. The platform engine every vertical is built on.',
    bioloop_role:
      'Tracks learner behavioral signals across the full workforce journey — from intake to placement — surfacing recommendations and risk flags in real time.',
    domain_color: '#4F46E5',
    stage: 'live',
    is_featured: true,
    order_index: 1,
  },
  {
    id: '2',
    name: 'Scripta',
    tagline: 'Modular Workforce LMS',
    description:
      '17 content packs, 51 courses, 306 lessons. Independently licensable or bundled with Keystone. Built for rapid deployment into any workforce training vertical.',
    bioloop_role:
      'Monitors engagement and knowledge retention patterns to adapt content sequencing and flag learners at risk of dropout before it happens.',
    domain_color: '#0EA5E9',
    stage: 'live',
    is_featured: true,
    order_index: 2,
  },
  {
    id: '3',
    name: 'The Shift',
    tagline: 'Workforce Simulation Platform',
    description:
      'Vertical-agnostic simulation engine for high-stakes workforce training. Pharmacy and CDL verticals live. The Queue mode delivers timed, scenario-based skill validation at scale.',
    bioloop_role:
      'Captures performance under pressure — reaction time, decision accuracy, stress response — feeding adaptive difficulty and predictive readiness scoring.',
    domain_color: '#F59E0B',
    stage: 'live',
    is_featured: true,
    order_index: 3,
  },
  {
    id: '4',
    name: 'Kuze',
    tagline: 'AI Twin. Sales Agent. Brand Voice.',
    description:
      "An AI trained on Brandon's voice and decision-making patterns. Three modes: Operator (internal ops), Insider (partner-facing), Ambassador (public outreach). Kuze runs the stack.",
    bioloop_role:
      "The intelligence layer's public face — surfaces BioLoop insights to partners and prospects in plain language, turning behavioral data into compelling narratives.",
    domain_color: '#8B5CF6',
    stage: 'live',
    is_featured: true,
    order_index: 4,
  },
  {
    id: '5',
    name: 'DemoForge',
    tagline: 'Autonomous Demo Delivery Engine',
    description:
      'Narrated by Kuze. Delivers fully autonomous, personalized product demos without a human in the room. Prospect walks in, demo runs, follow-up triggers automatically.',
    bioloop_role:
      'Tracks prospect engagement signals during demos — what they linger on, what they skip — informing follow-up sequencing and deal prioritization.',
    domain_color: '#10B981',
    stage: 'live',
    is_featured: false,
    order_index: 5,
  },
  {
    id: '6',
    name: 'Crucible',
    tagline: 'Stress-Testing Engine',
    description:
      'BioLoop Engine #29. Runs synthetic rejection scenarios across six personas and three difficulty tiers. Every content piece that ships gets put through Crucible first.',
    bioloop_role:
      'The adversarial layer of BioLoop — stress-tests behavioral predictions against edge cases before they reach real learners or partners.',
    domain_color: '#EF4444',
    stage: 'live',
    is_featured: false,
    order_index: 6,
  },
];

export default function Home() {
  const handleProductClick = (product) => {
    setTimeout(() => {
      document.getElementById(`product-${product.name.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="bg-[#080C14] min-h-screen">
      <Navigation />
      <HeroSection />
      <PortfolioSection products={PRODUCTS} onProductClick={handleProductClick} />
      {PRODUCTS.map((product) => (
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
