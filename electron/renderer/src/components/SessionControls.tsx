interface ControlsProps {
  session: any;
  status: string;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export const SessionControls = ({ session, status, onStart, onPause, onStop }: ControlsProps) => {
  return (
    <div className="space-y-4">
      {!session ? (
        <button 
          onClick={onStart}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          START SESSION
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onPause}
            className={`py-4 rounded-2xl font-bold transition-all active:scale-95 border ${
              status === 'paused' 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
              : 'bg-amber-500/10 border-amber-500 text-amber-500'
            }`}
          >
            {status === 'paused' ? 'RESUME' : 'PAUSE'}
          </button>
          <button 
            onClick={onStop}
            className="py-4 bg-red-600/10 border border-red-600 text-red-500 rounded-2xl font-bold transition-all active:scale-95"
          >
            STOP
          </button>
        </div>
      )}
    </div>
  )
}