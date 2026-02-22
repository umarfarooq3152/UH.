import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, CheckCircle, Clock } from 'lucide-react';
import { Review, Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ReviewSystemProps {
    product: Product;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({ product }) => {
    const { user, profile, isAdmin } = useAuth();
    const { updateProduct } = useStore();
    const { addToast } = useToast();

    const [newReviewText, setNewReviewText] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter reviews: show approved ones, plus pending ones if they belong to the current user (if trackable) or if admin
    const visibleReviews = (product.reviews || []).filter(
        r => r.status === 'approved' || isAdmin
    );

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReviewText.trim()) return;

        if (!user) {
            addToast('Please login to leave a review', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const newReview: Review = {
                id: `review-${Date.now()}`,
                name: profile?.full_name || user.email || 'Anonymous Patron',
                rating: newReviewRating,
                text: newReviewText,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: isAdmin ? 'approved' : 'pending' // Admin reviews are auto-approved
            };

            const updatedReviews = [...(product.reviews || []), newReview];
            await updateProduct(String(product.id), { reviews: updatedReviews });

            setNewReviewText('');
            setNewReviewRating(5);
            addToast(isAdmin ? 'Review published' : 'Review submitted for moderation', 'success');
        } catch (error) {
            console.error('Error submitting review:', error);
            addToast('Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateReviewStatus = async (reviewId: string, newStatus: 'pending' | 'approved') => {
        if (!isAdmin) return;
        try {
            const updatedReviews = (product.reviews || []).map(r =>
                r.id === reviewId ? { ...r, status: newStatus } : r
            );
            await updateProduct(String(product.id), { reviews: updatedReviews });
            addToast(`Review ${newStatus}`, 'success');
        } catch (error) {
            addToast('Failed to update review status', 'error');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!isAdmin) return;
        try {
            const updatedReviews = (product.reviews || []).filter(r => r.id !== reviewId);
            await updateProduct(String(product.id), { reviews: updatedReviews });
            addToast('Review deleted', 'success');
        } catch (error) {
            addToast('Failed to delete review', 'error');
        }
    };

    return (
        <div className="pt-16 space-y-8">
            <h3 className="text-2xl font-serif italic border-b border-white/10 pb-4">Patron Reviews</h3>
            <div className="space-y-6">
                {/* Add Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <h4 className="font-bold text-sm tracking-widest">Leave a Review</h4>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className={`text-xl transition-colors ${star <= newReviewRating ? 'text-yellow-500' : 'text-white/20 hover:text-white/40'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder={user ? "Write your thoughts..." : "Please log in to write a review"}
                        disabled={!user || isSubmitting}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 h-24 text-xs disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!user || isSubmitting || !newReviewText.trim()}
                        className="self-end bg-white text-obsidian px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>

                {/* Existing Reviews List */}
                {visibleReviews.length === 0 ? (
                    <p className="text-white/40 text-sm italic">No reviews yet. Be the first to share your thoughts.</p>
                ) : (
                    visibleReviews.map((review) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={review.id}
                            className={`bg-white/5 p-6 rounded-2xl relative ${review.status === 'pending' ? 'border border-yellow-500/30' : ''}`}
                        >
                            {isAdmin && (
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    {review.status === 'pending' ? (
                                        <button
                                            title="Approve Review"
                                            onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                                            className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded-full transition-colors"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            title="Mark as Pending"
                                            onClick={() => handleUpdateReviewStatus(review.id, 'pending')}
                                            className="p-1.5 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/40 rounded-full transition-colors"
                                        >
                                            <Clock size={14} />
                                        </button>
                                    )}
                                    <button
                                        title="Delete Review"
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/40 rounded-full transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-1 text-yellow-500 text-sm">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i < review.rating ? "text-yellow-500" : "text-white/20"}>★</span>
                                    ))}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-white/40">
                                    {review.date} {isAdmin && review.status === 'pending' && <span className="text-yellow-500 ml-2">(Pending)</span>}
                                </span>
                            </div>

                            <p className="text-white/60 text-xs mt-2 leading-relaxed whitespace-pre-wrap">
                                {review.text}
                            </p>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 mt-4 block">— {review.name}</span>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
