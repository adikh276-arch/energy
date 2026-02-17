import { useCallback, useEffect, useState } from 'react';
import { EnergyLog, EnergyAction } from '@/types/energy';

const LOGS_KEY = 'energyLogs';
const ACTIONS_KEY = 'energyActions';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function useEnergyStore() {
  const [logs, setLogs] = useState<EnergyLog[]>(() => load(LOGS_KEY, []));
  const [actions, setActions] = useState<EnergyAction[]>(() => load(ACTIONS_KEY, []));

  useEffect(() => { localStorage.setItem(LOGS_KEY, JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions)); }, [actions]);

  const addLog = useCallback((log: Omit<EnergyLog, 'id'>) => {
    const entry: EnergyLog = { ...log, id: crypto.randomUUID() };
    setLogs(prev => [entry, ...prev]);
  }, []);

  const removeLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const addAction = useCallback((type: string) => {
    setActions(prev => [{ type, timestamp: new Date().toISOString() }, ...prev]);
  }, []);

  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return { logs, todayLogs, actions, addLog, removeLog, addAction };
}
