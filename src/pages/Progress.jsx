import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, TrendingUp, AlertCircle, Award } from 'lucide-react';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [showNames, setShowNames] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const instUsers = await base44.entities.InstitutionUser.filter({ email: user.email });
      
      if (instUsers.length > 0) {
        setInstitutionUser(instUsers[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProgressReport = async () => {
    try {
      await base44.entities.PortalReport.create({
        institution_id: institutionUser.institution_id,
        generated_by: institutionUser.id,
        generated_at: new Date().toISOString(),
        report_type: 'progress',
        pdf_url: 'https://placeholder-report.pdf'
      });
      alert('Progress report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const isAdmin = institutionUser?.role === 'admin';

  // Mock data for demonstration
  const stats = {
    avgCompletionRate: 67.5,
    avgAssessmentScore: 82.3,
    certificatesIssued: 18,
    atRiskLearners: 4
  };

  const courses = [
    { name: 'Pharmacy Technician Fundamentals', enrolled: 45, started: 42, inProgress: 28, completed: 23 },
    { name: 'PTCB Exam Preparation', enrolled: 38, started: 35, inProgress: 22, completed: 15 },
    { name: 'Pharmacy Law & Ethics', enrolled: 42, started: 40, inProgress: 25, completed: 20 }
  ];

  const ptcbDomains = [
    { name: 'Medications', score: 85 },
    { name: 'Federal Requirements', score: 78 },
    { name: 'Patient Safety', score: 92 },
    { name: 'Order Entry', score: 80 },
    { name: 'Inventory Management', score: 75 }
  ];

  const atRiskLearners = [
    { id: 'LRN-0001', name: 'Learner 1', lastActive: '2026-02-07', completion: 32, avgScore: 68, reason: 'Stalled 7+ days' },
    { id: 'LRN-0014', name: 'Learner 14', lastActive: '2026-02-12', completion: 45, avgScore: 55, reason: 'Failed 3+ assessments' },
    { id: 'LRN-0022', name: 'Learner 22', lastActive: '2026-02-05', completion: 28, avgScore: 72, reason: 'Stalled 7+ days' },
    { id: 'LRN-0031', name: 'Learner 31', lastActive: '2026-02-11', completion: 38, avgScore: 58, reason: 'Failed 3+ assessments' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Learner Progress</h1>
        <p className="text-gray-400 mt-1">Lumora learning analytics and outcomes</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#B45309]">{stats.avgCompletionRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Avg Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#B45309]">{stats.avgAssessmentScore}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Certificates Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{stats.certificatesIssued}</p>
            <p className="text-xs text-gray-500 mt-1">This period</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              At-Risk Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.atRiskLearners}</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Completion Funnel */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Course Completion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.map((course) => (
            <div key={course.name}>
              <h4 className="font-semibold mb-2">{course.name}</h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Enrolled</p>
                  <p className="text-lg font-bold">{course.enrolled}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Started</p>
                  <p className="text-lg font-bold text-blue-600">{course.started}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-lg font-bold text-amber-600">{course.inProgress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-green-600">{course.completed}</p>
                </div>
              </div>
              <Progress value={(course.completed / course.enrolled) * 100} className="mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PTCB Domain Mastery */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>PTCB Domain Mastery (Aggregate)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ptcbDomains.map((domain) => (
              <div key={domain.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{domain.name}</span>
                  <span className="font-medium">{domain.score}%</span>
                </div>
                <Progress value={domain.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Learners */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>At-Risk Learners</CardTitle>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Switch checked={showNames} onCheckedChange={setShowNames} id="show-names-progress" />
                  <Label htmlFor="show-names-progress" className="text-sm">Show Names</Label>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Completion %</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Flag Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atRiskLearners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell className="font-medium">
                    {showNames && isAdmin ? learner.name : learner.id}
                  </TableCell>
                  <TableCell>{learner.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{learner.completion}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={learner.avgScore < 70 ? 'bg-red-500' : 'bg-amber-500'}>
                      {learner.avgScore}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{learner.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-between">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button onClick={handleGenerateProgressReport} className="bg-[#B45309] hover:bg-[#B45309]/90">
              <FileText className="w-4 h-4 mr-2" />
              Generate Program Progress Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}