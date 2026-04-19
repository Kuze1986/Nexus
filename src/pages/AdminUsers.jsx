import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, instData] = await Promise.all([
        base44.entities.InstitutionUser.list(),
        base44.entities.Institution.list()
      ]);
      setUsers(userData);
      setInstitutions(instData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const getInstitutionName = (institutionId) => {
    if (!institutionId) return 'NEXUS (Internal)';
    const inst = institutions.find(i => i.id === institutionId);
    return inst?.name || 'Unknown';
  };

  const filteredUsers = users.filter(user => {
    const matchesInstitution = filterInstitution === 'all' || user.institution_id === filterInstitution;
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesInstitution && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Manager</h1>
        <p className="text-gray-400 mt-1">NEXUS Super Admin - View all users across institutions</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getInstitutionName(user.institution_id)}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === 'nexus_super_admin' ? 'bg-purple-600' :
                      user.role === 'admin' ? 'bg-blue-600' : 'bg-gray-600'
                    }>
                      {user.role?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login_at ? (
                      format(new Date(user.last_login_at), 'MMM d, yyyy')
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      user.accepted_at ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge className="bg-amber-500">Pending</Badge>
                      )
                    ) : (
                      <Badge className="bg-gray-500">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(user.invited_at || user.created_date), 'MMM d, yyyy')}
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