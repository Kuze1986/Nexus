import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function License() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [usageSummary, setUsageSummary] = useState([]);
  const [showLicenseKey, setShowLicenseKey] = useState({});

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
          const [inst, lics, usage] = await Promise.all([
            base44.entities.Institution.filter({ id: instUser.institution_id }),
            base44.entities.LicenseRecord.filter({ institution_id: instUser.institution_id }),
            base44.entities.UsageSummary.filter({ institution_id: instUser.institution_id })
          ]);

          if (inst.length > 0) setInstitution(inst[0]);
          setLicenses(lics);
          setUsageSummary(usage);
        }
      }
    } catch (error) {
      console.error('Error loading license data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSeatIncrease = async () => {
    try {
      await base44.entities.SupportTicket.create({
        institution_id: institutionUser.institution_id,
        submitted_by: institutionUser.id,
        submitted_at: new Date().toISOString(),
        subject: 'Request for Seat Increase',
        description: 'I would like to request additional seats for our license.',
        category: 'license',
        status: 'open',
        priority: 'normal'
      });

      alert('Seat increase request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const activeLicense = licenses.find(l => l.status === 'active' || l.status === 'expiring_soon');
  const daysUntilExpiry = activeLicense ? differenceInDays(new Date(activeLicense.valid_until), new Date()) : 0;

  // Mock usage data for chart
  const chartData = Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    seats: Math.floor(Math.random() * 10) + 15
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">License & Billing</h1>
        <p className="text-gray-400 mt-1">Manage your institutional license and usage</p>
      </div>

      {/* License Status Alert */}
      {activeLicense && daysUntilExpiry <= 60 && daysUntilExpiry > 0 && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your license expires in {daysUntilExpiry} days ({format(new Date(activeLicense.valid_until), 'MMM d, yyyy')}). 
            Contact your account manager to renew.
          </AlertDescription>
        </Alert>
      )}

      {/* License Details */}
      {licenses.map((license) => (
        <Card key={license.id} className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                License Details - {license.product.toUpperCase()}
              </CardTitle>
              <Badge className={
                license.status === 'active' ? 'bg-green-500' :
                license.status === 'expiring_soon' ? 'bg-amber-500' :
                license.status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
              }>
                {license.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold mt-1">{license.product}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Plan Type</p>
                <p className="font-semibold mt-1">{license.plan_type.replace(/_/g, ' ')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Max Seats</p>
                <p className="font-semibold mt-1">{license.max_seats}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Valid From</p>
                <p className="font-semibold mt-1">{format(new Date(license.valid_from), 'MMM d, yyyy')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p className="font-semibold mt-1">{format(new Date(license.valid_until), 'MMM d, yyyy')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Auto-Renew</p>
                <p className="font-semibold mt-1">{license.auto_renew ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">License Key</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">
                    {showLicenseKey[license.id] ? license.license_key : '••••••••••••'}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLicenseKey({ ...showLicenseKey, [license.id]: !showLicenseKey[license.id] })}
                  >
                    {showLicenseKey[license.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {license.contract_url && (
                <div>
                  <p className="text-sm text-gray-500">Contract</p>
                  <Button size="sm" variant="outline" className="mt-1" asChild>
                    <a href={license.contract_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {license.monthly_rate && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rate</p>
                    <p className="text-2xl font-bold">${license.monthly_rate.toLocaleString()}</p>
                  </div>
                  {license.annual_rate && (
                    <div>
                      <p className="text-sm text-gray-500">Annual Rate</p>
                      <p className="text-2xl font-bold">${license.annual_rate.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Seat Usage Over Time */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Seat Usage (Last 90 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Active Seats', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="seats" stroke="#1E40AF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage Summary History */}
      {usageSummary.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Usage Summary History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Active Users</TableHead>
                  <TableHead>Total Events</TableHead>
                  <TableHead>Avg Session (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageSummary.map((summary) => (
                  <TableRow key={summary.id}>
                    <TableCell>
                      <Badge className={summary.product === 'meridian' ? 'bg-[#1E40AF]' : 'bg-[#B45309]'}>
                        {summary.product}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(summary.period_start), 'MMM d')} - {format(new Date(summary.period_end), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{summary.active_users}</TableCell>
                    <TableCell>{summary.total_events.toLocaleString()}</TableCell>
                    <TableCell>{summary.avg_session_minutes.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleRequestSeatIncrease} variant="outline">
          Request Seat Increase
        </Button>
        <Button asChild>
          <Link to={createPageUrl('Support')}>
            Renew / Upgrade License
          </Link>
        </Button>
      </div>
    </div>
  );
}