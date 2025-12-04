
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, AlertTriangle, CheckCircle, Plus, X, ArrowRight, BrainCircuit, Activity, Calculator } from 'lucide-react';
import { Goal, GoalType, Transaction, Mode, Theme } from '../types';
import { getGoalAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface GoalManagerProps {
  goals: Goal[];
  transactions: Transaction[];
  mode: Mode;
  theme: Theme;
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalManager: React.FC<GoalManagerProps> = ({ goals, transactions, mode, theme, onAddGoal, onDeleteGoal }) => {
  const [viewMode, setViewMode] = useState<'freestyle' | 'structured' | null>(null);
  const [selectedGoalAdvice, setSelectedGoalAdvice] = useState<{[key: string]: string}>({});
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);

  // Form State
  const [goalType, setGoalType] = useState<GoalType>('save');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [category, setCategory] = useState('General');

  // Math: Financial Forecasting
  // Calculate average monthly stats based on transaction history duration
  const dates = transactions.map(t => new Date(t.date).getTime());
  const minDate = dates.length ? Math.min(...dates) : Date.now();
  const maxDate = dates.length ? Math.max(...dates) : Date.now();
  const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const monthsDiff = Math.max(1, daysDiff / 30);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  const avgMonthlyIncome = totalIncome / monthsDiff;
  const avgMonthlyExpense = totalExpense / monthsDiff;
  const currentBurnRate = avgMonthlyExpense;
  const projectedSurplus = avgMonthlyIncome - avgMonthlyExpense;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadline) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      mode,
      type: goalType,
      title,
      targetAmount: parseFloat(targetAmount),
      deadline,
      priority,
      category,
      createdAt: new Date().toISOString()
    };

    onAddGoal(newGoal);
    setViewMode('freestyle'); // Switch to tracking view after add
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setDeadline('');
    setPriority('medium');
    setCategory('General');
  };

  const getAdvice = async (goal: Goal) => {
    setLoadingAdvice(goal.id);
    const advice = await getGoalAdvice(goal, transactions, mode);
    setSelectedGoalAdvice(prev => ({...prev, [goal.id]: advice}));
    setLoadingAdvice(null);
  };

  const calculateFeasibility = (goal: Goal) => {
    const today = new Date();
    const due = new Date(goal.deadline);
    const monthsLeft = Math.max(0.5, (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)); // months
    
    // Required monthly surplus to hit goal
    const requiredPerMonth = goal.targetAmount / monthsLeft;
    
    // Status
    const isAchievable = projectedSurplus >= requiredPerMonth;
    const gap = requiredPerMonth - projectedSurplus;

    return { monthsLeft, requiredPerMonth, monthlySurplus: projectedSurplus, isAchievable, gap };
  };

  // Initial landing selection
  if (viewMode === null && goals.length === 0) {
     // Default to choice screen if no goals exist
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header & Mode Switch */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b ${theme.classes.panelBorder} pb-8`}>
        <div>
          <h2 className={`text-3xl ${theme.classes.fontHead} ${theme.classes.accent} uppercase tracking-widest drop-shadow-md`}>
            {mode === 'student' ? 'Student Goals' : 'Business Objectives'}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${theme.classes.accentBg} animate-pulse`}></span>
            <p className={`${theme.classes.textMuted} text-[10px] tracking-[0.2em] uppercase`}>
              Forecast &middot; Execute &middot; Achieve
            </p>
          </div>
        </div>
        
        <div className="flex bg-black/5 p-1 rounded-lg border border-white/5">
            <button
                onClick={() => setViewMode('freestyle')}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'freestyle' ? `${theme.classes.accentBg} text-black font-bold` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
            >
                <Activity size={14} /> Freestyle
            </button>
            <button
                onClick={() => setViewMode('structured')}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'structured' ? `${theme.classes.accentBg} text-black font-bold` : `${theme.classes.textMuted} hover:${theme.classes.textMain}`}`}
            >
                <Calculator size={14} /> Structured
            </button>
        </div>
      </div>

      {/* Landing / Choice State if no view selected but goals exist */}
      {viewMode === null && goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setViewMode('freestyle')} className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-8 ${theme.classes.radius} hover:${theme.classes.accentBorder} transition-all group text-left`}>
                  <Activity size={32} className={`mb-4 ${theme.classes.accent}`} />
                  <h3 className={`${theme.classes.fontHead} text-xl mb-2`}>Freestyle Tracking</h3>
                  <p className={`${theme.classes.textMuted} text-xs`}>Monitor your existing goals and financial pulse loosely.</p>
              </button>
              <button onClick={() => setViewMode('structured')} className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-8 ${theme.classes.radius} hover:${theme.classes.accentBorder} transition-all group text-left`}>
                  <Calculator size={32} className={`mb-4 ${theme.classes.accent}`} />
                  <h3 className={`${theme.classes.fontHead} text-xl mb-2`}>Structured Setting</h3>
                  <p className={`${theme.classes.textMuted} text-xs`}>Use the wizard to define strict targets and get feasibility forecasts.</p>
              </button>
          </div>
      )}

      {/* Structured Mode: The Wizard */}
      {(viewMode === 'structured' || (viewMode === null && goals.length === 0)) && (
        <div className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-8 ${theme.classes.radius} shadow-2xl animate-fade-in`}>
          <div className="mb-6 flex items-center justify-between">
             <h3 className={`${theme.classes.textMain} ${theme.classes.fontHead} text-lg uppercase tracking-wider`}>Structured Goal Setting</h3>
             {goals.length > 0 && <button onClick={() => setViewMode('freestyle')} className="text-xs underline opacity-50">Back to List</button>}
          </div>

          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <label className={`block text-[10px] uppercase tracking-widest ${theme.classes.textMuted}`}>What do you want to achieve?</label>
                  <select 
                    value={goalType} 
                    onChange={(e) => setGoalType(e.target.value as GoalType)}
                    className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-4 ${theme.classes.radius} ${theme.classes.textMain} focus:outline-none focus:border-current`}
                  >
                    {mode === 'student' ? (
                      <>
                        <option value="save">Save Money (Target Amount)</option>
                        <option value="debt">Pay Off Debt</option>
                        <option value="buy">Buy Something (Laptop, Car, etc.)</option>
                        <option value="waste_reduction">Reduce Wasteful Spending</option>
                        <option value="emergency">Build Emergency Fund</option>
                      </>
                    ) : (
                      <>
                        <option value="profit_increase">Increase Monthly Profit</option>
                        <option value="waste_reduction">Reduce Operating Costs</option>
                        <option value="buy">Acquire Asset / Equipment</option>
                        <option value="emergency">Build Cash Reserves</option>
                        <option value="debt">Clear Business Debt</option>
                      </>
                    )}
                  </select>

                  <div>
                    <label className={`block text-[10px] uppercase tracking-widest ${theme.classes.textMuted} mb-2`}>Goal Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={mode === 'student' ? "e.g. Matric Dance Fund" : "e.g. Q4 Expansion Capital"}
                      className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-4 ${theme.classes.radius} ${theme.classes.textMain} focus:outline-none focus:border-current`}
                    />
                  </div>

                  <div>
                     <label className={`block text-[10px] uppercase tracking-widest ${theme.classes.textMuted} mb-2`}>Priority Level</label>
                     <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map(p => (
                            <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 py-3 text-xs uppercase tracking-wider border ${theme.classes.radius} transition-all ${priority === p ? `${theme.classes.accentBg} text-black border-transparent font-bold` : `bg-transparent ${theme.classes.panelBorder} ${theme.classes.textMuted}`}`}
                            >
                            {p}
                            </button>
                        ))}
                     </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-widest ${theme.classes.textMuted} mb-2`}>Target Amount (ZAR)</label>
                    <div className="relative">
                      <span className={`absolute left-4 top-4 ${theme.classes.textMuted}`}>R</span>
                      <input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-4 pl-10 ${theme.classes.radius} ${theme.classes.textMain} font-mono text-lg`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase tracking-widest ${theme.classes.textMuted} mb-2`}>Target Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-4 ${theme.classes.radius} ${theme.classes.textMain} font-sans`}
                    />
                  </div>
                  
                  <div className={`p-4 bg-black/5 border ${theme.classes.panelBorder} ${theme.classes.radius} mt-4`}>
                      <h4 className={`text-[10px] uppercase tracking-widest ${theme.classes.textMuted} mb-3 flex items-center gap-2`}>
                          <Calculator size={12} /> Auto-Forecast
                      </h4>
                      <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                              <span className="opacity-50">Avg. Monthly Income:</span>
                              <span className="text-emerald-500">R{avgMonthlyIncome.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="opacity-50">Current Burn Rate:</span>
                              <span className="text-red-500">R{currentBurnRate.toFixed(2)}/mo</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-white/5">
                              <span className="opacity-50">Est. Monthly Surplus:</span>
                              <span className={projectedSurplus >= 0 ? "text-emerald-500" : "text-red-500"}>
                                  R{projectedSurplus.toFixed(2)}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            <button type="submit" className={`w-full ${theme.classes.buttonPrimary} py-4 ${theme.classes.radius} font-bold uppercase tracking-widest mt-8 shadow-lg hover:translate-y-[-2px] transition-transform`}>
              Initialize Objective
            </button>
          </form>
        </div>
      )}

      {/* Freestyle / Tracking Mode */}
      {viewMode === 'freestyle' && (
        <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className={`${theme.classes.textMuted} uppercase tracking-widest text-xs`}>Active Goals</h3>
                <button 
                    onClick={() => setViewMode('structured')}
                    className={`flex items-center gap-2 text-xs ${theme.classes.accent} hover:underline`}
                >
                    <Plus size={12} /> Add New Goal
                </button>
            </div>

            {goals.filter(g => g.mode === mode).length === 0 ? (
            <div className={`p-12 text-center border-2 border-dashed ${theme.classes.panelBorder} ${theme.classes.radius} opacity-50`}>
                <Target size={48} className={`mx-auto mb-4 ${theme.classes.textMuted}`} />
                <p className={`${theme.classes.fontHead} ${theme.classes.textMain}`}>No active objectives initialized.</p>
                <button onClick={() => setViewMode('structured')} className="mt-4 text-xs underline">Start structured setup</button>
            </div>
            ) : (
            goals.filter(g => g.mode === mode).map((goal) => {
                const { monthsLeft, requiredPerMonth, monthlySurplus, isAchievable, gap } = calculateFeasibility(goal);
                
                return (
                <div key={goal.id} className={`${theme.classes.panel} border ${theme.classes.panelBorder} ${theme.classes.radius} overflow-hidden shadow-lg relative group`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                        goal.priority === 'high' ? 'bg-red-500' : goal.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    
                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                        {/* Main Info */}
                        <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] uppercase tracking-widest ${theme.classes.textMuted} border ${theme.classes.panelBorder} px-2 py-0.5 rounded mb-2 inline-block`}>
                            {goal.type.replace('_', ' ')}
                            </span>
                            <button onClick={() => onDeleteGoal(goal.id)} className={`${theme.classes.textMuted} hover:text-red-500`}>
                            <X size={16} />
                            </button>
                        </div>
                        <h3 className={`text-2xl ${theme.classes.fontHead} ${theme.classes.textMain} mb-1`}>{goal.title}</h3>
                        <p className={`text-xs ${theme.classes.textMuted} font-mono mb-6`}>Target: R{goal.targetAmount.toLocaleString()} by {new Date(goal.deadline).toLocaleDateString()}</p>

                        {/* Forecast Card */}
                        <div className={`p-4 bg-black/5 rounded border ${theme.classes.panelBorder}`}>
                            <div className="flex items-center gap-3 mb-3">
                                {isAchievable ? <CheckCircle className="text-emerald-500" size={18}/> : <AlertTriangle className="text-red-500" size={18}/>}
                                <span className={`text-sm font-bold uppercase tracking-wider ${isAchievable ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isAchievable ? 'Forecast: Achievable' : 'Forecast: Unlikely'}
                                </span>
                            </div>
                            <p className={`${theme.classes.textMuted} text-xs leading-relaxed mb-3`}>
                            Time Remaining: <strong className={theme.classes.textMain}>{monthsLeft.toFixed(1)} months</strong>
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-white/5 pt-3">
                                <div>
                                    <p className="opacity-50 mb-1">Required Saving/Mo</p>
                                    <p className={theme.classes.textMain}>R{requiredPerMonth.toFixed(0)}</p>
                                </div>
                                <div>
                                    <p className="opacity-50 mb-1">Your Avg Surplus</p>
                                    <p className={projectedSurplus >= requiredPerMonth ? 'text-emerald-500' : 'text-red-500'}>R{projectedSurplus.toFixed(0)}</p>
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* AI Analysis Section */}
                        <div className="lg:w-80 flex flex-col gap-4 border-l border-white/5 lg:pl-8">
                            <div className="flex-1">
                            {!selectedGoalAdvice[goal.id] ? (
                                <button 
                                onClick={() => getAdvice(goal)}
                                disabled={loadingAdvice === goal.id}
                                className={`w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-3 border ${theme.classes.panelBorder} border-dashed hover:${theme.classes.accentBorder} transition-all bg-black/5 ${theme.classes.radius} group/btn`}
                                >
                                {loadingAdvice === goal.id ? <BrainCircuit className="animate-spin text-emerald-500" /> : <BrainCircuit className={`${theme.classes.textMuted} group-hover/btn:${theme.classes.accent}`} />}
                                <span className={`text-xs uppercase tracking-widest ${theme.classes.textMuted} group-hover/btn:${theme.classes.textMain} text-center px-4`}>
                                    Run Feasibility Simulation
                                </span>
                                </button>
                            ) : (
                                <div className={`p-4 ${theme.classes.accentBg} bg-opacity-10 border ${theme.classes.accentBorder} ${theme.classes.radius} text-xs ${theme.classes.textMain} overflow-y-auto max-h-[250px] relative`}>
                                <div className="sticky top-0 bg-transparent backdrop-blur-md pb-2 mb-2 border-b border-white/10 flex justify-between items-center">
                                    <p className="font-bold uppercase tracking-wider flex items-center gap-2 text-[10px]">
                                        <BrainCircuit size={12} /> Buddy's Strategy
                                    </p>
                                    <button onClick={() => setSelectedGoalAdvice(prev => ({...prev, [goal.id]: ''}))} className="hover:text-red-500"><X size={12}/></button>
                                </div>
                                <ReactMarkdown>{selectedGoalAdvice[goal.id]}</ReactMarkdown>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
                );
            })
            )}
        </div>
      )}
    </div>
  );
};

export default GoalManager;
