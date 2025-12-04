
export type Mode = 'student' | 'business';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  status: 'profit' | 'loss' | 'break-even';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface ShoppingItem {
  id: string;
  type: 'cheapest' | 'healthier' | 'sale' | 'general';
  name: string;
  price: number;
  store: string;
  brand: string;
  category: string;
  reason: string;
  imageUrl?: string;
  link?: string;
}

export type GoalType = 'save' | 'debt' | 'emergency' | 'buy' | 'waste_reduction' | 'profit_increase';

export interface Goal {
  id: string;
  mode: Mode;
  type: GoalType;
  title: string;
  targetAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  classes: {
    bg: string;
    textMain: string;
    textMuted: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    panel: string;
    panelBorder: string;
    fontHead: string;
    fontBody: string;
    buttonPrimary: string;
    radius: string;
    nav: string;
  };
  chartColors: string[];
  buddyType: 'orb' | 'pixel' | 'heart' | 'leaf' | 'paper';
}
