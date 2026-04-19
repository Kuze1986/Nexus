import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminLicenses() {
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [formData, setFormData] = useState({
    institution_id: '',
    product: 'both',
    plan_type: 'full_platform',
    max_seats: 50,
    seats_used: 0,
    valid_from: '',
    valid_until: '',
    monthly_rate: 0,
    annual_rate: 0,
    auto_renew: false,
    status: 'active',
    license_key: '',
    contract_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [licData, instData] = await Promise.all([
        base44.entities.LicenseRecord.list(),
        base44.entities.Institution.list()
      ]);
      setLicenses(licData);
      setInstitutions(instData);
    } catch (error) {
      console.error('Error loading licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingLicense) {
        await base44.entities.LicenseRecord.update(editingLicense.id, formData);
      } else {
        await base44.entities.LicenseRecord.create(formData);
      }
      
      setDialogOpen(false);
      setEditingLicense(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      institution_id: '',
      product: 'both',
      plan_type: 'full_platform',
      max_seats: 50,
      seats_used: 0,
      valid_from: '',
      valid_until: '',
      monthly_rate: 0,
      annual_rate: 0,
      auto_renew: false,
      status: 'active',
      license_key: '',
      contract_url: ''
    });
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    setFormData({
      institution_id: license.institution_id,
      product: license.product,
      plan_type: license.plan_type,
      max_seats: license.max_seats,
      seats_used: license.seats_used,
      valid_from: license.valid_from,
      valid_until: license.valid_until,
      monthly_rate: license.monthly_rate || 0,
      annual_rate: license.annual_rate || 0,
      auto_renew: license.auto_renew,
      status: license.status,
      license_key: license.license_key || '',
      contract_url: license.contract_url || ''
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const getInstitutionName = (institutionId) => {
    const inst = institutions.find(i => i.id === institutionId);
    return inst?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">License Manager</h1>
          <p className="text-gray-400 mt-1">NEXUS Super Admin - Manage all licenses</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingLicense(null); resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create License
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLicense ? 'Edit License' : 'Create New License'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Institution*</Label>
                  <Select value={formData.institution_id} onValueChange={(value) => setFormData({ ...formData, institution_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product*</Label>
                  <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meridian">Meridian</SelectItem>
                      <SelectItem value="lumora">Lumora</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="compliance_only">Compliance Only</SelectItem>
                      <SelectItem value="content_only">Content Only</SelectItem>
                      <SelectItem value="full_platform">Full Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Seats*</Label>
                  <Input
                    type="number"
                    value={formData.max_seats}
                    onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valid From*</Label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valid Until*</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Monthly Rate</Label>
                  <Input
                    type="number"
                    value={formData.monthly_rate}
                    onChange={(e) => setFormData({ ...formData, monthly_rate: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Annual Rate</Label>
                  <Input
                    type="number"
                    value={formData.annual_rate}
                    onChange={(e) => setFormData({ ...formData, annual_rate: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>License Key</Label>
                  <Input
                    value={formData.license_key}
                    onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Contract URL</Label>
                  <Input
                    value={formData.contract_url}
                    onChange={(e) => setFormData({ ...formData, contract_url: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingLicense ? 'Update License' : 'Create License'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium">{getInstitutionName(license.institution_id)}</TableCell>
                  <TableCell>
                    <Badge className={
                      license.product === 'meridian' ? 'bg-[#1E40AF]' :
                      license.product === 'lumora' ? 'bg-[#B45309]' : 'bg-purple-600'
                    }>
                      {license.product}
                    </Badge>
                  </TableCell>
                  <TableCell>{license.plan_type?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{license.seats_used} / {license.max_seats}</TableCell>
                  <TableCell>{format(new Date(license.valid_until), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge className={
                      license.status === 'active' ? 'bg-green-500' :
                      license.status === 'expiring_soon' ? 'bg-amber-500' : 'bg-red-500'
                    }>
                      {license.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(license)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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