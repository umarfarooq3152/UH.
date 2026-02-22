import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  MoveRight,
  PenTool,
  Layers,
  Zap,
  Maximize2,
  Clock,
  ShoppingBag,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { cn } from './lib/utils';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import AuthModal from './components/AuthModal';
import CartSidebar from './components/CartSidebar';
import ChatBot from './components/ChatBot';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Archive from './pages/Archive';
import ProductDetails from './pages/ProductDetails';
import { Product as ProductType } from './types';
import Admin from './pages/Admin';

gsap.registerPlugin(ScrollTrigger);

// --- Constants ---

const WORKFLOW = [
  {
    id: "ink",
    title: "Ink",
    label: "01",
    description: "The preparation of soot and silk, a ritual of patience before the first stroke.",
    image: "https://picsum.photos/seed/ink/1200/800"
  },
  {
    id: "stroke",
    title: "Stroke",
    label: "02",
    description: "The reed pen meets the paper. A singular moment of absolute focus and geometry.",
    image: "https://picsum.photos/seed/stroke/1200/800"
  },
  {
    id: "soul",
    title: "Soul",
    label: "03",
    description: "The final resonance. Calligraphy that transcends the physical to touch the divine.",
    image: "https://picsum.photos/seed/soul/1200/800"
  }
];

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setAuthModalOpen, user, isAdmin } = useAuth();
  const { toggleCart, cart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-8 left-0 w-full z-50 px-6 flex justify-center pointer-events-none">
        <div className={cn(
          "glass-pill px-6 md:px-8 py-3 flex items-center justify-between w-full max-w-7xl transition-all duration-500 pointer-events-auto",
          isScrolled ? "scale-90 opacity-90" : "scale-100 opacity-100"
        )}>
          <Link to="/" className="text-white font-bold tracking-tighter text-xl">UH.</Link>
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/60">
            <a href="#gallery" onClick={(e) => handleScrollTo(e, '#gallery')} className="hover:text-white transition-colors cursor-pointer">Gallery</a>
            <Link to="/archive" className="hover:text-white transition-colors">Archive</Link>
            <a href="#process" onClick={(e) => handleScrollTo(e, '#process')} className="hover:text-white transition-colors cursor-pointer">Process</a>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {isAdmin && (
              <Link to="/admin" className="text-white/60 hover:text-white transition-colors p-2" title="Admin Dashboard">
                <Layers size={18} />
              </Link>
            )}
            <button
              onClick={() => user ? navigate('/profile') : setAuthModalOpen(true)}
              className="text-white/60 hover:text-white transition-colors p-2 hidden sm:block"
            >
              <UserIcon size={18} />
            </button>

            <button
              onClick={toggleCart}
              className="text-white/60 hover:text-white transition-colors p-2 relative"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-obsidian text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="bg-white text-obsidian px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors hidden md:block">
              Commission
            </button>

            <button
              className="md:hidden text-white/60 hover:text-white p-2 ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-xl flex flex-col pt-24 px-8"
          >
            <button className="absolute top-10 right-8 text-white/60 p-2" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
            <div className="flex flex-col gap-8 text-3xl font-serif italic text-white/80 mt-12">
              <a href="#gallery" onClick={(e) => handleScrollTo(e, '#gallery')} className="cursor-pointer">Gallery</a>
              <Link to="/archive" onClick={() => setMobileMenuOpen(false)}>Archive</Link>
              <a href="#process" onClick={(e) => handleScrollTo(e, '#process')} className="cursor-pointer">Process</a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  user ? navigate('/profile') : setAuthModalOpen(true);
                }}
                className="text-left"
              >
                {user ? 'Profile Component' : 'Identity Verification'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const frameCount = 150;
const currentFrame = (index: number) =>
  `/cali/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setLoaded(true);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (!loaded || !canvasRef.current || !triggerRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const render = (index: number) => {
      if (!images[index] || !images[index].complete || images[index].naturalWidth === 0) return;

      const img = images[index];
      context.clearRect(0, 0, canvas.width, canvas.height);

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
    };

    const playhead = { frame: 0 };
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(playhead.frame);
    };

    handleResize();

    const tween = gsap.to(playhead, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: triggerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
      onUpdate: () => render(playhead.frame),
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [loaded, images]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.2,
        delay: 0.5
      });
    }, triggerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={triggerRef} className="relative w-full h-[250vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-obsidian">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/10 to-obsidian z-0" />

        <div className="relative z-10 text-center max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-8"
          >
            Umars Hands — Digital Sanctuary
          </motion.div>

          <h1 className="flex flex-col items-center">
            <span className="hero-text text-2xl md:text-3xl font-light tracking-tight text-white/80 mb-2">
              Script meets
            </span>
            <span className="hero-text text-4xl md:text-[10vw] font-serif italic font-black leading-[0.85] text-white">
              Precision.
            </span>
          </h1>

          <div className="hero-text mt-12 flex flex-col items-center gap-8">
            <button
              onClick={() => {
                const element = document.querySelector('#gallery');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center gap-4 text-xs uppercase tracking-widest font-bold border border-white/20 px-8 py-6 md:py-4 rounded-full hover:bg-white hover:text-obsidian transition-all duration-500"
            >
              Explore the Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-[1px] h-12 bg-white" />
          <span className="text-[9px] uppercase tracking-widest">Scroll</span>
        </div>
      </div>
    </section>
  );
};

const DiagnosticShuffler = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { addToCart, products } = useStore();
  const PRODUCTS = products.slice(0, 4);

  useEffect(() => {
    if (PRODUCTS.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PRODUCTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="gallery" className="py-48 px-6 bg-obsidian">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">01 — The Gallery</div>
            <h2 className="text-4xl md:text-5xl font-serif italic text-white">Diagnostic Shuffler</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Our collection cycles through various script families, showcasing the evolution of form and the precision of the digital reed.
            </p>
          </div>

          <div className="space-y-8">
            {PRODUCTS.map((product, idx) => (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(idx);
                  }
                }}
                className={cn(
                  "block w-full text-left group transition-all duration-500 cursor-pointer outline-none",
                  activeIndex === idx ? "opacity-100" : "opacity-30 hover:opacity-50"
                )}
              >
                <div className="flex items-center justify-between py-4 border-b border-white/10">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-white/40">0{product.id}</span>
                    <span className="text-xl font-medium tracking-tight">{product.name}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-transform duration-500",
                    activeIndex === idx ? "translate-x-0" : "-translate-x-4"
                  )} />
                </div>
                <AnimatePresence mode="wait">
                  {activeIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 space-y-6"
                    >
                      <p className="text-xs text-white/40 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">${product.price.toLocaleString()}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-obsidian px-4 py-2 rounded-full hover:bg-white/90 transition-all"
                        >
                          <Plus size={12} /> Add to Bag
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 relative aspect-[4/5] overflow-hidden rounded-2xl bg-silver-slate/20">
          <AnimatePresence mode="wait">
            {PRODUCTS[activeIndex] && (
              <motion.img
                key={activeIndex}
                src={PRODUCTS[activeIndex].image_url}
                alt={PRODUCTS[activeIndex].name}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          <div className="absolute bottom-8 left-8 flex items-center gap-4">
            <div className="glass-pill px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
              {PRODUCTS[activeIndex]?.category || 'Artwork'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArchiveStep: React.FC<{ step: typeof WORKFLOW[0] }> = ({ step }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={containerRef} className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.img
          style={{ y, scale: 1.2 }}
          src={step.image}
          alt={step.title}
          className="w-full h-full object-cover opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-transparent to-obsidian" />
      </div>

      <div className="relative z-10 max-w-4xl px-6 text-center space-y-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="text-[12px] font-mono text-white/40 tracking-[0.5em]">{step.label} — THE PROTOCOL</div>
          <h2 className="text-5xl md:text-9xl font-serif italic text-white">{step.title}</h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed font-light">
            {step.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const StickyStackingArchive = () => {
  return (
    <section id="process" className="relative bg-obsidian">
      {WORKFLOW.map((step) => (
        <ArchiveStep key={step.id} step={step} />
      ))}
    </section>
  );
};

const ValueProps = () => {
  const props = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "Sacred Geometry",
      desc: "Precision-engineered scripts based on the Golden Ratio."
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Digital Heritage",
      desc: "Ultra-high resolution archiving of traditional manuscripts."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Spatial Installations",
      desc: "Bringing calligraphy into physical and digital architecture."
    }
  ];

  return (
    <section className="py-48 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        {props.map((prop, idx) => (
          <div key={idx} className="space-y-6 group">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-obsidian transition-all duration-500">
              {prop.icon}
            </div>
            <h3 className="text-2xl font-medium tracking-tight">{prop.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              {prop.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const ImageCard: React.FC<{
  art: ProductType,
  className?: string,
  children?: React.ReactNode
}> = ({
  art,
  className,
  children
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const validImages = art.images?.length ? art.images : [art.image_url];
    const navigate = useNavigate();

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isHovered && validImages.length > 1) {
        interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % validImages.length);
        }, 1500);
      } else {
        setCurrentIndex(0);
      }
      return () => clearInterval(interval);
    }, [isHovered, validImages.length]);

    return (
      <div
        className={cn("overflow-hidden bg-obsidian cursor-pointer relative", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/product/${art.id}`)}
      >
        <div className="absolute inset-0 w-full h-full">
          {validImages.map((src, idx) => (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt={art.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-1000 will-change-transform",
                isHovered ? "scale-110" : "scale-100",
                idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ))}
        </div>
        {children}
      </div>
    );
  };


const ArtExhibition = () => {
  const [viewState, setViewState] = useState<'featured' | 'slices'>('featured');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { addToCart, products } = useStore();
  const EXHIBITION_WORKS = products;

  const currentWork = (hoverIndex !== null && EXHIBITION_WORKS[hoverIndex]) ? EXHIBITION_WORKS[hoverIndex] : { name: "Featured Art", category: "Explore the curated collection" };

  return (
    <section className="py-48 px-6 bg-obsidian overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mb-16 flex justify-between items-center">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">The Exhibition</div>
          <h2 className="text-4xl font-serif italic text-white">Curated Silhouettes</h2>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setViewState('slices')}
            className={cn(
              "w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all",
              viewState === 'slices' ? "bg-white text-obsidian" : "hover:bg-white/10"
            )}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewState('featured')}
            className={cn(
              "w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all",
              viewState === 'featured' ? "bg-white text-obsidian" : "hover:bg-white/10"
            )}
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {viewState === 'featured' ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="panels-container"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {EXHIBITION_WORKS.map((work, idx) => (
                <ImageCard
                  key={idx}
                  art={work}
                  className="hero-panel group relative"
                >
                  <div
                    className="absolute inset-0 z-20"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-transparent z-30 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(work);
                      }}
                      className="bg-white text-obsidian px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform pointer-events-auto"
                    >
                      Acquire Piece
                    </button>
                  </div>
                </ImageCard>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="slices"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="slice-gallery"
            >
              {EXHIBITION_WORKS.slice(0, 6).map((work, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      delay: i * 0.1,
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  }}
                  className="slice-panel group relative overflow-hidden"
                >
                  {i === 4 ? (
                    <div className="w-full h-full bg-white transition-colors duration-700 group-hover:bg-white/90 cursor-pointer" onClick={() => window.location.href = `#/product/${work.id}`}>
                      <div className="flex flex-col items-center justify-center h-full">
                        <h2 className="enchanted-title text-obsidian">Enchanted</h2>
                        <div className="mt-12 flex flex-col items-center text-center">
                          <Zap className="w-8 h-8 mb-4 opacity-70" />
                          <span className="text-[10px] font-serif italic tracking-[0.15em] text-obsidian uppercase leading-tight px-4">
                            Explore Script &<br />Extra Material
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ImageCard
                      art={work}
                      className="w-full h-full"
                    >
                      {i === 0 && (
                        <div className="song-tab z-30">
                          <span className="tab-text">Sacred Geometry</span>
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-transparent transition-colors duration-700 z-20 pointer-events-none" />

                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                        <span className="bg-white text-obsidian px-4 py-2 text-[8px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                          {work.name} — ${work.price}
                        </span>
                      </div>
                    </ImageCard>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 text-center space-y-4 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWork.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-4xl md:text-7xl font-serif italic text-white tracking-tight">
                {currentWork.name}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 mt-4 italic">
                {currentWork.category}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-24 px-6 border-t border-white/10 bg-obsidian">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="space-y-8">
          <div className="text-4xl font-bold tracking-tighter">UH.</div>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            A digital sanctuary for high-fidelity Arabic calligraphy.
            Archiving the soul of the script for the digital age.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-white/30">Navigation</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Archive</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Process</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-white/30">Connect</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Behance</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-white/30">Legal</div>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/20">
        <div>© 2024 Umars Hands. All Rights Reserved.</div>
        <div className="flex items-center gap-4">
          <Clock className="w-3 h-3" />
          <span>GMT +00:00</span>
        </div>
      </div>
    </footer>
  );
};

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Hero />
      <ValueProps />
      <DiagnosticShuffler />
      <ArtExhibition />
      <StickyStackingArchive />
    </>
  );
};

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <main className="relative bg-obsidian text-white selection:bg-white selection:text-obsidian">
              <div className="noise-overlay" />
              <Navbar />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>

              <Footer />

              <AuthModal />
              <CartSidebar />
              <ChatBot />
            </main>
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
}
