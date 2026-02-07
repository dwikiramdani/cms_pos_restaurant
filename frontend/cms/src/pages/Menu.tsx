import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../api/client';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  isAvailable: boolean;
  isPopular: boolean;
  categoryId?: string;
}

export default function Menu() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    isPopular: false,
  });

  const queryClient = useQueryClient();

  const { data: menuItems } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => api.get('/menu/items').then((res) => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/menu/categories').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/menu/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item created');
      closeModal();
    },
    onError: () => toast.error('Failed to create menu item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      api.patch(`/menu/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update menu item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/menu/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item deleted');
    },
    onError: () => toast.error('Failed to delete menu item'),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/menu/items/${id}/toggle-availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        basePrice: item.basePrice.toString(),
        isPopular: item.isPopular,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', basePrice: '', isPopular: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      categoryId: categories?.[0]?.id,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const groupedItems = menuItems?.reduce((acc: Record<string, any[]>, item: MenuItem) => {
    const categoryId = item.categoryId || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Menu Management</h1>
          <p className="text-gray-500">Manage your restaurant menu items</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <PlusIcon className="w-5 h-5" />
          Add Menu Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menuItems?.map((item: MenuItem) => (
          <div
            key={item.id}
            className={`card hover:shadow-lg transition-shadow ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            <div className="aspect-video bg-japanese-gray rounded-lg mb-4 flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-japanese-charcoal">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              </div>
              {item.isPopular && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-japanese-red">
                Rp {item.basePrice?.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAvailabilityMutation.mutate(item.id)}
                  className={`px-2 py-1 rounded text-xs ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <button
                  onClick={() => openModal(item)}
                  className="p-1 text-gray-500 hover:text-japanese-red"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-japanese-gray rounded">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div>
                <label className="label">Price (Rp)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="input"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPopular" className="text-sm">
                  Mark as Popular
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 btn-outline justify-center">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-primary justify-center"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingItem
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
