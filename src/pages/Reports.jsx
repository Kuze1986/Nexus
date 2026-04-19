import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [customReport, setCustomReport] = useState({
    startDate: '',
    endDate: '',
    product: '',
    reportType: ''
  });

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
          const reportData = await base44.entities.PortalReport.filter({ 
            institution_id: instUser.institution_id 
          });
          setReports(reportData);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReport = async (type) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      await base44.entities.PortalReport.create({
        institution_id: institutionUser.institution_id,
        generated_by: institutionUser.id,
        generated_at: new Date().toISOString(),
        report_type: type,
        period_start: thirtyDaysAgo.toISOString().split('T')[0],
        period_end: today.toISOString().split('T')[0],
        pdf_url: `https://placeholder-${type}-report.pdf`
      });

      alert('Report generated successfully!');
      loadData();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleCustomReport = async () => {
    try {
      await base44.entities.PortalReport.create({
        institution_id: institutionUser.institution_id,
        generated_by: institutionUser.id,
        generated_at: new Date().toISOString(),
        report_type: customReport.reportType || 'enrollment',
        period_start: customReport.startDate,
        period_end: customReport.endDate,
        pdf_url: 'https://placeholder-custom-report.pdf',
        parameters: JSON.stringify({ product: customReport.product })
      });

      alert('Custom report generated successfully!');
      setCustomReport({ startDate: '', endDate: '', product: '', reportType: '' });
      loadData();
    } catch (error) {
      console.error('Error generating custom report:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.report_type === filterType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Generate and access institutional reports</p>
      </div>

      {/* Quick Reports */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => handleQuickReport('enrollment')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">Enrollment Summary</span>
              <span className="text-xs text-gray-500">Current period</span>
            </Button>
            
            <Button onClick={() => handleQuickReport('compliance')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">Compliance Snapshot</span>
              <span className="text-xs text-gray-500">Current</span>
            </Button>
            
            <Button onClick={() => handleQuickReport('progress')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">Learner Progress</span>
              <span className="text-xs text-gray-500">Current period</span>
            </Button>
            
            <Button onClick={() => handleQuickReport('license')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">License Usage</span>
              <span className="text-xs text-gray-500">Current</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Reports */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Custom Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={customReport.startDate}
                onChange={(e) => setCustomReport({ ...customReport, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={customReport.endDate}
                onChange={(e) => setCustomReport({ ...customReport, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={customReport.product} onValueChange={(value) => setCustomReport({ ...customReport, product: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="meridian">Meridian</SelectItem>
                  <SelectItem value="lumora">Lumora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={customReport.reportType} onValueChange={(value) => setCustomReport({ ...customReport, reportType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrollment">Enrollment</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCustomReport}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Custom Report
          </Button>
        </CardContent>
      </Card>

      {/* Grant-Ready Exports */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Grant-Ready Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={() => handleQuickReport('grant_ready')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">WIOA Format</span>
              <span className="text-xs text-gray-500">Workforce reporting</span>
            </Button>
            
            <Button onClick={() => handleQuickReport('grant_ready')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">HUD Format</span>
              <span className="text-xs text-gray-500">Workforce programs</span>
            </Button>
            
            <Button onClick={() => handleQuickReport('grant_ready')} variant="outline" className="h-auto flex-col py-4">
              <FileText className="w-8 h-8 mb-2" />
              <span className="font-semibold">Nonprofit Format</span>
              <span className="text-xs text-gray-500">General outcomes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report History</CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="grant_ready">Grant-Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {report.report_type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.period_start && report.period_end ? (
                      <span className="text-sm">
                        {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{report.generated_by}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(report.generated_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    {report.pdf_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}