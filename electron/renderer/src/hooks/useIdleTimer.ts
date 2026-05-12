// Custom hook for idle timer logic
import { useEffect, useRef } from 'react';
import { IDLE_THRESHOLD_SECONDS } from '../constants/app';

export function useIdleTimer(onIdle: () => void, onActive: () => void) {
  const idleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      if (idleRef.current) clearTimeout(idleRef.current);
      onActive();
      idleRef.current = setTimeout(() => {
        onIdle();
      }, IDLE_THRESHOLD_SECONDS * 1000);
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [onIdle, onActive]);
}
