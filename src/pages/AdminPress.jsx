import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPress() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: pressItems = [] } = useQuery({
    queryKey: ['admin-press'],
    queryFn: () => base44.entities.PressItem.list('-published_at')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PressItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-press']);
      queryClient.invalidateQueries(['press-items']);
      setIsOpen(false);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PressItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-press']);
      queryClient.invalidateQueries(['press-items']);
      setIsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PressItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-press']);
      queryClient.invalidateQueries(['press-items']);
    }
  });

  const handleNew = () => {
    setEditingItem({
      headline: '',
      publication: '',
      published_at: new Date().toISOString().split('T')[0],
      url: '',
      is_featured: false
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (editingItem.id) {
      updateMutation.mutate({ id: editingItem.id, data: editingItem });
    } else {
      createMutation.mutate(editingItem);
    }
  };

  return (
    <AdminLayout activePage="AdminPress">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Press Manager</h1>
          <Button onClick={handleNew} className="bg-white text-gray-900 hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            Add Press Item
          </Button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-white font-medium">Date</th>
                <th className="text-left p-4 text-white font-medium">Headline</th>
                <th className="text-left p-4 text-white font-medium">Publication</th>
                <th className="text-left p-4 text-white font-medium">Featured</th>
                <th className="text-left p-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pressItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-gray-300">
                    {item.published_at && format(new Date(item.published_at), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 text-white">{item.headline}</td>
                  <td className="p-4 text-gray-300">{item.publication}</td>
                  <td className="p-4">
                    {item.is_featured && (
                      <div className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                        Featured
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingItem(item);
                          setIsOpen(true);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-[#0a0f1a] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingItem?.id ? 'Edit Press Item' : 'New Press Item'}
              </DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Headline</Label>
                  <Input
                    value={editingItem.headline}
                    onChange={(e) => setEditingItem({ ...editingItem, headline: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Publication</Label>
                  <Input
                    value={editingItem.publication}
                    onChange={(e) => setEditingItem({ ...editingItem, publication: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Publication Date</Label>
                  <Input
                    type="date"
                    value={editingItem.published_at}
                    onChange={(e) => setEditingItem({ ...editingItem, published_at: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">URL</Label>
                  <Input
                    value={editingItem.url}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={editingItem.is_featured}
                    onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_featured: checked })}
                  />
                  <Label className="text-white">Featured</Label>
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