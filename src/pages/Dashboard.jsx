import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, TrendingUp, Package, AlertTriangle, Download, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [seats, setSeats] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [usageSummary, setUsageSummary] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await base44.auth.me();
      const instUsers = await base44.entities.InstitutionUser.filter({ email: user.email });
      
      if (instUsers.length > 0) {
        const instUser = instUsers[0];
        setInstitutionUser(instUser);

        if (instUser.institution_id) {
          const [inst, lics, seatData, compData, reportData, announcementData, usageData] = await Promise.all([
            base44.entities.Institution.filter({ id: instUser.institution_id }),
            base44.entities.LicenseRecord.filter({ institution_id: instUser.institution_id }),
            base44.entities.SeatAllocation.filter({ institution_id: instUser.institution_id, is_active: true }),
            base44.entities.ComplianceSnapshot.filter({ institution_id: instUser.institution_id }),
            base44.entities.PortalReport.filter({ institution_id: instUser.institution_id }),
            base44.entities.Announcement.list(),
            base44.entities.UsageSummary.filter({ institution_id: instUser.institution_id })
          ]);

          if (inst.length > 0) setInstitution(inst[0]);
          setLicenses(lics);
          setSeats(seatData);
          setCompliance(compData.length > 0 ? compData[compData.length - 1] : null);
          setReports(reportData.slice(0, 5));
          
          // Filter announcements for this institution
          const relevantAnnouncements = announcementData.filter(a => 
            !a.target_institution_ids || 
            a.target_institution_ids.length === 0 || 
            a.target_institution_ids.includes(instUser.institution_id)
          ).filter(a => {
            if (!a.expires_at) return true;
            return new Date(a.expires_at) > new Date();
          }).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
          
          setAnnouncements(relevantAnnouncements.slice(0, 3));
          setUsageSummary(usageData);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  const activeLicense = licenses.find(l => l.status === 'active' || l.status === 'expiring_soon');
  const totalSeatsUsed = seats.length;
  const maxSeats = licenses.reduce((sum, l) => sum + l.max_seats, 0);
  const seatPercentage = maxSeats > 0 ? (totalSeatsUsed / maxSeats) * 100 : 0;

  const daysUntilExpiry = activeLicense ? differenceInDays(new Date(activeLicense.valid_until), new Date()) : 0;
  const isExpiringSoon = daysUntilExpiry <= 60 && daysUntilExpiry > 0;

  const activeProducts = [...new Set(seats.map(s => s.product))];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      {institution && (
        <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
          {institution.logo_url && (
            <img src={institution.logo_url} alt={institution.name} className="h-16 w-16 object-contain" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome to {institution.name}</h1>
            <p className="text-gray-400 mt-1">Your institutional dashboard</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Seats Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalSeatsUsed} / {maxSeats}
            </div>
            <Progress 
              value={seatPercentage} 
              className={`mt-2 ${seatPercentage >= 95 ? 'bg-red-100' : seatPercentage >= 80 ? 'bg-amber-100' : 'bg-gray-100'}`}
            />
            <p className="text-xs text-gray-500 mt-1">{seatPercentage.toFixed(0)}% utilized</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              License Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeLicense ? (
              <>
                <Badge className={
                  activeLicense.status === 'active' ? 'bg-green-500' :
                  activeLicense.status === 'expiring_soon' ? 'bg-amber-500' : 'bg-red-500'
                }>
                  {activeLicense.status === 'active' ? 'Active' : 
                   activeLicense.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired'}
                </Badge>
                {activeLicense.status === 'expiring_soon' && (
                  <p className="text-sm text-gray-600 mt-2">{daysUntilExpiry} days remaining</p>
                )}
              </>
            ) : (
              <Badge className="bg-gray-500">No Active License</Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overall Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compliance ? (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {compliance.overall_compliance_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Current period</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Programs Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeProducts.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeProducts.join(', ') || 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Latest Compliance Snapshot */}
          {compliance && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Latest Compliance Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Intake Forms</span>
                    <span className="font-medium">{compliance.students_with_completed_intake} / {compliance.total_students}</span>
                  </div>
                  <Progress value={(compliance.students_with_completed_intake / compliance.total_students) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Signed Agreements</span>
                    <span className="font-medium">{compliance.students_with_signed_agreements} / {compliance.total_students}</span>
                  </div>
                  <Progress value={(compliance.students_with_signed_agreements / compliance.total_students) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Background Checks</span>
                    <span className="font-medium">{compliance.students_with_background_check} / {compliance.total_students}</span>
                  </div>
                  <Progress value={(compliance.students_with_background_check / compliance.total_students) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Drug Screening</span>
                    <span className="font-medium">{compliance.students_with_drug_screen} / {compliance.total_students}</span>
                  </div>
                  <Progress value={(compliance.students_with_drug_screen / compliance.total_students) * 100} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Expiring Soon Alert */}
          {isExpiringSoon && (
            <Alert className="border-amber-500 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your license expires in {daysUntilExpiry} days. 
                <Link to={createPageUrl('License')} className="underline ml-1">View details</Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Pinned Announcements */}
          {announcements.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      {announcement.is_pinned && (
                        <Badge variant="outline" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(announcement.published_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{report.report_type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-gray-500">
                      {report.period_start && report.period_end ? 
                        `${format(new Date(report.period_start), 'MMM d')} - ${format(new Date(report.period_end), 'MMM d, yyyy')}` :
                        format(new Date(report.generated_at), 'MMM d, yyyy')
                      }
                    </p>
                  </div>
                  {report.pdf_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}