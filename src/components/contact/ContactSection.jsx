import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/api/supabaseClient';
import { CheckCircle2, Building2, TrendingUp, Handshake } from 'lucide-react';

const inquiryTypes = [
  { 
    id: 'institutional', 
    title: 'Institutional Partnership',
    description: 'Healthcare systems, universities, and enterprise organizations',
    icon: Building2,
    products: ['Meridian', 'Lumora']
  },
  { 
    id: 'investment', 
    title: 'Investment Inquiry',
    description: 'VC firms, strategic investors, and angel investors',
    icon: TrendingUp,
    products: []
  },
  { 
    id: 'strategic', 
    title: 'Strategic Partnership',
    description: 'Technology partners and integration opportunities',
    icon: Handshake,
    products: []
  }
];

export default function ContactSection() {
  const [selectedType, setSelectedType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
    product_interest: [],
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      product_interest: type.products,
      role: type.id === 'investment' ? 'Investor' : type.id === 'institutional' ? 'Institutional Partner' : 'Strategic Partner'
    }));
  };

  const openMailtoFallback = () => {
    const subject = encodeURIComponent('NEXUS demo / partnership inquiry');
    const body = encodeURIComponent(
      [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        `Organization: ${formData.organization}`,
        `Role: ${formData.role}`,
        `Product interest: ${(formData.product_interest || []).join(', ') || '—'}`,
        '',
        formData.message || '',
      ].join('\n')
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      organization: formData.organization,
      role: formData.role,
      message: formData.message || null,
      product_interest: formData.product_interest || [],
      submitted_at: new Date().toISOString(),
      status: 'new',
    };

    try {
      const { error } = await supabase.schema('nexus').from('demo_requests').insert(payload);
      if (error) {
        openMailtoFallback();
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting demo request:', error);
      openMailtoFallback();
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="contact" className="min-h-screen bg-gradient-to-b from-[#080C14] to-[#0a0f1a] py-24 px-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Request Received</h2>
          <p className="text-xl text-gray-300">
            We'll be in touch within 48 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="min-h-screen bg-gradient-to-b from-[#080C14] to-[#0a0f1a] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Let's Talk.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Choose Your Path</h3>
            <div className="space-y-4">
              {inquiryTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType?.id === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      isSelected 
                        ? 'border-white bg-white/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-2">{type.title}</h4>
                        <p className="text-gray-400 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Request a Demo</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white mb-2 block">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="your.email@company.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="organization" className="text-white mb-2 block">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Your organization"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-white mb-2 block">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  placeholder="Your title or role"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-white mb-2 block">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[120px]"
                  placeholder="Tell us about your needs..."
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg bg-white text-gray-900 hover:bg-gray-100 rounded-xl"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}