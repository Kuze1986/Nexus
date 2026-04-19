import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSupport() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketData, instData] = await Promise.all([
        base44.entities.SupportTicket.list(),
        base44.entities.Institution.list()
      ]);
      setTickets(ticketData);
      setInstitutions(instData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    try {
      await base44.entities.SupportTicket.update(selectedTicket.id, {
        nexus_response: response,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      });
      
      setSelectedTicket(null);
      setResponse('');
      loadData();
    } catch (error) {
      console.error('Error responding to ticket:', error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await base44.entities.SupportTicket.update(ticketId, {
        status: newStatus,
        ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() })
      });
      loadData();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const getInstitutionName = (institutionId) => {
    const inst = institutions.find(i => i.id === institutionId);
    return inst?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Queue</h1>
        <p className="text-gray-400 mt-1">NEXUS Super Admin - Manage all support tickets</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    {getInstitutionName(ticket.institution_id)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-left hover:underline"
                    >
                      {ticket.subject}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      ticket.priority === 'high' ? 'bg-red-500' :
                      ticket.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      ticket.status === 'resolved' ? 'bg-green-500' :
                      ticket.status === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500'
                    }>
                      {ticket.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(ticket.submitted_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {ticket.status !== 'resolved' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Respond
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

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Institution</p>
                <p className="font-semibold">{getInstitutionName(selectedTicket.institution_id)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-semibold">{selectedTicket.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>

              {selectedTicket.nexus_response && (
                <div>
                  <p className="text-sm text-gray-500">Previous Response</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">{selectedTicket.nexus_response}</p>
                  </div>
                </div>
              )}

              {selectedTicket.status !== 'resolved' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Response</label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter your response to the client..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleRespond} className="w-full">
                    Send Response & Mark Resolved
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}