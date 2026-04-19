import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Shield } from 'lucide-react';

export default function Compliance() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [showNames, setShowNames] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

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
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGrantReport = async () => {
    try {
      await base44.entities.PortalReport.create({
        institution_id: institutionUser.institution_id,
        generated_by: institutionUser.id,
        generated_at: new Date().toISOString(),
        report_type: 'grant_ready',
        pdf_url: 'https://placeholder-report.pdf',
        parameters: JSON.stringify({ compliance_snapshot_id: compliance.id })
      });
      alert('Grant-ready report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!compliance) return <div className="text-white">No compliance data available</div>;

  const isAdmin = institutionUser?.role === 'admin';

  const categories = [
    { 
      name: 'Intake Forms', 
      completed: compliance.students_with_completed_intake, 
      total: compliance.total_students 
    },
    { 
      name: 'Signed Agreements', 
      completed: compliance.students_with_signed_agreements, 
      total: compliance.total_students 
    },
    { 
      name: 'Background Check', 
      completed: compliance.students_with_background_check, 
      total: compliance.total_students 
    },
    { 
      name: 'Drug Screening', 
      completed: compliance.students_with_drug_screen, 
      total: compliance.total_students 
    },
    { 
      name: 'Active Externship', 
      completed: compliance.students_active_in_externship, 
      total: compliance.total_students 
    },
    { 
      name: 'Program Completion', 
      completed: compliance.students_completed_program, 
      total: compliance.total_students 
    }
  ];

  const mockStudents = Array.from({ length: compliance.total_students }, (_, i) => ({
    id: `STU-${String(i + 1).padStart(4, '0')}`,
    name: `Student ${i + 1}`,
    intake: Math.random() > 0.2,
    agreements: Math.random() > 0.15,
    background: Math.random() > 0.25,
    drugScreen: Math.random() > 0.3,
    externship: Math.random() > 0.4,
    completion: Math.random() > 0.5
  })).map(student => ({
    ...student,
    status: [student.intake, student.agreements, student.background, student.drugScreen, student.externship, student.completion].filter(Boolean).length === 6 ? 'compliant' :
            [student.intake, student.agreements, student.background, student.drugScreen, student.externship, student.completion].filter(Boolean).length >= 3 ? 'partial' : 'non-compliant'
  }));

  const filteredStudents = filterStatus === 'all' ? mockStudents : mockStudents.filter(s => {
    if (filterStatus === 'compliant') return s.status === 'compliant';
    if (filterStatus === 'partial') return s.status === 'partial';
    if (filterStatus === 'non-compliant') return s.status === 'non-compliant';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
        <p className="text-gray-400 mt-1">Meridian compliance health overview</p>
      </div>

      {/* Overall Compliance Ring */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-48 h-48">
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
                    stroke="#1E40AF"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(compliance.overall_compliance_rate / 100) * 553} 553`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute">
                  <p className="text-5xl font-bold text-[#1E40AF]">{compliance.overall_compliance_rate.toFixed(0)}%</p>
                  <p className="text-sm text-gray-500">Compliant</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold mb-4">Overall Compliance Rate</h3>
              <p className="text-gray-600">
                {compliance.total_students} students tracked across 6 compliance categories
              </p>
              <Button onClick={handleGenerateGrantReport} className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 mt-4">
                <FileText className="w-4 h-4 mr-2" />
                Generate Grant-Ready Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const percentage = (category.completed / category.total) * 100;
          return (
            <Card key={category.name} className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{category.completed}</span>
                    <span className="text-sm text-gray-500">/ {category.total}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{percentage.toFixed(0)}% complete</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Student-Level Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student-Level Compliance</CardTitle>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Switch checked={showNames} onCheckedChange={setShowNames} id="show-names" />
                  <Label htmlFor="show-names" className="text-sm">Show Names</Label>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
                  All
                </Button>
                <Button size="sm" variant={filterStatus === 'compliant' ? 'default' : 'outline'} onClick={() => setFilterStatus('compliant')}>
                  Compliant
                </Button>
                <Button size="sm" variant={filterStatus === 'partial' ? 'default' : 'outline'} onClick={() => setFilterStatus('partial')}>
                  Partial
                </Button>
                <Button size="sm" variant={filterStatus === 'non-compliant' ? 'default' : 'outline'} onClick={() => setFilterStatus('non-compliant')}>
                  Non-Compliant
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Intake</TableHead>
                <TableHead className="text-center">Agreements</TableHead>
                <TableHead className="text-center">Background</TableHead>
                <TableHead className="text-center">Drug Screen</TableHead>
                <TableHead className="text-center">Externship</TableHead>
                <TableHead className="text-center">Completion</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {showNames && isAdmin ? student.name : student.id}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.intake ? '✓' : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.agreements ? '✓' : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.background ? '✓' : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.drugScreen ? '✓' : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.externship ? '✓' : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.completion ? '✓' : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      student.status === 'compliant' ? 'bg-green-500' :
                      student.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'
                    }>
                      {student.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}