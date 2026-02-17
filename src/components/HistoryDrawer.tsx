import { EnergyLog, LEVEL_COLORS } from '@/types/energy';
import { X, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  logs: EnergyLog[];
  onRemove: (id: string) => Promise<void>;
}

const HistoryDrawer = ({ open, onClose, logs, onRemove }: HistoryDrawerProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 7-day chart data
  const chartData = useMemo(() => {
    const days: { label: string; avg: number; hasStrongUrge: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === dayStr);
      const avg = dayLogs.length ? dayLogs.reduce((s, l) => s + l.level, 0) / dayLogs.length : 0;
      const hasStrongUrge = dayLogs.some(l => l.tobaccoUrge === 'Strong');
      days.push({
        label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        avg,
        hasStrongUrge,
      });
    }
    return days;
  }, [logs]);

  // Urge correlation
  const lowEnergyLogs = logs.filter(l => l.level <= 2);
  const lowEnergyWithUrge = lowEnergyLogs.filter(l => l.tobaccoUrge === 'Strong');
  const urgePct = lowEnergyLogs.length > 0 ? Math.round((lowEnergyWithUrge.length / lowEnergyLogs.length) * 100) : 0;

  // Group logs by date
  const grouped = useMemo(() => {
    const filtered = search
      ? logs.filter(l =>
        l.notes.toLowerCase().includes(search.toLowerCase()) ||
        l.factors.some(f => f.toLowerCase().includes(search.toLowerCase())) ||
        l.energyType.toLowerCase().includes(search.toLowerCase()))
      : logs;

    const map = new Map<string, EnergyLog[]>();
    filtered.forEach(l => {
      const key = new Date(l.timestamp).toLocaleDateString('en-GB');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    });
    return map;
  }, [logs, search]);

  const exportData = () => {
    const csv = ['Timestamp,Level,Type,Factors,Urge,Activity,Meals,Water,Notes',
      ...logs.map(l =>
        `${l.timestamp},${l.level},${l.energyType},"${l.factors.join(',')}",${l.tobaccoUrge},${l.physicalActivity},${l.meals},${l.waterMl},"${l.notes}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `energy-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleRemoveInternal = async (id: string) => {
    setDeletingId(id);
    try {
      await onRemove(id);
      toast({ description: "Entry removed" });
    } catch (error) {
      console.error("Failed to remove log:", error);
      toast({ variant: "destructive", description: "Failed to remove entry" });
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  // SVG chart
  const chartW = 320, chartH = 140, padX = 10, padY = 10;
  const plotW = chartW - padX * 2, plotH = chartH - padY * 2;
  const points = chartData.map((d, i) => ({
    x: padX + (i / 6) * plotW,
    y: d.avg > 0 ? padY + plotH - ((d.avg - 1) / 4) * plotH : padY + plotH,
    ...d,
  }));
  const linePath = points.filter(p => p.avg > 0).map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const refY = padY + plotH - ((3 - 1) / 4) * plotH;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 animate-fade-in" />
      {/* Sheet */}
      <div className="bg-background rounded-t-2xl animate-slide-up flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="font-sora text-[16px] font-bold text-text">Energy Records</h2>
          <button onClick={onClose} className="p-2 -mr-2"><X size={20} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
          {/* 7-day chart */}
          <div className="card-base mb-3 p-4">
            <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full">
              {/* Grid */}
              {[1, 2, 3, 4, 5].map(v => {
                const y = padY + plotH - ((v - 1) / 4) * plotH;
                return <line key={v} x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="hsl(216 20% 94%)" strokeWidth={0.5} />;
              })}
              {/* Reference 3.0 */}
              <line x1={padX} y1={refY} x2={chartW - padX} y2={refY}
                stroke="hsl(216 22% 87%)" strokeWidth={1} strokeDasharray="4 3" />
              {/* Line */}
              {linePath && <path d={linePath} fill="none" stroke="hsl(201 92% 59%)" strokeWidth={2} />}
              {/* Dots & labels */}
              {points.map((p, i) => (
                <g key={i}>
                  {p.avg > 0 && (
                    <>
                      <circle cx={p.x} cy={p.y} r={3} fill="hsl(201 92% 59%)" />
                      {p.hasStrongUrge && (
                        <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px] fill-warning font-dm">*</text>
                      )}
                    </>
                  )}
                  <text x={p.x} y={chartH + 14} textAnchor="middle" className="text-[10px] fill-muted-foreground font-dm">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Search */}
          <input type="text" className="input-field mb-3" placeholder="Search entries..."
            value={search} onChange={e => setSearch(e.target.value)} />

          {/* Grouped logs */}
          {Array.from(grouped.entries()).map(([date, dayLogs]) => (
            <div key={date} className="mb-4">
              <p className="text-[12px] font-dm font-medium text-muted-foreground mb-2">{date}</p>
              {dayLogs.map(log => (
                <HistoryEntry
                  key={log.id}
                  log={log}
                  onRemove={() => handleRemoveInternal(log.id)}
                  isDeleting={deletingId === log.id}
                />
              ))}
            </div>
          ))}

          {/* Urge note */}
          {lowEnergyLogs.length > 0 && (
            <p className="text-[12px] font-dm text-muted-foreground italic mt-2 mb-4">
              Strong urge recorded in {urgePct}% of entries where energy was Level 1 or 2.
            </p>
          )}

          {/* Export */}
          <button onClick={exportData}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-[14px] font-dm text-primary font-medium mb-4">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryEntry = ({ log, onRemove, isDeleting }: { log: EnergyLog; onRemove: () => void; isDeleting: boolean }) => {
  const [swiped, setSwiped] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-alert text-[13px] font-dm font-medium"
        style={{ width: 80, color: 'white' }} onClick={onRemove}>
        {isDeleting ? "..." : "Remove"}
      </div>
      <div className="relative bg-card border border-border rounded-xl px-4 py-3 transition-transform"
        style={{ transform: `translateX(${swiped ? -80 : 0}px)` }}
        onTouchStart={() => { }}
        onTouchEnd={() => setSwiped(!swiped)}
        onClick={() => setSwiped(!swiped)}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-dm text-muted-foreground">
            {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-dm font-medium"
            style={{ backgroundColor: LEVEL_COLORS[log.level] + '18', color: LEVEL_COLORS[log.level] }}>
            Level {log.level}
          </span>
          <span className="text-[12px] font-dm text-muted-foreground">{log.energyType}</span>
        </div>
        {log.notes && <p className="text-[12px] font-dm text-muted-foreground mt-1">{log.notes}</p>}
      </div>
    </div>
  );
};

export default HistoryDrawer;
