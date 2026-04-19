import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: '1',
    category: 'product',
    order_index: 1,
    question: 'What is NEXUS Holdings?',
    answer:
      'NEXUS Holdings is a multi-product workforce development and behavioral intelligence company. We build adaptive platforms powered by BioLoop — the intelligence engine that learns how people behave and adjusts systems around them.',
  },
  {
    id: '2',
    category: 'product',
    order_index: 2,
    question: 'What products are currently live?',
    answer:
      'Keystone (workforce OS), Scripta (LMS), The Shift (simulation platform), Kuze (AI twin), DemoForge (autonomous demo engine), and Crucible (stress-testing layer) are all live and in active deployment.',
  },
  {
    id: '3',
    category: 'product',
    order_index: 3,
    question: 'Are the products sold separately or as a suite?',
    answer:
      'Both. Each product is independently licensable. They are also designed to compound — Keystone + Scripta + The Shift is the full workforce training stack, with BioLoop connecting intelligence across all three.',
  },
  {
    id: '4',
    category: 'bioloop',
    order_index: 1,
    question: 'What is BioLoop?',
    answer:
      'BioLoop is the behavioral intelligence substrate running under every NEXUS product. It tracks human-state signals — engagement, stress, decision patterns, performance — and feeds adaptive recommendations back into the platform in real time.',
  },
  {
    id: '5',
    category: 'bioloop',
    order_index: 2,
    question: 'Is BioLoop a separate product?',
    answer:
      'No. BioLoop is infrastructure, not a product. It is the engine. Every NEXUS platform is a vertical expression of BioLoop applied to a specific domain — workforce, simulation, sales, or testing.',
  },
  {
    id: '6',
    category: 'partnership',
    order_index: 1,
    question: 'How do institutional partnerships work?',
    answer:
      'Institutions license one or more NEXUS products for their programs. We offer a Founding Partner tier with preferred pricing, direct access to the product roadmap, and data-sharing agreements that deepen BioLoop\'s intelligence over time.',
  },
  {
    id: '7',
    category: 'partnership',
    order_index: 2,
    question: 'Who is the right institutional partner?',
    answer:
      'Workforce development organizations, pharmacy tech programs, CDL training providers, and any institution running structured cohort-based training. If you move people from zero to credentialed, we built this for you.',
  },
  {
    id: '8',
    category: 'investment',
    order_index: 1,
    question: 'Is NEXUS raising?',
    answer:
      'We are selectively speaking with strategic investors and partners who understand workforce infrastructure. We are not raising broadly. If you have a specific thesis, reach out directly.',
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState(0);

  const faqItems = FAQ_ITEMS;

  const categories = ['product', 'bioloop', 'investment', 'partnership'];
  const groupedFAQs = categories.reduce((acc, category) => {
    acc[category] = faqItems.filter((item) => item.category === category);
    return acc;
  }, {});

  const categoryLabels = {
    product: 'Products',
    bioloop: 'BioLoop Technology',
    investment: 'Investment',
    partnership: 'Partnerships',
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
                {items.map((item) => {
                  const itemIndex = faqItems.findIndex((f) => f.id === item.id);
                  const isOpen = openItem === itemIndex;

                  return (
                    <div
                      key={item.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                    >
                      <button
                        type="button"
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
