// Simple session state store (can be replaced with Zustand, Redux, etc.)
import { useState } from 'react';

export function useSessionStore() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'active' | 'paused' | 'stopped'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  return { session, setSession, status, setStatus, elapsedTime, setElapsedTime };
}
