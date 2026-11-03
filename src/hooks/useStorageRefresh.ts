import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { supabase, supabaseUrl } from '../supabase';
import { resolveStorageReferences } from '../lib/storageReferences';

// Renovar las URLs del borrador sin recuperar datos remotos ni pisar ediciones.
export function useStorageRefresh<T>(value: T, setValue: Dispatch<SetStateAction<T>>) {
  const current = useRef(value);
  current.current = value;
  useEffect(() => {
    let disposed = false;
    const timer = window.setInterval(() => {
      const snapshot = current.current;
      void resolveStorageReferences(supabase, snapshot, supabaseUrl).then(refreshed => {
        if (!disposed) setValue(previous => previous === snapshot ? refreshed : previous);
      }).catch(() => undefined);
    }, 240000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, [setValue]);
}
