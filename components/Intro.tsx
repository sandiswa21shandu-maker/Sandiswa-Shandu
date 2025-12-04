import React, { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Start, 1: Text Fade In, 2: Text Fade Out, 3: Curtain Open

  useEffect(() => {
    // Sequence
    setTimeout(() => setStage(1), 500);
    setTimeout(() => setStage(2), 3500);
    setTimeout(() => setStage(3), 4500);
    setTimeout(onComplete, 5500); 
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${stage >= 3 ? 'pointer-events-none' : ''}`}>
      
      {/* Cinematic Text */}
      <div className={`text-center z-20 transition-all duration-1000 transform ${stage === 1 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}>
        <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-700 tracking-widest uppercase mb-6 drop-shadow-lg">
          Shandu Inc.
        </h1>
        <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-amber-800/50"></div>
            <p className="text-amber-500/50 text-xs tracking-[0.8em] uppercase font-light">
            Intelligence &middot; Future
            </p>
            <div className="h-[1px] w-12 bg-amber-800/50"></div>
        </div>
      </div>

      {/* Curtain Effect */}
      <div 
        className={`absolute top-0 left-0 w-full bg-black z-10 transition-all duration-1000 ease-in-out`}
        style={{ height: stage === 3 ? '0%' : '50%' }}
      ></div>
      <div 
        className={`absolute bottom-0 left-0 w-full bg-black z-10 transition-all duration-1000 ease-in-out`}
        style={{ height: stage === 3 ? '0%' : '50%' }}
      ></div>
    </div>
  );
};

export default Intro;