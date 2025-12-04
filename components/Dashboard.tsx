import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, FinancialSummary, Theme } from '../types';

interface DashboardProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  mode: 'student' | 'business';
  theme: Theme;
}

const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      setCount(end * easeOutQuart(percentage));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const Dashboard: React.FC<DashboardProps> = ({ summary, transactions, mode, theme }) => {
  const animatedBalance = useCountUp(summary.balance);
  const animatedIncome = useCountUp(summary.totalIncome);
  const animatedExpense = useCountUp(summary.totalExpense);

  const data = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t, index, array) => {
      const prevBalance = index > 0 ? array.slice(0, index).reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0) : 0;
      const currentBalance = t.type === 'income' ? prevBalance + t.amount : prevBalance - t.amount;
      return {
        name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: currentBalance,
        amt: t.amount,
      };
    });

  const categoryData = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const isProfitable = summary.balance >= 0;
  const colors = theme.chartColors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Summary Card */}
      <div className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-8 ${theme.classes.radius} shadow-2xl col-span-1 lg:col-span-1 relative group overflow-hidden`}>
        <div className={`absolute inset-0 border border-transparent hover:${theme.classes.accentBorder} transition-all duration-500 pointer-events-none ${theme.classes.radius}`}></div>
        
        <h2 className={`${theme.classes.accent} ${theme.classes.fontHead} text-lg mb-6 tracking-wider uppercase border-b ${theme.classes.panelBorder} pb-4 flex justify-between items-center`}>
          {mode} Ledger
          <div className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
        </h2>
        
        <div className="space-y-8">
          <div>
            <p className={`${theme.classes.textMuted} text-[10px] uppercase tracking-[0.25em] mb-1`}>Net Position</p>
            <p className={`text-4xl lg:text-5xl ${theme.classes.fontHead} font-bold tracking-tight transition-colors duration-500 ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
              R {Math.round(animatedBalance).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 relative">
            <div className={`absolute left-1/2 top-0 bottom-0 w-[1px] ${theme.classes.panelBorder}`}></div>
            <div>
              <p className={`${theme.classes.textMuted} text-[9px] uppercase tracking-widest mb-1`}>Total Income</p>
              <p className={`${theme.classes.textMain} text-lg font-mono`}>R {Math.round(animatedIncome).toLocaleString()}</p>
            </div>
            <div className="pl-4">
              <p className={`${theme.classes.textMuted} text-[9px] uppercase tracking-widest mb-1`}>Total Expenses</p>
              <p className={`${theme.classes.textMain} text-lg font-mono`}>R {Math.round(animatedExpense).toLocaleString()}</p>
            </div>
          </div>

          <div className={`py-2 px-3 text-center border ${theme.classes.radius} relative overflow-hidden ${isProfitable ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
            <span className="relative uppercase text-[10px] font-bold tracking-[0.3em]">
              Forecast: {summary.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-6 ${theme.classes.radius} shadow-2xl col-span-1 lg:col-span-2 min-h-[350px] flex flex-col relative group`}>
         <div className="flex justify-between items-center mb-6">
            <h2 className={`${theme.classes.accent} ${theme.classes.fontHead} text-lg tracking-wider uppercase`}>
              Financial Trajectory
            </h2>
            <div className="flex gap-2">
                <span className={`w-2 h-2 rounded-full ${theme.classes.accentBg} opacity-20`}></span>
                <span className={`w-2 h-2 rounded-full ${theme.classes.accentBg} opacity-40`}></span>
                <span className={`w-2 h-2 rounded-full ${theme.classes.accentBg} opacity-80`}></span>
            </div>
         </div>
        
        <div className="flex-1 w-full min-h-[250px] relative z-10">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#78716c" 
                    tick={{fontSize: 10, fontFamily: 'monospace', fill: '#78716c'}} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#78716c" 
                    tick={{fontSize: 10, fontFamily: 'monospace', fill: '#78716c'}} 
                    tickFormatter={(value) => `R${value}`}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: colors[0], color: '#f5f5f5', borderRadius: '4px' }}
                  itemStyle={{ color: colors[0], fontFamily: 'monospace' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={colors[0]} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center ${theme.classes.textMuted}`}>
              <div className="w-full h-[1px] bg-current opacity-20 w-1/2 mb-4"></div>
              <p className={`${theme.classes.fontHead} italic tracking-wider`}>Record transactions to visualize trajectory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={`${theme.classes.panel} border ${theme.classes.panelBorder} p-6 ${theme.classes.radius} shadow-2xl col-span-1 min-h-[300px] flex flex-col`}>
         <h2 className={`${theme.classes.accent} ${theme.classes.fontHead} text-lg tracking-wider uppercase mb-6`}>
            Spending Matrix
         </h2>
         <div className="flex-1 flex items-center justify-center relative">
            {categoryData.length > 0 ? (
               <div className="w-full h-full flex flex-col md:flex-row items-center gap-6">
                   <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', color: '#f5f5f5' }}
                                    itemStyle={{ color: '#ccc', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={`text-xs ${theme.classes.textMuted} font-mono`}>OPEX</span>
                        </div>
                   </div>
                   <div className="flex-1 space-y-2 w-full">
                       {categoryData.slice(0, 5).map((entry, index) => (
                           <div key={index} className={`flex justify-between items-center text-xs border-b ${theme.classes.panelBorder} pb-1`}>
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                   <span className={`${theme.classes.textMuted} uppercase tracking-wide`}>{entry.name}</span>
                               </div>
                               <span className={`${theme.classes.textMain} font-mono`}>R{entry.value.toLocaleString()}</span>
                           </div>
                       ))}
                   </div>
               </div>
            ) : (
                <p className={`${theme.classes.textMuted} ${theme.classes.fontHead} italic text-sm`}>No expense data available.</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;