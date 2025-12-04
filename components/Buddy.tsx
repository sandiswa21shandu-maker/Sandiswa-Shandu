import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ShoppingCart, Send, X, ExternalLink, Sparkles, Zap, Heart, Terminal, FileText, Leaf } from 'lucide-react';
import { Transaction, Mode, ChatMessage, Theme } from '../types';
import { getFinancialAdvice, searchProduct } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface BuddyProps {
  transactions: Transaction[];
  mode: Mode;
  theme: Theme;
}

const Buddy: React.FC<BuddyProps> = ({ transactions, mode, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'shop'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "I'm Buddy. I don't sugar-coat. Let's look at your numbers." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      
      if (activeTab === 'shop') {
        const result = await searchProduct(input, mode);
        responseText = result.text;
        if (result.sources && result.sources.length > 0) {
           responseText += `\n\n**Sources:**\n`;
           result.sources.forEach((chunk: any) => {
              if (chunk.web?.uri) {
                  responseText += `- [${chunk.web.title || 'Link'}](${chunk.web.uri})\n`;
              }
           });
        }
      } else {
        responseText = await getFinancialAdvice(transactions, mode, input);
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "System failure. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBuddyIcon = () => {
      switch(theme.buddyType) {
          case 'heart': return <Heart size={24} className={isLoading ? "animate-bounce" : ""} fill="currentColor" />;
          case 'pixel': return <Terminal size={24} className={isLoading ? "animate-bounce" : ""} />;
          case 'paper': return <FileText size={24} className={isLoading ? "animate-bounce" : ""} />;
          case 'leaf': return <Leaf size={24} className={isLoading ? "animate-bounce" : ""} />;
          default: return <Zap size={24} className={isLoading ? "animate-bounce" : ""} />;
      }
  };

  return (
    <>
      {/* Cinematic Floating Orb Trigger */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2 group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-out shadow-lg hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 bg-black border border-white/20' : `bg-black border ${theme.classes.accentBorder}`}`}
        >
          {/* Animated Glow Layers */}
          {!isOpen && (
            <>
              <div className={`absolute inset-0 rounded-full ${theme.classes.accentBg} opacity-20 animate-ping`}></div>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-black to-${theme.classes.accentBg} opacity-50 animate-pulse-slow`}></div>
            </>
          )}
          
          <div className={`relative z-10 ${theme.classes.accent}`}>
            {isOpen ? <X size={24} /> : getBuddyIcon()}
          </div>
        </button>
        {!isOpen && <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.classes.textMuted} ${theme.classes.fontHead} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>Buddy AI</span>}
      </div>

      {/* Glass Panel Interface */}
      <div 
        className={`fixed bottom-28 right-8 w-[90vw] md:w-96 ${theme.classes.panel} border ${theme.classes.panelBorder} ${theme.classes.radius} shadow-2xl z-40 flex flex-col transition-all duration-500 origin-bottom-right overflow-hidden ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}
        style={{ height: '550px' }}
      >
        {/* Header */}
        <div className={`p-5 border-b ${theme.classes.panelBorder} flex items-center justify-between backdrop-blur-md`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${theme.classes.accentBg} flex items-center justify-center shadow-lg relative`}>
                    <Sparkles size={14} className="text-white animate-pulse" />
                </div>
                <div>
                    <h3 className={`${theme.classes.accent} ${theme.classes.fontHead} font-bold tracking-wider`}>BUDDY</h3>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className={`${theme.classes.textMuted} text-[9px] uppercase tracking-widest`}>Online</p>
                    </div>
                </div>
            </div>
            <div className={`flex gap-1 p-1 rounded-lg border ${theme.classes.panelBorder} bg-black/5`}>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-colors ${activeTab === 'chat' ? `${theme.classes.bg} ${theme.classes.accent} shadow-sm` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
                >
                    Advise
                </button>
                <button 
                    onClick={() => setActiveTab('shop')}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-colors ${activeTab === 'shop' ? `${theme.classes.bg} text-emerald-500 shadow-sm` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
                >
                    Shop
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-stone-800">
            {activeTab === 'shop' && messages.length === 1 && (
                <div className={`p-4 bg-emerald-500/10 border border-emerald-500/20 ${theme.classes.radius} text-center animate-fade-in`}>
                    <ShoppingCart className="mx-auto text-emerald-500 mb-2 opacity-80" size={24} />
                    <p className={`${theme.classes.textMain} text-xs leading-relaxed`}>Looking for something? I'll find the best price in Durban and suggest cheaper alternatives.</p>
                </div>
            )}
            
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                    <div className={`max-w-[85%] p-3.5 ${theme.classes.radius} text-sm shadow-lg backdrop-blur-sm ${
                        msg.role === 'user' 
                            ? `${theme.classes.accentBg} text-white opacity-90` 
                            : `${theme.classes.bg} ${theme.classes.textMain} border ${theme.classes.panelBorder}`
                    }`}>
                        <ReactMarkdown 
                            components={{
                                a: ({node, ...props}) => <a {...props} className="text-emerald-400 underline hover:text-emerald-300 flex items-center gap-1 inline-flex" target="_blank" rel="noopener noreferrer"><ExternalLink size={10}/>{props.children}</a>,
                                strong: ({node, ...props}) => <strong {...props} className={`font-bold ${theme.classes.accent}`} />,
                                p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />
                            }}
                        >
                            {msg.text}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className={`bg-black/10 px-4 py-3 ${theme.classes.radius} border ${theme.classes.panelBorder} flex gap-1`}>
                        <span className={`w-1.5 h-1.5 ${theme.classes.accentBg} rounded-full animate-bounce`} style={{animationDelay: '0ms'}}></span>
                        <span className={`w-1.5 h-1.5 ${theme.classes.accentBg} rounded-full animate-bounce`} style={{animationDelay: '150ms'}}></span>
                        <span className={`w-1.5 h-1.5 ${theme.classes.accentBg} rounded-full animate-bounce`} style={{animationDelay: '300ms'}}></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-3 border-t ${theme.classes.panelBorder} backdrop-blur-xl bg-black/5`}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={activeTab === 'chat' ? "Type to consult..." : "Search product..."}
                    className={`w-full bg-black/10 ${theme.classes.textMain} border ${theme.classes.panelBorder} p-3 pr-10 rounded-xl text-sm focus:outline-none focus:border-current transition-all placeholder-stone-500 font-sans`}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className={`absolute right-2 p-1.5 ${theme.classes.textMuted} hover:${theme.classes.accent} hover:bg-black/5 rounded-lg disabled:opacity-50 transition-all`}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Buddy;