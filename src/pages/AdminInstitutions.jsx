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
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminInstitutions() {
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    primary_contact_name: '',
    primary_contact_email: '',
    phone: '',
    address: '',
    institution_type: 'nonprofit',
    nexus_account_manager: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.Institution.list();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingInstitution) {
        await base44.entities.Institution.update(editingInstitution.id, formData);
      } else {
        await base44.entities.Institution.create(formData);
      }
      
      setDialogOpen(false);
      setEditingInstitution(null);
      setFormData({
        name: '',
        logo_url: '',
        primary_contact_name: '',
        primary_contact_email: '',
        phone: '',
        address: '',
        institution_type: 'nonprofit',
        nexus_account_manager: '',
        is_active: true,
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving institution:', error);
    }
  };

  const handleEdit = (institution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      logo_url: institution.logo_url || '',
      primary_contact_name: institution.primary_contact_name || '',
      primary_contact_email: institution.primary_contact_email,
      phone: institution.phone || '',
      address: institution.address || '',
      institution_type: institution.institution_type,
      nexus_account_manager: institution.nexus_account_manager || '',
      is_active: institution.is_active,
      notes: institution.notes || ''
    });
    setDialogOpen(true);
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Institution Manager</h1>
          <p className="text-gray-400 mt-1">NEXUS Super Admin - Manage all institutions</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingInstitution(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution Name*</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.institution_type} onValueChange={(value) => setFormData({ ...formData, institution_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      <SelectItem value="community_college">Community College</SelectItem>
                      <SelectItem value="workforce_program">Workforce Program</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Name</Label>
                  <Input
                    value={formData.primary_contact_name}
                    onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Email*</Label>
                  <Input
                    type="email"
                    value={formData.primary_contact_email}
                    onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>NEXUS Account Manager</Label>
                  <Input
                    value={formData.nexus_account_manager}
                    onChange={(e) => setFormData({ ...formData, nexus_account_manager: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingInstitution ? 'Update Institution' : 'Create Institution'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Institutions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell className="font-medium">{institution.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {institution.institution_type?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{institution.primary_contact_name}</p>
                      <p className="text-gray-500">{institution.primary_contact_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{institution.nexus_account_manager || '—'}</TableCell>
                  <TableCell>{format(new Date(institution.created_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge className={institution.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                      {institution.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(institution)}
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