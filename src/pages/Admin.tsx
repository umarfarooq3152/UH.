import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Upload, X, Save, Loader, Database, ArrowLeft } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Product } from '../types';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, seedDatabase } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, productId: string | null }>({
    isOpen: false,
    productId: null
  });
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    description: '',
    image_url: '',
    tags: []
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `paintings/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, image_url: url }));
      addToast("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading image: ", error);
      addToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image_url) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setProcessing(true);
    try {
      if (isEditing) {
        await updateProduct(isEditing, formData);
        setIsEditing(null);
        addToast("Product updated successfully", "success");
      } else {
        await addProduct(formData as Omit<Product, 'id'>);
        setIsAdding(false);
        addToast("Product added successfully", "success");
      }
      // Reset form
      setFormData({
        name: '',
        category: '',
        price: 0,
        description: '',
        image_url: '',
        tags: []
      });
    } catch (error) {
      console.error("Error saving product: ", error);
      addToast("Failed to save product", "error");
    } finally {
      setProcessing(false);
    }
  };

  const startEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id as string);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.productId) {
      setProcessing(true);
      try {
        await deleteProduct(deleteConfirmation.productId);
        addToast("Product deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting product: ", error);
        addToast("Failed to delete product", "error");
      } finally {
        setProcessing(false);
        setDeleteConfirmation({ isOpen: false, productId: null });
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (window.confirm("This will add all default products to the database. Continue?")) {
      setProcessing(true);
      try {
        await seedDatabase();
        addToast("Database initialized successfully", "success");
      } catch (error) {
        console.error("Error seeding database: ", error);
        addToast("Failed to initialize database", "error");
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Back to Site
          </button>
        </div>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif italic text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/40 text-sm">Manage your collection and archive.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSeedDatabase}
              disabled={processing}
              className="flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {processing ? <Loader className="animate-spin" size={16} /> : <Database size={16} />}
              Initialize DB
            </button>
            <button 
              onClick={() => {
                setIsAdding(!isAdding);
                setIsEditing(null);
                setFormData({
                  name: '',
                  category: '',
                  price: 0,
                  description: '',
                  image_url: '',
                  tags: []
                });
              }}
              className="flex items-center gap-2 bg-white text-obsidian px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors"
            >
              {isAdding ? <X size={16} /> : <Plus size={16} />}
              {isAdding ? 'Cancel' : 'Add New Work'}
            </button>
          </div>
        </div>

        {processing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-obsidian border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
              <p className="text-white font-medium">Processing...</p>
            </div>
          </div>
        )}

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12"
          >
            <h2 className="text-xl text-white mb-6">{isEditing ? 'Edit Work' : 'New Work Details'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Title</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g. Echoes of Silence"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g. Thuluth"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Price ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.tags?.join(', ')}
                    onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                    placeholder="modern, ink, abstract"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 h-32"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Artwork Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm text-white">
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex items-center gap-2 bg-white text-obsidian px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Work
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
              <div className="aspect-[4/5] relative">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => startEdit(product)}
                    className="p-3 bg-white text-obsidian rounded-full hover:scale-110 transition-transform"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id as string)}
                    className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white">{product.name}</h3>
                <p className="text-white/40 text-sm">{product.category}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-white font-bold">${product.price}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">ID: {product.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-obsidian border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif italic text-white mb-4">Confirm Deletion</h3>
              <p className="text-white/60 mb-8">
                Are you sure you want to permanently delete this artwork? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setDeleteConfirmation({ isOpen: false, productId: null })}
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
