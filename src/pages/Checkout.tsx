import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useStore();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsOrdered(true);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 3000);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center"
        >
          <CheckCircle size={48} className="text-obsidian" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-serif italic text-white">Acquisition Confirmed</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            Your selections have been documented in the archive. A preservation specialist will contact you shortly regarding delivery protocols.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Bag
          </button>

          <section className="space-y-8">
            <h2 className="text-3xl font-serif italic border-b border-white/10 pb-6">Finalize Acquisition</h2>
            
            <form onSubmit={handlePlaceOrder} className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Shipping Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Email</label>
                    <p className="text-lg font-medium border-b border-white/10 py-2">{user?.email || 'Guest'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Full Name</label>
                    <input required defaultValue={profile?.full_name} className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/50 transition-colors" placeholder="PATRON NAME" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Street Address</label>
                    <input required defaultValue={profile?.saved_address} className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/50 transition-colors" placeholder="ARCHIVAL DESTINATION" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Payment Protocol</h3>
                <div className="p-6 border border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CreditCard size={20} className="text-white/40" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Secure Gateway</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Encrypted Transaction Active</p>
                    </div>
                  </div>
                  <ShieldCheck size={20} className="text-white/20" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-white text-obsidian py-6 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : `Authorize Payment — $${cartTotal.toLocaleString()}`}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-white/5 border border-white/10 p-10 space-y-10">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 border-b border-white/5 pb-4">Acquisition Summary</h3>
            
            <div className="space-y-6 max-h-96 overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-white/5 shrink-0">
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.product.name}</h4>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold">${(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                <span>Preservation Fee</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-white/10 mt-6">
                <span className="text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-bold">${cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
