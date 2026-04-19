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
import { UserPlus, Mail, Edit, UserX } from 'lucide-react';
import { format } from 'date-fns';

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', full_name: '', role: 'viewer' });

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
          const members = await base44.entities.InstitutionUser.filter({ 
            institution_id: instUser.institution_id 
          });
          setTeamMembers(members);
        }
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!newUser.email || !newUser.full_name) return;

    try {
      await base44.entities.InstitutionUser.create({
        institution_id: institutionUser.institution_id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        invited_at: new Date().toISOString(),
        invited_by: institutionUser.id,
        is_active: true
      });

      await base44.entities.AuditLog.create({
        institution_id: institutionUser.institution_id,
        user_id: institutionUser.id,
        action: 'user_invited',
        target: newUser.email,
        performed_at: new Date().toISOString(),
        details: JSON.stringify({ role: newUser.role })
      });

      setNewUser({ email: '', full_name: '', role: 'viewer' });
      setInviteOpen(false);
      loadData();
      alert('User invited successfully!');
    } catch (error) {
      console.error('Error inviting user:', error);
    }
  };

  const handleResendInvitation = async (member) => {
    await base44.entities.AuditLog.create({
      institution_id: institutionUser.institution_id,
      user_id: institutionUser.id,
      action: 'invitation_resent',
      target: member.email,
      performed_at: new Date().toISOString()
    });

    alert('Invitation resent!');
  };

  const handleDeactivateUser = async (member) => {
    try {
      await base44.entities.InstitutionUser.update(member.id, { is_active: false });

      await base44.entities.AuditLog.create({
        institution_id: institutionUser.institution_id,
        user_id: institutionUser.id,
        action: 'user_deactivated',
        target: member.email,
        performed_at: new Date().toISOString()
      });

      loadData();
      alert('User deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleUpdateRole = async (member, newRole) => {
    try {
      await base44.entities.InstitutionUser.update(member.id, { role: newRole });

      await base44.entities.AuditLog.create({
        institution_id: institutionUser.institution_id,
        user_id: institutionUser.id,
        action: 'user_role_updated',
        target: member.email,
        performed_at: new Date().toISOString(),
        details: JSON.stringify({ old_role: member.role, new_role: newRole })
      });

      loadData();
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const isAdmin = institutionUser?.role === 'admin';
  if (!isAdmin) {
    return (
      <div className="text-white">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">Only institution administrators can manage team members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-gray-400 mt-1">Manage users for your institution</p>
        </div>
        
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                    <SelectItem value="admin">Admin (Full access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleInviteUser} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => handleUpdateRole(member, newRole)}
                      disabled={member.id === institutionUser.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {member.last_login_at ? (
                      format(new Date(member.last_login_at), 'MMM d, yyyy')
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.is_active ? (
                      member.accepted_at ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge className="bg-amber-500">Pending</Badge>
                      )
                    ) : (
                      <Badge className="bg-gray-500">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!member.accepted_at && member.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(member)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Resend
                        </Button>
                      )}
                      {member.is_active && member.id !== institutionUser.id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeactivateUser(member)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                      )}
                    </div>
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