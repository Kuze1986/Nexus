import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Plus } from 'lucide-react';

export default function AdminPortfolio() {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.PortfolioProduct.list('order_index')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioProduct.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['portfolio-products']);
      setIsOpen(false);
      setEditingProduct(null);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioProduct.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['portfolio-products']);
      setIsOpen(false);
      setEditingProduct(null);
    }
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const handleNew = () => {
    setEditingProduct({
      name: '',
      tagline: '',
      domain_color: '#64748B',
      description: '',
      bioloop_role: '',
      stage: 'development',
      order_index: products.length,
      is_featured: false,
      hero_image_url: '',
      demo_url: ''
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (editingProduct.id) {
      updateMutation.mutate({ id: editingProduct.id, data: editingProduct });
    } else {
      createMutation.mutate(editingProduct);
    }
  };

  return (
    <AdminLayout activePage="AdminPortfolio">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Portfolio Manager</h1>
          <Button onClick={handleNew} className="bg-white text-gray-900 hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border-2 border-white/10 hover:border-white/20 transition-all"
              style={{ borderLeftColor: product.domain_color }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm">{product.stage}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(product)}
                  className="text-gray-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-300 text-sm mb-4">{product.tagline}</p>
              {product.is_featured && (
                <div className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-[#0a0f1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingProduct?.id ? 'Edit Product' : 'New Product'}
              </DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Product Name</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Tagline</Label>
                  <Input
                    value={editingProduct.tagline}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Domain Color</Label>
                  <Input
                    type="color"
                    value={editingProduct.domain_color}
                    onChange={(e) => setEditingProduct({ ...editingProduct, domain_color: e.target.value })}
                    className="bg-white/10 border-white/20 h-12"
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-white">BioLoop Role</Label>
                  <Textarea
                    value={editingProduct.bioloop_role}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bioloop_role: e.target.value })}
                    className="bg-white/10 border-white/20 text-white min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Stage</Label>
                    <Select
                      value={editingProduct.stage}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, stage: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="concept">Concept</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Order Index</Label>
                    <Input
                      type="number"
                      value={editingProduct.order_index}
                      onChange={(e) => setEditingProduct({ ...editingProduct, order_index: parseInt(e.target.value) })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={editingProduct.is_featured}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_featured: checked })}
                  />
                  <Label className="text-white">Featured Product</Label>
                </div>

                <div>
                  <Label className="text-white">Demo URL (optional)</Label>
                  <Input
                    value={editingProduct.demo_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, demo_url: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="bg-white text-gray-900 hover:bg-gray-100">
                    Save Changes
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