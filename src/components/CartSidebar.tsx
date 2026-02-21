import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm"
        onClick={toggleCart}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-obsidian border-l border-white/10 h-full flex flex-col shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShoppingBag size={20} className="text-white/40" />
            <h2 className="text-xl font-serif italic text-white">Your Selections</h2>
          </div>
          <button onClick={toggleCart} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-xs uppercase tracking-widest">The bag is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-6 group">
                <div className="w-24 aspect-[3/4] bg-white/5 overflow-hidden shrink-0">
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white">{item.product.name}</h3>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-white/20 hover:text-white transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.product.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-4 text-[10px] font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-white">${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-white/10 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Acquisition</span>
              <span className="text-2xl font-bold text-white">${cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => {
                toggleCart();
                navigate('/checkout');
              }}
              className="w-full bg-white text-obsidian py-5 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              Finalize Acquisition <ArrowRight size={14} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartSidebar;
