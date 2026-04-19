import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminFAQ() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: faqItems = [] } = useQuery({
    queryKey: ['admin-faq'],
    queryFn: () => base44.entities.FAQItem.list('order_index')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FAQItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-faq']);
      queryClient.invalidateQueries(['faq-items']);
      setIsOpen(false);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FAQItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-faq']);
      queryClient.invalidateQueries(['faq-items']);
      setIsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FAQItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-faq']);
      queryClient.invalidateQueries(['faq-items']);
    }
  });

  const handleNew = () => {
    setEditingItem({
      question: '',
      answer: '',
      category: 'product',
      order_index: faqItems.length
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
    <AdminLayout activePage="AdminFAQ">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">FAQ Manager</h1>
          <Button onClick={handleNew} className="bg-white text-gray-900 hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="inline-block px-2 py-1 bg-white/10 text-white text-xs rounded">
                      {item.category}
                    </div>
                    <span className="text-gray-400 text-sm">Order: {item.order_index}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
                  <p className="text-gray-300">{item.answer}</p>
                </div>
                <div className="flex gap-2 ml-4">
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
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-[#0a0f1a] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingItem?.id ? 'Edit FAQ' : 'New FAQ'}
              </DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Question</Label>
                  <Input
                    value={editingItem.question}
                    onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Answer</Label>
                  <Textarea
                    value={editingItem.answer}
                    onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                    className="bg-white/10 border-white/20 text-white min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Category</Label>
                    <Select
                      value={editingItem.category}
                      onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="bioloop">BioLoop</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Order Index</Label>
                    <Input
                      type="number"
                      value={editingItem.order_index}
                      onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
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