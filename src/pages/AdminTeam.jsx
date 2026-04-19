import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminTeam() {
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => base44.entities.TeamMember.list('order_index')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-team']);
      queryClient.invalidateQueries(['team-members']);
      setIsOpen(false);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-team']);
      queryClient.invalidateQueries(['team-members']);
      setIsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-team']);
      queryClient.invalidateQueries(['team-members']);
    }
  });

  const handleNew = () => {
    setEditingMember({
      name: '',
      title: '',
      bio: '',
      avatar_url: '',
      order_index: teamMembers.length,
      is_visible: true
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (editingMember.id) {
      updateMutation.mutate({ id: editingMember.id, data: editingMember });
    } else {
      createMutation.mutate(editingMember);
    }
  };

  return (
    <AdminLayout activePage="AdminTeam">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Team Manager</h1>
          <Button onClick={handleNew} className="bg-white text-gray-900 hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="flex items-start gap-4">
                {member.avatar_url && (
                  <img 
                    src={member.avatar_url} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                      <p className="text-gray-400">{member.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMember(member);
                          setIsOpen(true);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(member.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="text-gray-300 text-sm mb-2">{member.bio}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Order: {member.order_index}</span>
                    {!member.is_visible && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-[#0a0f1a] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingMember?.id ? 'Edit Team Member' : 'New Team Member'}
              </DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Title</Label>
                  <Input
                    value={editingMember.title}
                    onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Bio</Label>
                  <Textarea
                    value={editingMember.bio}
                    onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-white">Avatar URL</Label>
                  <Input
                    value={editingMember.avatar_url}
                    onChange={(e) => setEditingMember({ ...editingMember, avatar_url: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label className="text-white">Order Index</Label>
                  <Input
                    type="number"
                    value={editingMember.order_index}
                    onChange={(e) => setEditingMember({ ...editingMember, order_index: parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={editingMember.is_visible}
                    onCheckedChange={(checked) => setEditingMember({ ...editingMember, is_visible: checked })}
                  />
                  <Label className="text-white">Visible on Site</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="bg-white text-gray-900 hover:bg-gray-100">
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}