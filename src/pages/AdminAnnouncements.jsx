import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BellRing, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAnnouncements() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target_institution_ids: [],
    is_pinned: false,
    expires_at: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const [announcementData, instData] = await Promise.all([
        base44.entities.Announcement.list(),
        base44.entities.Institution.list()
      ]);
      setAnnouncements(announcementData);
      setInstitutions(instData);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const instUsers = await base44.entities.InstitutionUser.filter({ email: currentUser.email });
      const createdBy = instUsers[0]?.id || currentUser.id;

      await base44.entities.Announcement.create({
        ...formData,
        published_at: new Date().toISOString(),
        created_by: createdBy
      });
      
      setDialogOpen(false);
      setFormData({
        title: '',
        body: '',
        target_institution_ids: [],
        is_pinned: false,
        expires_at: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Announcement Manager</h1>
          <p className="text-gray-400 mt-1">NEXUS Super Admin - Create announcements for clients</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title*</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Message*</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Institutions (leave empty for all)</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {institutions.map((inst) => (
                    <div key={inst.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`inst-${inst.id}`}
                        checked={formData.target_institution_ids.includes(inst.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, target_institution_ids: [...formData.target_institution_ids, inst.id] });
                          } else {
                            setFormData({ ...formData, target_institution_ids: formData.target_institution_ids.filter(id => id !== inst.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`inst-${inst.id}`} className="cursor-pointer">{inst.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                  id="pinned"
                />
                <Label htmlFor="pinned">Pin to top of dashboard</Label>
              </div>

              <Button onClick={handleSave} className="w-full">
                Publish Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{announcement.body.substring(0, 80)}...</p>
                      {announcement.is_pinned && (
                        <Badge className="mt-1 bg-amber-500">Pinned</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!announcement.target_institution_ids || announcement.target_institution_ids.length === 0 ? (
                      <Badge variant="outline">All Institutions</Badge>
                    ) : (
                      <Badge variant="outline">{announcement.target_institution_ids.length} Selected</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(announcement.published_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {announcement.expires_at ? format(new Date(announcement.expires_at), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      !announcement.expires_at || new Date(announcement.expires_at) > new Date() ? 'bg-green-500' : 'bg-gray-500'
                    }>
                      {!announcement.expires_at || new Date(announcement.expires_at) > new Date() ? 'Active' : 'Expired'}
                    </Badge>
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