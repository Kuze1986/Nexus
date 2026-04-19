import React from 'react';

const stats = [
  { value: '6', label: 'Live Products', sublabel: 'All deployed on Railway' },
  { value: '306', label: 'Scripta Lessons', sublabel: '17 packs · 51 courses' },
  { value: '1', label: 'Intelligence Engine', sublabel: 'BioLoop powers everything' },
];

const milestones = [
  {
    date: 'Jan 2026',
    label: 'NEXUS Holdings Founded',
    description: 'Solo-founded out of Braddock, PA. Vision: behavioral intelligence infrastructure for workforce development.',
  },
  {
    date: 'Feb 2026',
    label: 'Meridian → Keystone',
    description: 'Internal pharmacy tech tool rebuilt as Keystone — a horizontal workforce OS deployable across any vertical.',
  },
  {
    date: 'Feb 2026',
    label: 'Full Stack Migration',
    description: '27 apps migrated off Base44 onto self-hosted Railway + Supabase infrastructure in a single sprint.',
  },
  {
    date: 'Mar 2026',
    label: 'The Shift Goes Live',
    description: 'Workforce simulation platform launched. Pharmacy and CDL verticals installed. 1,215 questions across 9 tracks.',
  },
  {
    date: 'Mar 2026',
    label: 'Scripta Complete',
    description: '17 content packs, 51 courses, 306 lessons. Independently licensable LMS ready for institutional deployment.',
  },
  {
    date: 'Apr 2026',
    label: 'DemoForge + Crucible Live',
    description: 'Autonomous demo delivery engine and 6-persona stress-testing layer deployed across the full portfolio.',
  },
  {
    date: 'Apr 2026',
    label: 'NEXUS SSO Deployed',
    description: 'Single sign-on across the full product stack. One session, every platform.',
  },
  {
    date: 'Q2 2026',
    label: 'Kuze Outreach Campaign',
    description: 'Kuze-narrated autonomous outreach begins. First Founding Partner agreements targeting workforce orgs.',
  },
];

export default function TractionSection() {
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
                <div key={index} className="flex-shrink-0 w-64 relative">
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

        <div className="p-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
          <blockquote className="text-2xl text-gray-400 italic">
            "What our partners say — coming soon."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
