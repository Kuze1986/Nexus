import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Send, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'normal'
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
          const ticketData = await base44.entities.SupportTicket.filter({ 
            institution_id: instUser.institution_id 
          });
          setTickets(ticketData);
        }
      }
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.description) return;

    try {
      await base44.entities.SupportTicket.create({
        institution_id: institutionUser.institution_id,
        submitted_by: institutionUser.id,
        submitted_at: new Date().toISOString(),
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open'
      });

      setNewTicket({ subject: '', description: '', category: 'other', priority: 'normal' });
      loadData();
      alert('Support ticket submitted successfully!');
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const knowledgeBase = [
    { title: 'Getting Started', description: 'Learn the basics of the Nexus Client Portal' },
    { title: 'Managing Seats', description: 'How to allocate and manage learner seats' },
    { title: 'Generating Reports', description: 'Guide to creating custom and grant-ready reports' },
    { title: 'Understanding Compliance', description: 'Compliance tracking and requirements' },
    { title: 'License Renewal', description: 'How to renew or upgrade your license' },
    { title: 'Team Administration', description: 'Managing users and permissions' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support</h1>
        <p className="text-gray-400 mt-1">Get help and submit support tickets</p>
      </div>

      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Ticket</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                />
              </div>

              <Button onClick={handleSubmitTicket}>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No support tickets yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            {ticket.nexus_response && (
                              <p className="text-sm text-gray-500 mt-1">
                                Response: {ticket.nexus_response.substring(0, 60)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ticket.category}
                          </Badge>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Knowledge Base */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeBase.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-xs text-gray-400 mt-2">Coming soon</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}