import { useState } from 'react';
import TopBar from '@/components/TopBar';
import LogCard from '@/components/LogCard';
import SelfCareActions from '@/components/SelfCareActions';
import TodaySnapshot from '@/components/TodaySnapshot';
import RecentEntries from '@/components/RecentEntries';
import HistoryDrawer from '@/components/HistoryDrawer';
import { useEnergyStore } from '@/hooks/useEnergyStore';

const Index = () => {
  const { logs, todayLogs, addLog, removeLog, addAction } = useEnergyStore();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full" style={{ maxWidth: 430 }}>
        <TopBar onOpenHistory={() => setHistoryOpen(true)} />

        <main className="px-4 py-4 pb-24 flex flex-col gap-3">
          <LogCard onSave={addLog} />
          <SelfCareActions onAction={addAction} />
          <TodaySnapshot logs={todayLogs} />
          <RecentEntries logs={todayLogs} onRemove={removeLog} onViewAll={() => setHistoryOpen(true)} />
        </main>

        <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} logs={logs} onRemove={removeLog} />
      </div>
    </div>
  );
};

export default Index;
