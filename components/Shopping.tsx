import React, { useState } from 'react';
import { Search, ShoppingBag, Plus, Loader2, ExternalLink, ShieldCheck, ShoppingCart, Coffee, Utensils, Smartphone, Shirt, Package, Wallet } from 'lucide-react';
import { getShoppingInsights } from '../services/geminiService';
import { ShoppingItem, Transaction, Theme } from '../types';
import ReactMarkdown from 'react-markdown';

interface ShoppingProps {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  theme: Theme;
}

// Fallback Icon Logic
const getProductIcon = (name: string, category: string) => {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  
  if (c.includes('food') || c.includes('grocer') || n.includes('bread') || n.includes('meal')) return <Utensils size={48} className="text-current opacity-50" />;
  if (n.includes('coffee') || n.includes('drink') || n.includes('tea')) return <Coffee size={48} className="text-current opacity-50" />;
  if (c.includes('tech') || n.includes('phone') || n.includes('laptop')) return <Smartphone size={48} className="text-current opacity-50" />;
  if (c.includes('clothes') || n.includes('shirt') || n.includes('jean') || n.includes('shoe')) return <Shirt size={48} className="text-current opacity-50" />;
  return <Package size={48} className="text-current opacity-50" />;
};

const Shopping: React.FC<ShoppingProps> = ({ onAddTransaction, theme }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<{ items: ShoppingItem[]; rawText: string; sources: any[] } | null>(null);
  const [cart, setCart] = useState<ShoppingItem[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setInsights(null);

    try {
      const result = await getShoppingInsights(query);
      setInsights(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: ShoppingItem) => {
    if (!cart.find(i => i.id === item.id)) {
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const buyItem = (item: ShoppingItem) => {
    onAddTransaction({
      type: 'expense',
      amount: item.price,
      category: item.category || 'Shopping',
      description: `${item.brand} ${item.name} (${item.store})`,
      date: new Date().toISOString(),
    });
  };

  const totalEstimated = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b ${theme.classes.panelBorder} pb-8`}>
        <div>
          <h2 className={`text-3xl ${theme.classes.fontHead} ${theme.classes.accent} uppercase tracking-widest drop-shadow-md`}>Market Intelligence</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className={`${theme.classes.textMuted} text-[10px] tracking-[0.2em] uppercase`}>Trusted Sources &middot; Durban Region</p>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-auto flex items-center relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trusted retailers..."
            className={`w-full md:w-96 bg-black/5 border ${theme.classes.panelBorder} p-4 pl-5 pr-14 ${theme.classes.radius} ${theme.classes.textMain} focus:outline-none focus:border-current focus:bg-black/10 transition-all placeholder-stone-500 font-sans`}
          />
          <button 
            type="submit" 
            disabled={isLoading || !query}
            className={`absolute right-3 ${theme.classes.textMuted} hover:${theme.classes.accent} disabled:opacity-30 transition-colors p-2`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results Area */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading && (
             <div className={`h-80 flex flex-col items-center justify-center ${theme.classes.textMuted} border ${theme.classes.panelBorder} border-dashed ${theme.classes.radius} bg-black/5 animate-pulse`}>
               <Loader2 className={`animate-spin mb-6 ${theme.classes.accent}`} size={48} />
               <p className="uppercase tracking-[0.2em] text-xs font-serif">Scanning Trusted Retailers...</p>
             </div>
          )}

          {!isLoading && !insights && (
            <div className={`h-80 flex flex-col items-center justify-center ${theme.classes.textMuted} border ${theme.classes.panelBorder} border-dashed ${theme.classes.radius} bg-black/5`}>
               <ShoppingBag size={64} className="mb-6 opacity-10" />
               <p className={`text-sm tracking-wider ${theme.classes.fontHead} italic`}>Initiate search to access market data.</p>
            </div>
          )}

          {insights && (
            <div className="space-y-8 animate-fade-in">
              {/* Structured Cards */}
              {insights.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`${theme.classes.panel} border ${theme.classes.panelBorder} ${theme.classes.radius} overflow-hidden flex flex-col group hover:${theme.classes.accentBorder} transition-all duration-300`}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      {/* Product Visual Header */}
                      <div className={`h-40 bg-black/5 relative flex items-center justify-center overflow-hidden border-b ${theme.classes.panelBorder}`}>
                        {item.imageUrl && !item.imageUrl.includes('undefined') ? (
                            <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-50 transition-opacity">
                                {getProductIcon(item.name, item.category)}
                            </div>
                        )}
                        <div className="hidden absolute inset-0 flex flex-col items-center justify-center opacity-50">
                             {getProductIcon(item.name, item.category)}
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-sm border backdrop-blur-md shadow-lg ${
                                item.type === 'cheapest' ? 'bg-amber-500/90 text-black border-amber-500' :
                                item.type === 'healthier' ? 'bg-emerald-500/90 text-black border-emerald-500' :
                                'bg-red-500/90 text-white border-red-500'
                            }`}>
                                {item.type === 'cheapest' ? 'Best Price' : item.type === 'healthier' ? 'Healthy' : 'On Sale'}
                            </span>
                            <span className="bg-black/80 text-white border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-sm flex items-center gap-1 backdrop-blur-md">
                                <ShieldCheck size={10} className="text-emerald-500" /> Trusted
                            </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <div>
                                <p className={`text-[10px] ${theme.classes.accent} uppercase tracking-widest font-bold mb-1`}>{item.brand}</p>
                                <h3 className={`${theme.classes.fontHead} text-lg ${theme.classes.textMain} leading-tight`}>{item.name}</h3>
                             </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs ${theme.classes.textMuted} uppercase tracking-wider flex items-center gap-1`}>
                                <ShoppingCart size={12} /> {item.store}
                            </span>
                            <span className="w-1 h-1 bg-current opacity-30 rounded-full"></span>
                            <span className={`text-[10px] ${theme.classes.textMuted} uppercase border ${theme.classes.panelBorder} px-1.5 rounded bg-black/5`}>{item.category}</span>
                        </div>

                        <div className={`bg-black/5 p-3 rounded-sm mb-4 border ${theme.classes.panelBorder} relative`}>
                             <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${theme.classes.accentBg} opacity-30`}></div>
                             <p className={`${theme.classes.textMuted} text-xs italic leading-relaxed`}>"{item.reason}"</p>
                        </div>

                        <div className={`mt-auto pt-4 border-t ${theme.classes.panelBorder} flex items-center justify-between`}>
                            <div>
                                <p className={`text-[9px] ${theme.classes.textMuted} uppercase tracking-widest`}>Price</p>
                                <p className={`text-2xl font-mono font-bold ${theme.classes.textMain}`}>R {item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => addToCart(item)}
                                    className={`p-2 border ${theme.classes.panelBorder} bg-black/5 hover:bg-black/10 ${theme.classes.textMuted} hover:${theme.classes.textMain} rounded-sm transition-colors`}
                                    title="Add to List"
                                >
                                    <Plus size={18} />
                                </button>
                                <button 
                                    onClick={() => buyItem(item)}
                                    className={`px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-lg`}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Summary */}
              <div className={`${theme.classes.panel} p-6 ${theme.classes.radius} border ${theme.classes.panelBorder} relative`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${theme.classes.accentBg} opacity-20`}></div>
                <h4 className={`${theme.classes.accent} text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2`}>
                    <div className={`w-4 h-[1px] ${theme.classes.accentBg}`}></div> Buddy's Briefing
                </h4>
                <div className={`prose prose-invert prose-sm ${theme.classes.textMain} max-w-none font-sans leading-relaxed text-xs`}>
                  <ReactMarkdown>{insights.rawText}</ReactMarkdown>
                </div>
                
                {/* Sources */}
                {insights.sources.length > 0 && (
                  <div className={`mt-6 pt-4 border-t ${theme.classes.panelBorder}`}>
                     <p className={`text-[9px] ${theme.classes.textMuted} uppercase tracking-widest mb-2`}>Verified Data Sources</p>
                     <div className="flex flex-wrap gap-2">
                        {insights.sources.map((source, i) => (
                           source.web?.uri && (
                             <a 
                               key={i} 
                               href={source.web.uri} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className={`flex items-center gap-1.5 text-[9px] ${theme.classes.textMuted} hover:${theme.classes.accent} transition-colors border ${theme.classes.panelBorder} px-2 py-1 rounded-sm hover:${theme.classes.accentBorder} bg-black/5`}
                             >
                               <ExternalLink size={8} />
                               {source.web.title || 'Source'}
                             </a>
                           )
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Smart Cart / Expenses */}
        <div className="lg:col-span-1">
          <div className={`sticky top-28 ${theme.classes.panel} border ${theme.classes.panelBorder} ${theme.classes.radius} shadow-2xl p-6`}>
             <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${theme.classes.panelBorder}`}>
                <div className="p-2 bg-emerald-500/10 rounded-sm">
                    <Wallet className="text-emerald-500" size={18} />
                </div>
                <div>
                    <h3 className={`text-sm ${theme.classes.fontHead} ${theme.classes.textMain} uppercase tracking-widest`}>Pending Expenses</h3>
                    <p className={`text-[9px] ${theme.classes.textMuted} uppercase tracking-wide`}>Sync to Budget</p>
                </div>
             </div>

             <div className="space-y-3 mb-8 min-h-[100px]">
                {cart.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                      <div className={`w-12 h-12 border-2 ${theme.classes.panelBorder} border-dashed rounded-full mx-auto mb-3 flex items-center justify-center`}>
                          <Plus size={20} className={theme.classes.textMuted} />
                      </div>
                      <p className={`${theme.classes.textMuted} text-xs tracking-wider uppercase`}>List Empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className={`group bg-black/5 p-3 rounded-sm border border-transparent hover:${theme.classes.panelBorder} transition-all`}>
                      <div className="flex justify-between items-start mb-1">
                          <p className={`${theme.classes.textMain} text-xs font-medium truncate w-[70%]`}>{item.name}</p>
                          <span className="text-emerald-500 font-mono text-xs">R{item.price.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className={`${theme.classes.textMuted} text-[9px] uppercase tracking-wider`}>{item.category}</p>
                         <button 
                             onClick={() => removeFromCart(item.id)}
                             className={`${theme.classes.textMuted} hover:text-red-500 transition-colors`}
                         >
                            <Plus size={12} className="rotate-45" />
                         </button>
                      </div>
                      <button 
                        onClick={() => buyItem(item)}
                        className={`w-full mt-2 py-1.5 bg-black/5 hover:bg-emerald-500/20 ${theme.classes.textMuted} hover:text-emerald-500 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all`}
                      >
                         Log Expense
                      </button>
                    </div>
                  ))
                )}
             </div>

             <div className={`pt-6 border-t ${theme.classes.panelBorder}`}>
                <div className="flex justify-between items-end mb-6">
                  <span className={`${theme.classes.textMuted} text-[10px] uppercase tracking-widest`}>Total</span>
                  <span className={`text-3xl font-mono font-bold ${theme.classes.textMain}`}>R {totalEstimated.toFixed(2)}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shopping;