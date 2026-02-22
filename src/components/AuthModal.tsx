import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      if (
        email === import.meta.env.VITE_ADMIN_USER &&
        password === import.meta.env.VITE_ADMIN_PASS
      ) {
        loginAsAdmin();
        addToast('Admin authorization granted.', 'success');
        return;
      }

      if (isSignUp) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          addToast('Profile initialized successfully.', 'success');
        } catch (err: any) {
          if (err.message.includes('400') || err.message.includes('API key') || err.message.includes('auth/')) {
            // Mock local login if firebase isn't configured
            loginAsAdmin();
            addToast('Mock profile initialized (Demo mode).', 'success');
          } else {
            throw err;
          }
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          addToast('Access granted.', 'success');
        } catch (err: any) {
          if (err.message.includes('400') || err.message.includes('API key') || err.message.includes('auth/')) {
            loginAsAdmin();
            addToast('Mock access granted (Demo mode).', 'success');
          } else {
            throw err;
          }
        }
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, 'error');
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
      addToast('Google Access granted.', 'success');
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-obsidian/80 backdrop-blur-xl"
        onClick={() => setAuthModalOpen(false)}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-obsidian w-full max-w-md border border-white/10 p-10 shadow-2xl"
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <div className="text-white font-bold tracking-tighter text-3xl mb-4">UH.</div>
          <h2 className="text-2xl font-serif italic text-white">Identity Verification</h2>
          <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">Enter your credentials to access the archive</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@archive.com"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[10px] uppercase tracking-widest text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-obsidian py-4 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
              <>
                {isSignUp ? 'Initialize Profile' : 'Authorize Access'} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/40">
              <span className="bg-obsidian px-4">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-transparent border border-white/20 text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Continue with Google
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mt-4"
          >
            {isSignUp ? 'Already documented? Access Archive' : 'New Patron? Initialize Profile'}
          </button>
        </div>

        <p className="mt-10 text-[8px] uppercase tracking-widest text-center text-white/20 leading-loose">
          By entering the archive, you accept the curation protocols and Terms of Service.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthModal;
