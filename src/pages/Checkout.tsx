import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, CheckCircle, Ghost, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { useToast } from '../context/ToastContext';

const EMAILJS_SERVICE_ID = 'service_xaf5ja8';
const ADMIN_RECIPIENT_EMAIL = 'umarfarooq3152@gmail.com';

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useStore();
  const { user, profile, isGuest, guestName, guestEmail, setGuestInfo, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState(
    isGuest ? guestName : (profile?.full_name || user?.displayName || '')
  );
  const [email, setEmail] = useState(
    isGuest ? guestEmail : (user?.email || '')
  );
  const [address, setAddress] = useState(profile?.saved_address || '');
  const [city, setCity] = useState(profile?.saved_city || '');

  const resolvedName = isGuest ? fullName : (profile?.full_name || user?.displayName || fullName);
  const resolvedEmail = isGuest ? email : (user?.email || email);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolvedEmail) {
      addToast('Please provide a contact email.', 'error');
      return;
    }
    if (cart.length === 0) {
      addToast('Your cart is empty.', 'error');
      return;
    }

    setIsProcessing(true);

    // Persist guest info so it survives navigation
    if (isGuest) {
      setGuestInfo(fullName, email);
    }

    const orderRows = cart
      .map((item) => `• ${item.quantity}× ${item.product.name}  —  $${(item.product.price * item.quantity).toLocaleString()}`)
      .join('\n');

    const messageBody = [
      `📦 NEW ORDER RECEIVED`,
      `─────────────────────────────`,
      `Customer : ${resolvedName || 'Anonymous'}`,
      `Email    : ${resolvedEmail}`,
      `Type     : ${isGuest ? 'Guest' : user ? 'Registered User' : 'Unknown'}`,
      address ? `Address  : ${address}${city ? ', ' + city : ''}` : null,
      `─────────────────────────────`,
      `ORDER DETAILS`,
      orderRows,
      `─────────────────────────────`,
      `TOTAL    : $${cartTotal.toLocaleString()}`,
      `─────────────────────────────`,
      `Please contact ${resolvedEmail} to confirm payment receipt.`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const templateParams = {
        to_name: 'Umar Farooq',
        from_name: resolvedName || 'A Patron',
        reply_to: resolvedEmail || ADMIN_RECIPIENT_EMAIL,
        message: messageBody,
      };

      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const isConfigured =
        templateId &&
        publicKey &&
        !templateId.includes('YOUR_') &&
        !publicKey.includes('YOUR_');

      if (isConfigured) {
        await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, publicKey);
      } else {
        console.warn('EmailJS keys not configured — skipping email notification.');
      }
    } catch (emailError) {
      // Order still goes through; email failure does not block the user
      console.error('EmailJS error:', emailError);
    }

    setIsProcessing(false);
    setIsOrdered(true);

    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 4000);
  };

  // Order success screen
  if (isOrdered) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-white flex items-center justify-center"
        >
          <CheckCircle size={48} className="text-obsidian" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-serif italic text-white">Acquisition Confirmed</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            Your selections have been documented. A preservation specialist will contact{' '}
            <span className="text-white">{resolvedEmail}</span> regarding delivery protocols.
          </p>
          <p className="text-white/20 text-xs uppercase tracking-widest">
            Redirecting in a moment…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* LEFT — Form */}
        <div className="lg:col-span-7 space-y-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Bag
          </button>

          {/* Auth status pill */}
          <div className="flex items-center gap-3">
            {isGuest ? (
              <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-white/50">
                <Ghost size={12} />
                Browsing as Guest —{' '}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-white hover:underline"
                >
                  Sign in for faster checkout
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-white/50">
                <User size={12} />
                Signed in as <span className="text-white">{user.email}</span>
              </div>
            ) : null}
          </div>

          <section className="space-y-8">
            <h2 className="text-3xl font-serif italic border-b border-white/10 pb-6">Finalize Acquisition</h2>

            <form onSubmit={handlePlaceOrder} className="space-y-10">
              {/* Contact + Shipping */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Contact & Shipping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Email *</label>
                    {isGuest ? (
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-transparent border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors text-sm placeholder:text-white/20"
                      />
                    ) : (
                      <p className="text-lg font-medium border-b border-white/10 py-2">{user?.email || '–'}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Full Name *</label>
                    {isGuest ? (
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-transparent border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors text-sm placeholder:text-white/20"
                      />
                    ) : (
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Patron Name"
                        className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/50 transition-colors text-sm"
                      />
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Street Address</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Archival Destination"
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/50 transition-colors text-sm placeholder:text-white/20"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-white/50 transition-colors text-sm placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Payment Protocol</h3>
                <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <CreditCard size={20} className="text-white/40" />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest">Bank Transfer</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                        Transfer to the account below, then confirm below
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60 space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span>Account Title:</span>
                      <span className="text-white font-bold text-right">UMAR FAROOQ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span className="text-white font-bold text-right">Meezan Bank — Thokarniazbaig, LHR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account #:</span>
                      <span className="text-white font-bold text-right tracking-wider">02240109616062</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IBAN:</span>
                      <span className="text-white font-bold text-right tracking-wider">PK95MEZN0002240109616062</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-white text-obsidian py-6 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Confirm Payment Sent — ${cartTotal.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-[9px] uppercase tracking-widest text-white/20 text-center">
                By confirming, you agree that you have transferred the amount above. We will verify and ship your order.
              </p>
            </form>
          </section>
        </div>

        {/* RIGHT — Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-white/5 border border-white/10 p-10 space-y-10">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 border-b border-white/5 pb-4">
              Acquisition Summary
            </h3>

            <div className="space-y-6 max-h-96 overflow-y-auto no-scrollbar">
              {cart.length === 0 ? (
                <p className="text-white/30 text-xs uppercase tracking-widest">Your bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 aspect-[3/4] bg-white/5 shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.product.name}</h4>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold">${(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
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
