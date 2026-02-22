import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Loader2, User, ShieldCheck, Ghost } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type Tab = 'login' | 'register' | 'admin';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, loginAsAdmin, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAdminEmail('');
    setAdminPassword('');
    setError(null);
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    resetForm();
  };

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    if (tab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
        addToast('Profile initialized. Welcome to the Archive.', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        addToast('Access granted. Welcome back.', 'success');
      }
      setAuthModalOpen(false);
      resetForm();
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      addToast('Google Access granted. Welcome.', 'success');
      setAuthModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      adminEmail === import.meta.env.VITE_ADMIN_USER &&
      adminPassword === import.meta.env.VITE_ADMIN_PASS
    ) {
      loginAsAdmin();
      addToast('Admin authorization granted.', 'success');
      resetForm();
    } else {
      setError('Invalid administrator credentials.');
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    addToast('Browsing as Guest. You can still place orders.', 'info');
    resetForm();
  };

  if (!isAuthModalOpen) return null;

  const tabConfig = [
    { id: 'login' as Tab, label: 'Sign In', icon: <User size={14} /> },
    { id: 'register' as Tab, label: 'Register', icon: <ArrowRight size={14} /> },
    { id: 'admin' as Tab, label: 'Admin', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-obsidian/85 backdrop-blur-xl"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#0a0a0a] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Top accent line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Close */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-10">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="text-white font-bold tracking-tighter text-3xl mb-1">UH.</div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">Identity Verification</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border border-white/10 rounded-full p-1 gap-1">
            {tabConfig.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${tab === t.id
                    ? 'bg-white text-obsidian'
                    : 'text-white/40 hover:text-white/70'
                  }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {(tab === 'login' || tab === 'register') && (
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'register' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'register' ? -20 : 20 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleUserAuth} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/40">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@archive.com"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/40">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                    />
                  </div>

                  {tab === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="text-[9px] uppercase tracking-[0.3em] text-white/40">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      />
                    </motion.div>
                  )}

                  {error && (
                    <p className="text-red-400 text-[10px] uppercase tracking-widest text-center bg-red-400/10 py-2 px-4">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-obsidian py-4 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : tab === 'register' ? (
                      <>Initialize Profile <ArrowRight size={14} /></>
                    ) : (
                      <>Authorize Access <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-white/30">
                    <span className="bg-[#0a0a0a] px-4">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-transparent border border-white/15 text-white/70 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Guest option */}
                <button
                  onClick={handleGuest}
                  className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors py-2"
                >
                  <Ghost size={12} />
                  Continue as Guest
                </button>
              </motion.div>
            )}

            {tab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6 p-4 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                  <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-400/80 uppercase tracking-widest leading-relaxed">
                    Restricted access. Administrator credentials required.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/40">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@umarshands.com"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-amber-400/30 transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-white/40">Admin Password</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-amber-400/30 transition-colors placeholder:text-white/20"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-[10px] uppercase tracking-widest text-center bg-red-400/10 py-2 px-4">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-400/90 text-obsidian py-4 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-amber-400 transition-all active:scale-[0.98]"
                  >
                    <ShieldCheck size={14} /> Access Control Panel
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-[8px] uppercase tracking-widest text-center text-white/15 leading-loose">
            By entering, you accept the curation protocols and Terms of Service.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
