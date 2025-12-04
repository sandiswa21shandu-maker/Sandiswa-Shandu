
import React from 'react';
import { X, Globe, Settings, CreditCard, Palette, UserCircle, Briefcase, GraduationCap, Target, ArrowRight } from 'lucide-react';
import { Theme, Mode } from '../types';
import { THEMES } from '../themes';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onNavigate: (view: 'dashboard' | 'shopping' | 'goals') => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeChange,
  mode,
  onModeChange,
  onNavigate
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 z-[100] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${currentTheme.classes.panel} border-r ${currentTheme.classes.panelBorder} overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`${currentTheme.classes.fontHead} ${currentTheme.classes.textMain} text-xl uppercase tracking-widest`}>Menu</h2>
            <button onClick={onClose} className={`${currentTheme.classes.textMuted} hover:${currentTheme.classes.accent}`}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
             {/* Mode Selection */}
             <section>
              <h3 className={`text-xs uppercase tracking-widest ${currentTheme.classes.textMuted} mb-4 flex items-center gap-2`}>
                <Briefcase size={12} /> Operations Mode
              </h3>
              <div className="flex bg-black/5 p-1 rounded-lg">
                <button
                  onClick={() => onModeChange('student')}
                  className={`flex-1 py-2 px-3 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'student' ? currentTheme.classes.buttonPrimary : currentTheme.classes.textMuted}`}
                >
                  <GraduationCap size={14} /> Student
                </button>
                <button
                  onClick={() => onModeChange('business')}
                  className={`flex-1 py-2 px-3 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'business' ? currentTheme.classes.buttonPrimary : currentTheme.classes.textMuted}`}
                >
                  <Briefcase size={14} /> Business
                </button>
              </div>
            </section>

             {/* Goal Mode Link */}
             <section>
              <h3 className={`text-xs uppercase tracking-widest ${currentTheme.classes.textMuted} mb-4 flex items-center gap-2`}>
                <Target size={12} /> Objectives
              </h3>
              <button
                 onClick={() => { onNavigate('goals'); onClose(); }}
                 className={`w-full py-4 px-4 ${currentTheme.classes.radius} border ${currentTheme.classes.panelBorder} flex items-center justify-between group hover:${currentTheme.classes.accentBorder} bg-black/5 transition-all`}
              >
                 <div className="flex items-center gap-3">
                    <Target size={18} className={`${currentTheme.classes.textMuted} group-hover:${currentTheme.classes.accent}`} />
                    <div className="text-left">
                        <span className={`block ${currentTheme.classes.textMain} group-hover:${currentTheme.classes.accent} font-bold text-sm`}>Goal Mode</span>
                        <span className={`block text-[9px] ${currentTheme.classes.textMuted} uppercase tracking-wider`}>Freestyle or Structured</span>
                    </div>
                 </div>
                 <ArrowRight size={14} className={`${currentTheme.classes.textMuted} group-hover:${currentTheme.classes.accent}`} />
              </button>
            </section>

            {/* Themes */}
            <section>
              <h3 className={`text-xs uppercase tracking-widest ${currentTheme.classes.textMuted} mb-4 flex items-center gap-2`}>
                <Palette size={12} /> Theme Selection
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t)}
                    className={`w-full p-3 rounded-md border flex items-center justify-between transition-all group ${
                      currentTheme.id === t.id 
                        ? `${t.classes.accentBorder} bg-black/5` 
                        : 'border-transparent hover:bg-black/5'
                    }`}
                  >
                    <span className={`text-sm ${t.classes.fontHead} ${t.id === currentTheme.id ? t.classes.accent : t.classes.textMain}`}>
                      {t.name}
                    </span>
                    <div className="flex gap-1">
                       <div className={`w-3 h-3 rounded-full ${t.classes.accentBg}`}></div>
                       <div className={`w-3 h-3 rounded-full ${t.classes.bg} border border-stone-200`}></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* General Settings (Mock) */}
            <section className="space-y-4 pt-4 border-t border-black/5">
               <button className={`w-full flex items-center gap-3 ${currentTheme.classes.textMain} hover:${currentTheme.classes.accent} transition-colors`}>
                  <Globe size={18} />
                  <span className={`${currentTheme.classes.fontBody} text-sm`}>Language</span>
               </button>
               <button className={`w-full flex items-center gap-3 ${currentTheme.classes.textMain} hover:${currentTheme.classes.accent} transition-colors`}>
                  <UserCircle size={18} />
                  <span className={`${currentTheme.classes.fontBody} text-sm`}>Account</span>
               </button>
               <button className={`w-full flex items-center gap-3 ${currentTheme.classes.textMain} hover:${currentTheme.classes.accent} transition-colors`}>
                  <Settings size={18} />
                  <span className={`${currentTheme.classes.fontBody} text-sm`}>Settings</span>
               </button>
            </section>

            <div className={`pt-8 text-center ${currentTheme.classes.textMuted}`}>
               <p className="text-[10px] uppercase tracking-[0.2em]">Shandu Incorporated</p>
               <p className="text-[9px] opacity-50">v2.6.0 &middot; Durban</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
