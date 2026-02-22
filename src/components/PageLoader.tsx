import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageLoaderProps {
    isLoading: boolean;
    progress: number;
}

export default function PageLoader({ isLoading, progress }: PageLoaderProps) {
    const progressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="page-loader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.04,
                        filter: 'blur(12px)',
                    }}
                    transition={{
                        duration: 1.1,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 60%, #111111 0%, #080808 60%, #000000 100%)',
                        backdropFilter: 'blur(0px)',
                    }}
                >
                    {/* Noise grain overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.04]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Subtle radial glow */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            background:
                                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
                        }}
                    />

                    {/* Main content */}
                    <div className="relative z-10 flex flex-col items-center gap-12 select-none">
                        {/* Logo mark */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center gap-3"
                        >
                            <span
                                className="text-white font-bold tracking-tighter leading-none"
                                style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontFamily: '"Inter", sans-serif' }}
                            >
                                UH.
                            </span>
                            <motion.span
                                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                                animate={{ opacity: 0.35, letterSpacing: '0.55em' }}
                                transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
                                className="text-white text-[9px] uppercase font-medium"
                            >
                                Umars Hands
                            </motion.span>
                        </motion.div>

                        {/* Progress container */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex flex-col items-center gap-4 w-full"
                        >
                            {/* Thin progress bar */}
                            <div
                                className="relative overflow-hidden rounded-full"
                                style={{
                                    width: 'clamp(180px, 30vw, 280px)',
                                    height: '1px',
                                    background: 'rgba(255,255,255,0.1)',
                                }}
                            >
                                <div
                                    ref={progressBarRef}
                                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.95) 100%)',
                                        width: '0%',
                                        boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                                    }}
                                />
                            </div>

                            {/* Percentage */}
                            <motion.span
                                className="text-white/30 font-mono text-[10px] tracking-[0.3em] tabular-nums"
                            >
                                {Math.round(progress).toString().padStart(3, '0')}
                            </motion.span>
                        </motion.div>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.25 }}
                            transition={{ delay: 0.8, duration: 1.2 }}
                            className="text-white text-[9px] uppercase tracking-[0.4em] font-light"
                        >
                            Digital Sanctuary
                        </motion.p>
                    </div>

                    {/* Decorative corner lines */}
                    {[
                        'top-8 left-8 border-t border-l',
                        'top-8 right-8 border-t border-r',
                        'bottom-8 left-8 border-b border-l',
                        'bottom-8 right-8 border-b border-r',
                    ].map((cls, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={`absolute w-10 h-10 border-white/10 ${cls}`}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
