import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Tag } from 'lucide-react';
import { Transaction, Theme } from '../types';

interface TransactionModalProps {
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  defaultType?: 'income' | 'expense';
  initialData?: {
    amount?: number;
    description?: string;
    category?: string;
  };
  availableCategories: string[];
  onAddCategory: (category: string) => void;
  theme: Theme;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  onClose, 
  onAdd, 
  defaultType = 'expense', 
  initialData,
  availableCategories,
  onAddCategory,
  theme
}) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'General');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount.toString());
      if (initialData.description) setDescription(initialData.description);
      if (initialData.category) {
        if (!availableCategories.includes(initialData.category)) {
           setCategory(initialData.category);
           if(!availableCategories.includes(initialData.category)) {
               onAddCategory(initialData.category);
           }
        } else {
            setCategory(initialData.category);
        }
      }
    }
  }, [initialData, availableCategories, onAddCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    let finalCategory = category;
    if (isCustomCategory && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      onAddCategory(finalCategory);
    }

    onAdd({
      type,
      amount: parseFloat(amount),
      description,
      category: finalCategory,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`${theme.classes.bg} border ${theme.classes.panelBorder} w-full max-w-md ${theme.classes.radius} shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Decorative Top Bar */}
        <div className={`h-1 w-full bg-gradient-to-r from-transparent via-${theme.classes.accentBg} to-transparent shrink-0 opacity-50`}></div>
        
        <button onClick={onClose} className={`absolute top-4 right-4 ${theme.classes.textMuted} hover:${theme.classes.textMain} z-10`}>
          <X size={20} />
        </button>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <h2 className={`text-2xl ${theme.classes.fontHead} text-center mb-6 ${theme.classes.textMain} uppercase tracking-widest`}>
            {initialData ? 'Confirm Purchase' : 'Log Transaction'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-4 justify-center mb-6">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${theme.classes.radius} border transition-all ${type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : `${theme.classes.bg} ${theme.classes.panelBorder} ${theme.classes.textMuted}`}`}
              >
                <Plus size={16} /> Income
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${theme.classes.radius} border transition-all ${type === 'expense' ? 'bg-red-500/10 border-red-500 text-red-500' : `${theme.classes.bg} ${theme.classes.panelBorder} ${theme.classes.textMuted}`}`}
              >
                <Minus size={16} /> Expense
              </button>
            </div>

            <div>
              <label className={`block text-xs uppercase tracking-wider ${theme.classes.textMuted} mb-1`}>Amount (ZAR)</label>
              <div className="relative">
                <span className={`absolute left-3 top-3 ${theme.classes.textMuted}`}>R</span>
                <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-3 pl-8 ${theme.classes.radius} ${theme.classes.accent} font-mono text-lg focus:outline-none focus:border-current placeholder-stone-700`}
                    placeholder="0.00"
                    autoFocus={!initialData}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs uppercase tracking-wider ${theme.classes.textMuted} mb-1`}>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-3 ${theme.classes.radius} ${theme.classes.textMain} focus:outline-none focus:border-current`}
                placeholder="e.g. Weekly Groceries"
              />
            </div>

            <div>
              <label className={`block text-xs uppercase tracking-wider ${theme.classes.textMuted} mb-1`}>Category</label>
              {!isCustomCategory ? (
                <div className="flex gap-2">
                    <select 
                        value={category} 
                        onChange={(e) => {
                            if (e.target.value === 'NEW_CATEGORY') {
                                setIsCustomCategory(true);
                            } else {
                                setCategory(e.target.value);
                            }
                        }}
                        className={`w-full bg-black/5 border ${theme.classes.panelBorder} p-3 ${theme.classes.radius} ${theme.classes.textMain} focus:outline-none focus:border-current`}
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="NEW_CATEGORY">+ Create New Category</option>
                    </select>
                </div>
              ) : (
                <div className="flex gap-2 animate-fade-in">
                    <input 
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Name new category..."
                        className={`w-full bg-black/5 border ${theme.classes.accentBorder} p-3 ${theme.classes.radius} ${theme.classes.accent} focus:outline-none`}
                        autoFocus
                    />
                    <button 
                        type="button" 
                        onClick={() => setIsCustomCategory(false)}
                        className={`px-3 bg-black/10 ${theme.classes.textMuted} hover:${theme.classes.textMain} ${theme.classes.radius}`}
                    >
                        <X size={16} />
                    </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full ${theme.classes.buttonPrimary} font-bold py-3 px-4 ${theme.classes.radius} transition-colors uppercase tracking-widest mt-4 shadow-lg flex items-center justify-center gap-2`}
            >
              <Tag size={16} /> {initialData ? 'Confirm & Log' : 'Record Entry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;