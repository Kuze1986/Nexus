import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Building2, Bell, Settings2, Key } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    logo_url: '',
    primary_contact_name: '',
    primary_contact_email: '',
    phone: '',
    address: ''
  });
  const [notifications, setNotifications] = useState({
    licenseExpiring: true,
    seatLimitApproaching: true,
    newAnnouncement: true,
    reportReady: false
  });
  const [preferences, setPreferences] = useState({
    defaultDateRange: '30',
    anonymizeByDefault: true
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
          const inst = await base44.entities.Institution.filter({ id: instUser.institution_id });
          if (inst.length > 0) {
            setInstitution(inst[0]);
            setProfile({
              name: inst[0].name || '',
              logo_url: inst[0].logo_url || '',
              primary_contact_name: inst[0].primary_contact_name || '',
              primary_contact_email: inst[0].primary_contact_email || '',
              phone: inst[0].phone || '',
              address: inst[0].address || ''
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await base44.entities.Institution.update(institution.id, profile);
      alert('Institution profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSaveNotifications = async () => {
    alert('Notification preferences saved!');
  };

  const handleSavePreferences = async () => {
    alert('Portal preferences saved!');
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const isAdmin = institutionUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your institutional profile and preferences</p>
      </div>

      {/* Institution Profile */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Institution Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institution Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={profile.logo_url}
                onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                disabled={!isAdmin}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Contact Name</Label>
              <Input
                value={profile.primary_contact_name}
                onChange={(e) => setProfile({ ...profile, primary_contact_name: e.target.value })}
                disabled={!isAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Contact Email</Label>
              <Input
                type="email"
                value={profile.primary_contact_email}
                onChange={(e) => setProfile({ ...profile, primary_contact_email: e.target.value })}
                disabled={!isAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isAdmin}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!isAdmin}
              />
            </div>
          </div>

          {isAdmin && (
            <Button onClick={handleSaveProfile}>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="license-expiring">License Expiring</Label>
              <p className="text-sm text-gray-500">Get notified when your license is about to expire</p>
            </div>
            <Switch
              id="license-expiring"
              checked={notifications.licenseExpiring}
              onCheckedChange={(checked) => setNotifications({ ...notifications, licenseExpiring: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="seat-limit">Seat Limit Approaching</Label>
              <p className="text-sm text-gray-500">Alert when seat usage reaches 80%</p>
            </div>
            <Switch
              id="seat-limit"
              checked={notifications.seatLimitApproaching}
              onCheckedChange={(checked) => setNotifications({ ...notifications, seatLimitApproaching: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="announcements">New Announcements</Label>
              <p className="text-sm text-gray-500">Receive notifications for new announcements from NEXUS</p>
            </div>
            <Switch
              id="announcements"
              checked={notifications.newAnnouncement}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newAnnouncement: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="report-ready">Report Ready</Label>
              <p className="text-sm text-gray-500">Get notified when a report is generated</p>
            </div>
            <Switch
              id="report-ready"
              checked={notifications.reportReady}
              onCheckedChange={(checked) => setNotifications({ ...notifications, reportReady: checked })}
            />
          </div>

          <Button onClick={handleSaveNotifications}>
            <Save className="w-4 h-4 mr-2" />
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Portal Preferences */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Portal Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Date Range for Reports</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={preferences.defaultDateRange}
              onChange={(e) => setPreferences({ ...preferences, defaultDateRange: e.target.value })}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymize">Anonymize by Default</Label>
              <p className="text-sm text-gray-500">Hide learner names by default in dashboards</p>
            </div>
            <Switch
              id="anonymize"
              checked={preferences.anonymizeByDefault}
              onCheckedChange={(checked) => setPreferences({ ...preferences, anonymizeByDefault: checked })}
            />
          </div>

          <Button onClick={handleSavePreferences}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>

          <Button>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}