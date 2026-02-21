import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, ShoppingBag, Search, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '../context/StoreContext';
import { ALL_PRODUCTS } from '../data/products';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key' });

interface Message {
  role: 'user' | 'model';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Welcome to the archive. I am your digital curator. How may I assist your discovery today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart, setSearchQuery, setSelectedCategory, toggleCart, cart, products } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.concat({ role: 'user', content: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are "The Curator", an elite AI assistant for a high-end calligraphy and art store called "UH." (Universal Heritage).
          Your tone is sophisticated, minimalist, and architectural. Use terms like "silhouette," "textural," and "curated."
          
          You have access to the following products:
          ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, description: p.description })))}
          
          You can perform the following actions using tools:
          1. filter_products(query: string, category: string): Filter the products shown in the archive view. Use "All" for category if not specified.
          2. add_to_cart(product_id: string | number): Add a specific product to the user's cart.
          3. show_cart(): Open the cart sidebar for the user.
          
          When a user asks to see something, use filter_products.
          When a user wants to buy or add something, use add_to_cart.
          If they want to see their bag, use show_cart.
          
          Always confirm your actions in your response.`,
          tools: [{
            functionDeclarations: [
              {
                name: "filter_products",
                description: "Filter the products shown in the archive view.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING, description: "The search query for name or description." },
                    category: { type: Type.STRING, description: "The category to filter by (e.g., 'Classical Thuluth', 'Original Soundtrack', 'All')." }
                  },
                  required: ["query", "category"]
                }
              },
              {
                name: "add_to_cart",
                description: "Add a product to the cart by its ID.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    product_id: { type: Type.STRING, description: "The ID of the product to add." }
                  },
                  required: ["product_id"]
                }
              },
              {
                name: "show_cart",
                description: "Open the cart sidebar.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
                }
              }
            ]
          }]
        }
      });

      let modelContent = response.text || '';

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'filter_products') {
            const { query, category } = call.args as any;
            setSearchQuery(query || '');
            setSelectedCategory(category || 'All');
          } else if (call.name === 'add_to_cart') {
            const { product_id } = call.args as any;
            const product = ALL_PRODUCTS.find(p => String(p.id) === String(product_id));
            if (product) {
              addToCart(product);
            }
          } else if (call.name === 'show_cart') {
            toggleCart();
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: modelContent || 'Protocol executed.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Apologies, a synchronization error occurred in the neural link.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-white text-obsidian rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-[200] w-[400px] h-[600px] bg-obsidian border border-white/10 shadow-2xl flex flex-col overflow-hidden rounded-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-obsidian">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">The Curator</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Neural Link Active</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%] space-y-2",
                  m.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 text-xs leading-relaxed",
                    m.role === 'user'
                      ? "bg-white text-obsidian rounded-2xl rounded-tr-none font-medium"
                      : "bg-white/5 text-white/80 border border-white/10 rounded-2xl rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start max-w-[85%]">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-white/40" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire the archive..."
                  className="w-full bg-obsidian border border-white/10 rounded-full pl-6 pr-14 py-4 text-xs text-white outline-none focus:border-white/30 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 bg-white text-obsidian rounded-full flex items-center justify-center hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
