import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileBarChart } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAuditLog() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logData, instData] = await Promise.all([
        base44.entities.AuditLog.list(),
        base44.entities.Institution.list()
      ]);
      setLogs(logData);
      setInstitutions(instData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const getInstitutionName = (institutionId) => {
    const inst = institutions.find(i => i.id === institutionId);
    return inst?.name || 'Unknown';
  };

  const filteredLogs = logs.filter(log => {
    const matchesInstitution = filterInstitution === 'all' || log.institution_id === filterInstitution;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesInstitution && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Portal Audit Log</h1>
        <p className="text-gray-400 mt-1">NEXUS Super Admin - View all activity across institutions</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Activity</CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Search action or target..."
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
                <TableHead>Institution</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {getInstitutionName(log.institution_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.target || '—'}</TableCell>
                  <TableCell className="text-sm">{log.user_id}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(log.performed_at || log.created_date), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {log.details ? JSON.parse(log.details).role || '—' : '—'}
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