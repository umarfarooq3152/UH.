import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Package, LogOut, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    saved_address: profile?.saved_address || '',
    saved_city: profile?.saved_city || '',
    saved_postal: profile?.saved_postal || ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-12 items-start md:items-end border-b border-white/10 pb-12">
          <div className="w-32 h-32 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <User size={64} strokeWidth={0.5} className="text-white/20" />
            )}
          </div>
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">Verified Patron</span>
            <h1 className="text-5xl md:text-7xl font-serif italic font-black leading-none">{profile?.full_name}</h1>
            <p className="text-sm text-white/40 font-light tracking-widest">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Identity Matrix</h3>
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors text-white/60"
                >
                  {isEditing ? <><Save size={12} /> Save Changes</> : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Full Name</label>
                  {isEditing ? (
                    <input 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-white/5 border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors"
                    />
                  ) : (
                    <p className="text-lg font-medium">{profile?.full_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Shipping Destination</label>
                  {isEditing ? (
                    <div className="space-y-4">
                      <input 
                        placeholder="Street Address"
                        value={formData.saved_address}
                        onChange={e => setFormData({...formData, saved_address: e.target.value})}
                        className="w-full bg-white/5 border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors"
                      />
                      <div className="flex gap-4">
                        <input 
                          placeholder="City"
                          value={formData.saved_city}
                          onChange={e => setFormData({...formData, saved_city: e.target.value})}
                          className="w-1/2 bg-white/5 border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors"
                        />
                        <input 
                          placeholder="Postal Code"
                          value={formData.saved_postal}
                          onChange={e => setFormData({...formData, saved_postal: e.target.value})}
                          className="w-1/2 bg-white/5 border-b border-white/20 py-2 outline-none focus:border-white/50 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg font-medium">
                      {profile?.saved_address ? `${profile.saved_address}, ${profile.saved_city}` : 'No destination documented'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 border-b border-white/5 pb-4">Recent Acquisitions</h3>
              <div className="py-12 text-center border border-dashed border-white/10 opacity-30">
                <Package size={32} strokeWidth={1} className="mx-auto mb-4" />
                <p className="text-[10px] uppercase tracking-widest">No documented acquisitions found in the archive</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/5 border border-white/10 p-8 space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Core Protocols</h4>
              <div className="space-y-4">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors group"
                >
                  Terminate Session
                  <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
