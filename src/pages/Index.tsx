import { useState, useCallback, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import LogCard from '@/components/LogCard';
import SelfCareActions from '@/components/SelfCareActions';
import TodaySnapshot from '@/components/TodaySnapshot';
import RecentEntries from '@/components/RecentEntries';
import HistoryDrawer from '@/components/HistoryDrawer';
import { EnergyLog } from '@/types/energy';
import { getUserId } from '@/lib/auth';
import { getEnergyLogs, deleteEnergyLog } from '@/lib/db';

const Index = () => {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const logsData = await getEnergyLogs(userId);
      setLogs(logsData || []);
    } catch (error) {
      console.error("Failed to fetch energy logs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = useCallback(async (id: string) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await deleteEnergyLog(userId, id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete energy log:", error);
    }
  }, [fetchData]);

  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full" style={{ maxWidth: 430 }}>
        <TopBar onOpenHistory={() => setHistoryOpen(true)} />

        <main className="px-4 py-4 pb-24 flex flex-col gap-3">
          <LogCard onSave={fetchData} />
          <SelfCareActions onAction={fetchData} />
          <TodaySnapshot logs={todayLogs} />
          <RecentEntries logs={todayLogs} onRemove={handleRemove} onViewAll={() => setHistoryOpen(true)} />
        </main>

        <HistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          logs={logs}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
};

export default Index;
