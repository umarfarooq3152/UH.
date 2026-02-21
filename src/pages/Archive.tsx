import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Product as ProductType } from '../types';
import { ALL_PRODUCTS } from '../data/products';

const Archive: React.FC = () => {
  const { addToCart, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredProducts: filteredArt } = useStore();
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const cats = new Set(ALL_PRODUCTS.map(art => art.category));
    return ['All', ...Array.from(cats)];
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
            <h1 className="text-6xl md:text-8xl font-serif italic font-black leading-none">The Archive</h1>
            <p className="text-sm text-white/40 font-light tracking-widest max-w-md">
              A permanent collection of digital and physical calligraphic works, curated for the modern eye.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <input 
                type="text"
                placeholder="Search the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 pl-12 pr-6 py-4 rounded-full outline-none focus:border-white/30 transition-all w-full md:w-64 text-xs font-bold uppercase tracking-widest"
              />
            </div>
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 px-8 py-4 rounded-full outline-none focus:border-white/30 transition-all w-full md:w-auto text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-obsidian">{cat}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredArt.map((art, idx) => (
              <motion.div
                layout
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group space-y-6"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
                  <img 
                    src={art.image_url} 
                    alt={art.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => addToCart(art)}
                      className="bg-white text-obsidian px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <Plus size={14} /> Add to Bag
                    </button>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-obsidian/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white">
                      ${art.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium tracking-tight group-hover:text-white transition-colors">{art.name}</h3>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{art.category}</p>
                  <p className="text-xs text-white/30 line-clamp-2 leading-relaxed font-light">
                    {art.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArt.length === 0 && (
          <div className="py-32 text-center space-y-6 opacity-30">
            <Search size={48} strokeWidth={1} className="mx-auto" />
            <p className="text-xl font-serif italic">No matches found in the archive</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-[10px] uppercase tracking-widest font-bold underline underline-offset-8 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
