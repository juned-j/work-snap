import React from 'react';

interface ControlsProps {
  session: any;
  status: string;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void; // Provided in props but not rendered as per request
}

export const SessionControls = ({ session, status, onStart, onPause }: ControlsProps) => {
  const isInactive = !session || status === 'stopped';

  return (
    <div className="w-full transition-all duration-300">
      {isInactive ? (
        /* START SESSION: Modern indigo gradient */
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-indigo-600 py-5 text-lg font-bold tracking-wide text-white shadow-md transition-all hover:bg-indigo-500 active:scale-[0.98]"
        >
          {status === 'stopped' ? 'START NEW SESSION' : 'START SESSION'}
        </button>
      ) : (
        /* SINGLE TOGGLE: Directly referencing the "PAUSE" button style in image_fe9a38.png */
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onPause}
            className={`w-full rounded-2xl border-2 py-5 text-xl font-bold transition-all active:scale-95 sm:max-w-md ${
              status === 'paused'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'border-[#FFE7CC] bg-[#FFF9F2] text-[#D97706] hover:bg-[#FFF3E5]'
            }`}
          >
            <span className="mr-2 inline-block transition-transform">
              {status === 'paused' ? '▶' : '||'}
            </span>
            {status === 'paused' ? 'RESUME' : 'PAUSE'}
          </button>

          {/* Sub-label matching the 'ENGINE STATUS' text in the screenshot */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'paused' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
            Engine Status: 
            <span className={status === 'paused' ? 'text-amber-600' : 'text-emerald-600'}>
              {status === 'paused' ? ' Paused' : ' Active'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};