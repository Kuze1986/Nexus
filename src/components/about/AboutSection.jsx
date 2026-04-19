import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AboutSection() {
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const members = await base44.entities.TeamMember.list('order_index');
      return members.filter(m => m.is_visible);
    }
  });

  return (
    <section id="about" className="min-h-screen bg-gradient-to-b from-[#080C14] to-[#0a0f1a] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About NEXUS Holdings
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <p className="text-xl text-gray-300 leading-relaxed">
              Founded by a pharmacy technician instructor and technologist with 15 years of healthcare experience, NEXUS Holdings was built on a simple observation: the systems people use every day don't adapt to them. BioLoop changes that.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              We're building infrastructure that learns human behavior patterns and adjusts in real-time — across health, education, connection, and personal growth.
            </p>
          </div>
          
          <div>
            {teamMembers.length > 0 ? (
              <div className="space-y-6">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      {member.avatar_url && (
                        <img 
                          src={member.avatar_url} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                        <p className="text-gray-400 mb-3">{member.title}</p>
                        {member.bio && (
                          <p className="text-gray-300 text-sm leading-relaxed">{member.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-1">Brandon</h3>
                <p className="text-gray-400">Founder & Chief Architect</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <p className="text-xl text-gray-300 leading-relaxed">
            NEXUS Holdings is a Pittsburgh-based holding company operating at the intersection of behavioral intelligence, health technology, education, and human connection.
          </p>
        </div>
      </div>
    </section>
  );
}