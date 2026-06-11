import React from 'react';

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  // Mobile-first structure. On large screens, we constrain the width and add a subtle border
  // to feel like a mobile device frame, while on mobile it's completely full screen.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black sm:bg-zinc-950 sm:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-950 sm:h-[850px] sm:max-h-full sm:w-[393px] sm:rounded-[3rem] sm:border-[8px] sm:border-zinc-800 sm:shadow-2xl sm:shadow-cyan-500/10">
        {children}
      </div>
    </div>
  );
}
