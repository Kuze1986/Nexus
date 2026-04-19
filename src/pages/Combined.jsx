import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Combined() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [compliance, setCompliance] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const instUsers = await base44.entities.InstitutionUser.filter({ email: user.email });
      
      if (instUsers.length > 0) {
        const instUser = instUsers[0];
        setInstitutionUser(instUser);

        if (instUser.institution_id) {
          const compData = await base44.entities.ComplianceSnapshot.filter({ 
            institution_id: instUser.institution_id 
          });
          
          if (compData.length > 0) {
            setCompliance(compData[compData.length - 1]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!compliance) return <div className="text-white">No data available</div>;

  // Calculate unified completion rate
  const complianceRate = compliance.overall_compliance_rate;
  const mockProgressRate = 67.5; // This would come from actual Lumora data
  const unifiedCompletionRate = (complianceRate + mockProgressRate) / 2;

  const compliancePipeline = [
    { 
      name: 'Intake', 
      count: compliance.students_with_completed_intake, 
      total: compliance.total_students,
      color: 'bg-[#1E40AF]'
    },
    { 
      name: 'Agreements', 
      count: compliance.students_with_signed_agreements, 
      total: compliance.total_students,
      color: 'bg-[#1E40AF]'
    },
    { 
      name: 'Background', 
      count: compliance.students_with_background_check, 
      total: compliance.total_students,
      color: 'bg-[#1E40AF]'
    },
    { 
      name: 'Externship', 
      count: compliance.students_active_in_externship, 
      total: compliance.total_students,
      color: 'bg-[#1E40AF]'
    }
  ];

  const progressPipeline = [
    { name: 'Enrolled', count: 45, total: 45, color: 'bg-[#B45309]' },
    { name: 'In Progress', count: 35, total: 45, color: 'bg-[#B45309]' },
    { name: 'Completed', count: 28, total: 45, color: 'bg-[#B45309]' },
    { name: 'Certified', count: 18, total: 45, color: 'bg-[#B45309]' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Combined Student Lifecycle View</h1>
        <p className="text-gray-400 mt-1">Full Meridian + Lumora journey in one dashboard</p>
      </div>

      {/* Unified Completion Rate */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-48 h-48 mb-4">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E5E7EB"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(unifiedCompletionRate / 100) * 553} 553`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1E40AF" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute">
                <p className="text-5xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#B45309] bg-clip-text text-transparent">
                  {unifiedCompletionRate.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500">Lifecycle Complete</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Unified Student Lifecycle Completion</h2>
            <p className="text-gray-600 mt-2">
              Combining compliance readiness and learning outcomes
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Pipeline (Meridian) */}
        <Card className="bg-white">
          <CardHeader className="border-b bg-[#1E40AF]/10">
            <CardTitle className="text-[#1E40AF]">Compliance Status Pipeline (Meridian)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {compliancePipeline.map((stage, index) => (
                <div key={stage.name}>
                  <div className="flex items-center gap-3">
                    <div className={`${stage.color} rounded-full p-2 text-white`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{stage.name}</span>
                        <span className="text-sm text-gray-600">
                          {stage.count} / {stage.total}
                        </span>
                      </div>
                      <Progress value={(stage.count / stage.total) * 100} className="h-2" />
                    </div>
                  </div>
                  {index < compliancePipeline.length - 1 && (
                    <div className="ml-5 my-2">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress Pipeline (Lumora) */}
        <Card className="bg-white">
          <CardHeader className="border-b bg-[#B45309]/10">
            <CardTitle className="text-[#B45309]">Learning Progress Pipeline (Lumora)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {progressPipeline.map((stage, index) => (
                <div key={stage.name}>
                  <div className="flex items-center gap-3">
                    <div className={`${stage.color} rounded-full p-2 text-white`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{stage.name}</span>
                        <span className="text-sm text-gray-600">
                          {stage.count} / {stage.total}
                        </span>
                      </div>
                      <Progress value={(stage.count / stage.total) * 100} className="h-2" />
                    </div>
                  </div>
                  {index < progressPipeline.length - 1 && (
                    <div className="ml-5 my-2">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Journey Summary */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Complete Student Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-l-4 border-[#1E40AF] pl-4">
              <p className="text-sm text-gray-600">Compliance Ready</p>
              <p className="text-2xl font-bold text-[#1E40AF]">{complianceRate.toFixed(0)}%</p>
            </div>
            <div className="border-l-4 border-[#B45309] pl-4">
              <p className="text-sm text-gray-600">Learning Complete</p>
              <p className="text-2xl font-bold text-[#B45309]">{mockProgressRate.toFixed(0)}%</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <p className="text-sm text-gray-600">Externship Active</p>
              <p className="text-2xl font-bold text-green-600">{compliance.students_active_in_externship}</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-600">Program Complete</p>
              <p className="text-2xl font-bold text-purple-600">{compliance.students_completed_program}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}