import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { supabase, supabaseUrl } from '../supabase';
import { resolveStorageReferences } from '../lib/storageReferences';

// Renovar las URLs del borrador sin recuperar datos remotos ni pisar ediciones.
export function useStorageRefresh<T>(value: T, setValue: Dispatch<SetStateAction<T>>) {
  const current = useRef(value);
  current.current = value;
  useEffect(() => {
    let disposed = false;
    const refresh = () => {
      const snapshot = current.current;
      void resolveStorageReferences(supabase, snapshot, supabaseUrl).then(refreshed => {
        if (!disposed) setValue(previous => previous === snapshot ? refreshed : previous);
      }).catch(() => undefined);
    };
    const resume = () => { if (document.visibilityState === 'visible') refresh(); };
    const timer = window.setInterval(refresh, 240000);
    document.addEventListener('visibilitychange', resume);
    return () => { disposed = true; window.clearInterval(timer); document.removeEventListener('visibilitychange', resume); };
  }, [setValue]);
}
