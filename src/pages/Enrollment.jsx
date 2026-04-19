import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, UserMinus, Upload, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function Enrollment() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [seats, setSeats] = useState([]);
  const [newSeat, setNewSeat] = useState({ product: '', user_identifier: '', role_in_product: 'student' });
  const [allocating, setAllocating] = useState(false);

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
          const [lics, seatData] = await Promise.all([
            base44.entities.LicenseRecord.filter({ institution_id: instUser.institution_id }),
            base44.entities.SeatAllocation.filter({ institution_id: instUser.institution_id })
          ]);

          setLicenses(lics);
          setSeats(seatData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateSeat = async () => {
    if (!newSeat.product || !newSeat.user_identifier) return;

    setAllocating(true);
    try {
      await base44.entities.SeatAllocation.create({
        institution_id: institutionUser.institution_id,
        product: newSeat.product,
        user_identifier: newSeat.user_identifier,
        role_in_product: newSeat.role_in_product,
        allocated_at: new Date().toISOString(),
        allocated_by: institutionUser.id,
        is_active: true
      });

      await base44.entities.AuditLog.create({
        institution_id: institutionUser.institution_id,
        user_id: institutionUser.id,
        action: 'seat_allocated',
        target: newSeat.user_identifier,
        performed_at: new Date().toISOString(),
        details: JSON.stringify({ product: newSeat.product, role: newSeat.role_in_product })
      });

      setNewSeat({ product: '', user_identifier: '', role_in_product: 'student' });
      loadData();
    } catch (error) {
      console.error('Error allocating seat:', error);
    } finally {
      setAllocating(false);
    }
  };

  const handleDeallocateSeat = async (seatId) => {
    try {
      const seat = seats.find(s => s.id === seatId);
      await base44.entities.SeatAllocation.update(seatId, { is_active: false });

      await base44.entities.AuditLog.create({
        institution_id: institutionUser.institution_id,
        user_id: institutionUser.id,
        action: 'seat_deallocated',
        target: seat.user_identifier,
        performed_at: new Date().toISOString()
      });

      loadData();
    } catch (error) {
      console.error('Error deallocating seat:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const isAdmin = institutionUser?.role === 'admin';
  const activeSeats = seats.filter(s => s.active);
  
  const getSeatStats = (product) => {
    const license = licenses.find(l => l.product === product || l.product === 'both');
    const used = activeSeats.filter(s => s.product === product).length;
    const max = license?.max_seats || 0;
    return { used, max, available: max - used, percentage: max > 0 ? (used / max) * 100 : 0 };
  };

  const meridianStats = getSeatStats('meridian');
  const lumoraStats = getSeatStats('lumora');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Enrollment & Seats</h1>
        <p className="text-gray-400 mt-1">Manage seat allocations for your licensed products</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Seat Overview</TabsTrigger>
          <TabsTrigger value="manage" disabled={!isAdmin}>Seat Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {licenses.some(l => l.product === 'meridian' || l.product === 'both') && (
            <Card className="bg-white">
              <CardHeader className="border-b bg-[#1E40AF]/10">
                <CardTitle className="text-[#1E40AF]">Meridian</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">{meridianStats.used} / {meridianStats.max}</p>
                    <p className="text-sm text-gray-500">Seats Used</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{meridianStats.available}</p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>
                
                {meridianStats.percentage >= 80 && (
                  <Alert className="mb-4 bg-amber-50 border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Approaching seat limit ({meridianStats.percentage.toFixed(0)}% utilized)
                    </AlertDescription>
                  </Alert>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Identifier</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Allocated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSeats.filter(s => s.product === 'meridian').map((seat) => (
                      <TableRow key={seat.id}>
                        <TableCell className="font-medium">{seat.user_identifier}</TableCell>
                        <TableCell>{seat.role_in_product}</TableCell>
                        <TableCell>{format(new Date(seat.allocated_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {licenses.some(l => l.product === 'lumora' || l.product === 'both') && (
            <Card className="bg-white">
              <CardHeader className="border-b bg-[#B45309]/10">
                <CardTitle className="text-[#B45309]">Lumora</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">{lumoraStats.used} / {lumoraStats.max}</p>
                    <p className="text-sm text-gray-500">Seats Used</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{lumoraStats.available}</p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>

                {lumoraStats.percentage >= 80 && (
                  <Alert className="mb-4 bg-amber-50 border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Approaching seat limit ({lumoraStats.percentage.toFixed(0)}% utilized)
                    </AlertDescription>
                  </Alert>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Identifier</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Allocated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSeats.filter(s => s.product === 'lumora').map((seat) => (
                      <TableRow key={seat.id}>
                        <TableCell className="font-medium">{seat.user_identifier}</TableCell>
                        <TableCell>{seat.role_in_product}</TableCell>
                        <TableCell>{format(new Date(seat.allocated_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Allocate New Seat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={newSeat.product} onValueChange={(value) => setNewSeat({ ...newSeat, product: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenses.some(l => l.product === 'meridian' || l.product === 'both') && (
                        <SelectItem value="meridian">Meridian</SelectItem>
                      )}
                      {licenses.some(l => l.product === 'lumora' || l.product === 'both') && (
                        <SelectItem value="lumora">Lumora</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>User Identifier (Email or ID)</Label>
                  <Input
                    value={newSeat.user_identifier}
                    onChange={(e) => setNewSeat({ ...newSeat, user_identifier: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newSeat.role_in_product} onValueChange={(value) => setNewSeat({ ...newSeat, role_in_product: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAllocateSeat} disabled={allocating}>
                <Plus className="w-4 h-4 mr-2" />
                Allocate Seat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Manage Existing Seats</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>User Identifier</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSeats.map((seat) => (
                    <TableRow key={seat.id}>
                      <TableCell>
                        <Badge className={seat.product === 'meridian' ? 'bg-[#1E40AF]' : 'bg-[#B45309]'}>
                          {seat.product}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{seat.user_identifier}</TableCell>
                      <TableCell>{seat.role_in_product}</TableCell>
                      <TableCell>{format(new Date(seat.allocated_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeallocateSeat(seat.id)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Deallocate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}