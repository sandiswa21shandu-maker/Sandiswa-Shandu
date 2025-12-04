
import React, { useState, useEffect, useMemo } from 'react';
import Intro from './components/Intro';
import Dashboard from './components/Dashboard';
import Buddy from './components/Buddy';
import Shopping from './components/Shopping';
import GoalManager from './components/GoalManager';
import TransactionModal from './components/TransactionModal';
import HamburgerMenu from './components/HamburgerMenu';
import { Transaction, Mode, FinancialSummary, Theme, Goal } from './types';
import { THEMES } from './themes';
import { TrendingUp, TrendingDown, Trash2, LayoutDashboard, ShoppingCart, Briefcase, GraduationCap, Menu, Target } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  "Groceries", "Toiletries", "Transport", "School", 
  "Entertainment", "Rent", "Utilities", "Health", "Business", "Other"
];

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<Mode>('student');
  const [currentView, setCurrentView] = useState<'dashboard' | 'shopping' | 'goals'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [modalInitialData, setModalInitialData] = useState<{amount?: number, description?: string, category?: string} | undefined>(undefined);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('shandu-transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load transactions", e);
      }
    }

    const savedGoals = localStorage.getItem('shandu-goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error("Failed to load goals", e);
      }
    }

    const savedCats = localStorage.getItem('shandu-categories');
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    }

    const savedThemeId = localStorage.getItem('shandu-theme');
    if (savedThemeId) {
        const found = THEMES.find(t => t.id === savedThemeId);
        if (found) setTheme(found);
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem('shandu-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('shandu-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('shandu-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shandu-theme', theme.id);
  }, [theme]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (g: Goal) => {
    setGoals(prev => [...prev, g]);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addCategory = (newCat: string) => {
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat]);
    }
  };

  const summary: FinancialSummary = useMemo(() => {
    const income = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0);
    const expense = transactions.reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);
    const balance = income - expense;
    
    let status: 'profit' | 'loss' | 'break-even' = 'break-even';
    if (balance > 100) status = 'profit';
    if (balance < -100) status = 'loss';

    return { totalIncome: income, totalExpense: expense, balance, status };
  }, [transactions]);

  const openModal = (type: 'income' | 'expense', data?: {amount?: number, description?: string, category?: string}) => {
    setModalType(type);
    setModalInitialData(data);
    setIsModalOpen(true);
  };

  const handleShoppingAdd = (t: Omit<Transaction, 'id'>) => {
    openModal('expense', { amount: t.amount, description: t.description, category: t.category });
  };

  return (
    <div className={`min-h-screen ${theme.classes.bg} ${theme.classes.textMain} ${theme.classes.fontBody} transition-colors duration-700 overflow-hidden relative`}>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      
      {/* Dynamic Background Texture */}
      <div className={`fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay`}
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      
      {/* Background Gradient Effect - Theme aware */}
      <div 
          className="fixed inset-[-50px] z-0 opacity-40 transition-transform duration-100 ease-out"
          style={{ 
            transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
            background: theme.id === 'hustler' ? 'none' : `
              radial-gradient(circle at 20% 30%, currentColor 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, currentColor 0%, transparent 40%)
            `,
            color: theme.id === 'princess' ? '#fbcfe8' : theme.id === 'exam' ? '#fcd34d' : '#d4af37',
            backgroundSize: '100% 100%'
          }}
        />

        <HamburgerMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            currentTheme={theme} 
            onThemeChange={setTheme}
            mode={mode}
            onModeChange={setMode}
            onNavigate={(view) => setCurrentView(view)}
        />

        <nav className={`sticky top-0 z-30 px-6 py-4 flex justify-between items-center transition-all duration-300 ${theme.classes.nav} backdrop-blur-md`}>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className={`${theme.classes.textMuted} hover:${theme.classes.accent} transition-colors`}
                >
                    <Menu size={24} />
                </button>
                
                <div 
                    className="flex items-center gap-4 group cursor-pointer" 
                    onClick={() => setCurrentView('dashboard')}
                >
                    <div className={`w-10 h-10 ${theme.classes.accentBg} flex items-center justify-center ${theme.classes.radius} text-white ${theme.classes.fontHead} font-bold text-xl shadow-lg`}>
                        S
                    </div>
                    <div className="flex flex-col">
                        <h1 className={`text-lg ${theme.classes.fontHead} tracking-[0.2em] uppercase hidden md:block group-hover:${theme.classes.accent} transition-colors`}>Shandu Inc.</h1>
                        <span className={`text-[9px] ${theme.classes.textMuted} uppercase tracking-[0.3em]`}>{mode} Operations</span>
                    </div>
                </div>
            </div>

            <div className={`flex items-center p-1 rounded-full ${theme.classes.panelBorder} backdrop-blur-sm bg-black/5`}>
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 rounded-full ${currentView === 'dashboard' ? `${theme.classes.buttonPrimary}` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
                >
                    <LayoutDashboard size={14} />
                    <span className="hidden md:inline">Dash</span>
                </button>
                <button
                    onClick={() => setCurrentView('goals')}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 rounded-full ${currentView === 'goals' ? `${theme.classes.buttonPrimary}` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
                >
                    <Target size={14} />
                    <span className="hidden md:inline">Goals</span>
                </button>
                <button
                    onClick={() => setCurrentView('shopping')}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 rounded-full ${currentView === 'shopping' ? `${theme.classes.buttonPrimary}` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
                >
                    <ShoppingCart size={14} />
                    <span className="hidden md:inline">Market</span>
                </button>
            </div>
        </nav>

        <main className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto pb-32">
            {currentView === 'dashboard' && (
                <div className="animate-slide-up">
                    <Dashboard summary={summary} transactions={transactions} mode={mode} theme={theme} />

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => openModal('income')}
                            className={`relative overflow-hidden flex items-center justify-center gap-3 ${theme.classes.panel} border border-emerald-500/20 text-emerald-500 p-8 ${theme.classes.radius} transition-all group active:scale-[0.98] hover:border-emerald-500`}
                        >
                            <TrendingUp className="group-hover:scale-125 transition-transform duration-500" />
                            <span className="uppercase tracking-widest font-bold text-sm relative z-10">Log Income</span>
                        </button>
                        <button 
                            onClick={() => openModal('expense')}
                            className={`relative overflow-hidden flex items-center justify-center gap-3 ${theme.classes.panel} border border-red-500/20 text-red-500 p-8 ${theme.classes.radius} transition-all group active:scale-[0.98] hover:border-red-500`}
                        >
                            <TrendingDown className="group-hover:scale-125 transition-transform duration-500" />
                            <span className="uppercase tracking-widest font-bold text-sm relative z-10">Log Expense</span>
                        </button>
                    </div>

                    <div className={`${theme.classes.panel} ${theme.classes.panelBorder} border ${theme.classes.radius} p-8 shadow-2xl relative overflow-hidden group`}>
                        <h3 className={`${theme.classes.textMuted} uppercase tracking-widest text-xs mb-6 border-b ${theme.classes.panelBorder} pb-2 flex justify-between items-center ${theme.classes.fontHead}`}>
                            <span>Recent Transactions</span>
                            <span className="opacity-50 font-mono text-[10px]">{transactions.length} Records</span>
                        </h3>
                        
                        <div className="space-y-3">
                            {transactions.length === 0 ? (
                                <p className={`text-center ${theme.classes.textMuted} py-12 italic tracking-wider ${theme.classes.fontHead}`}>The ledger is empty.</p>
                            ) : (
                                transactions.slice().reverse().map((t, i) => (
                                    <div key={t.id} className={`flex items-center justify-between p-4 ${theme.classes.panel} ${theme.classes.radius} border ${theme.classes.panelBorder} hover:${theme.classes.accentBorder} transition-all duration-300 group hover:translate-x-1`} style={{animationDelay: `${i * 50}ms`}}>
                                        <div className="flex flex-col">
                                            <span className={`${theme.classes.textMain} font-medium tracking-wide group-hover:${theme.classes.accent} transition-colors`}>{t.description}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] uppercase ${theme.classes.textMuted} bg-black/5 px-2 py-0.5 rounded tracking-wider border ${theme.classes.panelBorder}`}>{t.category}</span>
                                                <span className={`text-[10px] ${theme.classes.textMuted} font-mono`}>{new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`font-mono font-bold text-lg tracking-tighter ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+' : '-'} R {t.amount.toLocaleString()}
                                            </span>
                                            <button 
                                                onClick={() => deleteTransaction(t.id)}
                                                className={`${theme.classes.textMuted} hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:rotate-90`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'shopping' && (
                <div className="animate-slide-up">
                    <Shopping onAddTransaction={handleShoppingAdd} theme={theme} />
                </div>
            )}

            {currentView === 'goals' && (
                <div className="animate-slide-up">
                    <GoalManager 
                        goals={goals} 
                        transactions={transactions} 
                        mode={mode} 
                        theme={theme} 
                        onAddGoal={addGoal}
                        onDeleteGoal={deleteGoal}
                    />
                </div>
            )}
        </main>

        {isModalOpen && (
            <TransactionModal 
                onClose={() => setIsModalOpen(false)} 
                onAdd={addTransaction} 
                defaultType={modalType}
                initialData={modalInitialData}
                availableCategories={categories}
                onAddCategory={addCategory}
                theme={theme}
            />
        )}

        <Buddy transactions={transactions} mode={mode} theme={theme} />
    </div>
  );
};

export default App;
