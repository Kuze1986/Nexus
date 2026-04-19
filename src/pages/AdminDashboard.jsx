import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  demo_scheduled: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  converted: 'bg-green-500/20 text-green-300 border-green-500/30',
  declined: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [editingRequest, setEditingRequest] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const { data: requests = [] } = useQuery({
    queryKey: ['demo-requests'],
    queryFn: () => base44.entities.DemoRequest.list('-submitted_at')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DemoRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['demo-requests']);
      setEditingRequest(null);
    }
  });

  const handleEdit = (request) => {
    setEditingRequest(request.id);
    setNotes(request.nexus_notes || '');
    setStatus(request.status);
  };

  const handleSave = (id) => {
    updateMutation.mutate({
      id,
      data: { status, nexus_notes: notes }
    });
  };

  return (
    <AdminLayout activePage="AdminDashboard">
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold text-white mb-8">Demo Requests</h1>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-white font-medium">Date</th>
                  <th className="text-left p-4 text-white font-medium">Name</th>
                  <th className="text-left p-4 text-white font-medium">Organization</th>
                  <th className="text-left p-4 text-white font-medium">Products</th>
                  <th className="text-left p-4 text-white font-medium">Status</th>
                  <th className="text-left p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const isEditing = editingRequest === request.id;
                  return (
                    <tr key={request.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-gray-300">
                        {format(new Date(request.submitted_at), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{request.name}</div>
                        <div className="text-gray-400 text-sm">{request.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white">{request.organization}</div>
                        <div className="text-gray-400 text-sm">{request.role}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {request.product_interest?.map((product, idx) => (
                            <Badge key={idx} className="bg-white/10 text-white text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="declined">Declined</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${statusColors[request.status]} border`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRequest(null)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(request)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {editingRequest && (
          <div className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Internal Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
              placeholder="Add internal notes..."
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}