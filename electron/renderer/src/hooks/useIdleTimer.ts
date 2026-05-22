// Custom hook for idle timer logic
import { useEffect, useRef } from 'react';
import { IDLE_THRESHOLD_SECONDS } from '../constants/app';

export function useIdleTimer(onIdle: () => void, onActive: () => void) {
  // NodeJS.Timeout ki jagah ReturnType ka use karein
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      if (idleRef.current) clearTimeout(idleRef.current);
      
      onActive();
      
      idleRef.current = setTimeout(() => {
        onIdle();
      }, IDLE_THRESHOLD_SECONDS * 1000); // Yahan IDLE_THRESHOLD_SECONDS ko 60 set karein (1 min ke liye)
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    // Pehli baar hook run hone par timer start karne ke liye
    idleRef.current = setTimeout(() => {
      onIdle();
    }, IDLE_THRESHOLD_SECONDS * 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [onIdle, onActive]);
}