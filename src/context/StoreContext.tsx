import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, CartItem } from '../types';
import { ALL_PRODUCTS } from '../data/products';

interface StoreContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  // Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredProducts: Product[];
  // Product Management
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string | number) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  seedDatabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // If no products in DB yet, use ALL_PRODUCTS as seed
      if (fetchedProducts.length === 0) {
        setProducts(ALL_PRODUCTS);
      } else {
        setProducts(fetchedProducts);
      }
    }, (error) => {
      console.warn('Firestore snapshot error (using local products fallback):', error.message);
      setProducts(ALL_PRODUCTS);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.warn('Firestore add failed, updating locally:', error);
      const newProduct = { ...product, id: `local-${Date.now()}` } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const deleteProduct = async (productId: string | number) => {
    try {
      await deleteDoc(doc(db, 'products', String(productId)));
    } catch (error) {
      console.warn('Firestore delete failed, updating locally:', error);
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
    } catch (error) {
      console.warn('Firestore update failed, updating locally:', error);
      setProducts(prev => prev.map(p => String(p.id) === String(productId) ? { ...p, ...updates } : p));
    }
  };

  const seedDatabase = async () => {
    try {
      const batch = writeBatch(db);
      ALL_PRODUCTS.forEach(product => {
        const newDocRef = doc(collection(db, 'products'));
        const { id, ...data } = product;
        batch.set(newDocRef, data);
      });
      await batch.commit();
    } catch (error) {
      console.warn('Firestore seed failed:', error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(art => {
      const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    const savedCart = localStorage.getItem('modernist_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('modernist_cart', JSON.stringify(cart));
  }, [cart]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartTotal = cartSubtotal; // Simplified for now

  return (
    <StoreContext.Provider value={{
      cart,
      isCartOpen,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartSubtotal,
      cartTotal,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      filteredProducts,
      products,
      addProduct,
      deleteProduct,
      updateProduct,
      seedDatabase
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
