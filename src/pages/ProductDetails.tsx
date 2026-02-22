import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { ReviewSystem } from '../components/ReviewSystem';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, products } = useStore();

    const product = products.find(p => String(p.id) === id);
    const validImages = product?.images?.length ? product.images : (product ? [product.image_url] : []);

    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-serif italic mb-4">Product Not Found</h1>
                <button
                    onClick={() => navigate('/archive')}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Back to Archive
                </button>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIdx((prev) => (prev + 1) % validImages.length);
    };

    const prevImage = () => {
        setCurrentImageIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    return (
        <div className="min-h-screen bg-obsidian text-white pt-32 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIdx}
                                    src={validImages[currentImageIdx]}
                                    alt={`${product.name} image ${currentImageIdx + 1}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                />
                            </AnimatePresence>

                            {validImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-4 p-3 rounded-full bg-obsidian/40 backdrop-blur-md hover:bg-white/20 transition-colors z-10">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-4 p-3 rounded-full bg-obsidian/40 backdrop-blur-md hover:bg-white/20 transition-colors z-10">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {validImages.length > 1 && (
                            <div className="flex items-center justify-center gap-4 overflow-x-auto py-2">
                                {validImages.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIdx(idx)}
                                        className={cn(
                                            "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                                            idx === currentImageIdx ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-12 lg:pt-12">
                        <div className="space-y-4">
                            <div className="text-[12px] font-mono text-white/40 tracking-[0.5em] uppercase">{product.category}</div>
                            <h1 className="text-5xl md:text-7xl font-serif italic">{product.name}</h1>
                            <p className="text-3xl font-light text-white/80">${product.price.toLocaleString()}</p>
                        </div>

                        <div className="h-[1px] w-full bg-white/10" />

                        <div className="space-y-6 text-white/60 font-light leading-relaxed">
                            <p>{product.description}</p>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-white text-obsidian py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={16} /> Add to Bag
                        </button>

                        {product.tags && product.tags.length > 0 && (
                            <div className="pt-8 flex flex-wrap gap-3">
                                {product.tags.map(tag => (
                                    <span key={tag} className="px-4 py-2 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <ReviewSystem product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
