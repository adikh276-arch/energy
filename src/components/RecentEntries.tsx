import { useState, useRef } from 'react';
import { EnergyLog, LEVEL_COLORS, WATER_LABELS } from '@/types/energy';

interface RecentEntriesProps {
  logs: EnergyLog[];
  onRemove: (id: string) => void;
  onViewAll: () => void;
}

const RecentEntries = ({ logs, onRemove, onViewAll }: RecentEntriesProps) => {
  const recent = logs.slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-sora text-[14px] font-bold text-muted-foreground">Recent Entries</h3>

      {recent.length === 0 && (
        <p className="text-[13px] font-dm text-muted-foreground">No entries yet.</p>
      )}

      {recent.map(log => (
        <SwipeEntry key={log.id} log={log} onRemove={() => onRemove(log.id)} />
      ))}

      {logs.length > 5 && (
        <button onClick={onViewAll} className="text-[13px] font-dm text-primary font-medium mt-1">
          View all
        </button>
      )}
    </div>
  );
};

const SwipeEntry = ({ log, onRemove }: { log: EnergyLog; onRemove: () => void }) => {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Remove bg */}
      <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-alert text-alert-foreground text-[13px] font-dm font-medium"
        style={{ width: 80 }}
        onClick={onRemove}>
        Remove
      </div>

      <div
        className="relative bg-card border border-border rounded-xl px-4 py-3 transition-transform"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={e => { startX.current = e.touches[0].clientX; dragging.current = true; }}
        onTouchMove={e => {
          if (!dragging.current) return;
          const dx = e.touches[0].clientX - startX.current;
          if (dx < 0) setOffsetX(Math.max(-80, dx));
        }}
        onTouchEnd={() => { dragging.current = false; setOffsetX(offsetX < -40 ? -80 : 0); }}>

        {/* Row 1 */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-dm bg-surface-2 text-muted-foreground">
              {formatTime(log.timestamp)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-dm font-medium"
              style={{ backgroundColor: LEVEL_COLORS[log.level] + '18', color: LEVEL_COLORS[log.level] }}>
              Level {log.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-dm bg-surface-2 text-muted-foreground">
              {log.energyType}
            </span>
            {log.tobaccoUrge !== 'None' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-dm"
                style={{
                  backgroundColor: log.tobaccoUrge === 'Strong' ? 'hsl(37 91% 44% / 0.12)' : 'hsl(210 25% 95%)',
                  color: log.tobaccoUrge === 'Strong' ? 'hsl(37 91% 44%)' : 'hsl(210 18% 56%)'
                }}>
                {log.tobaccoUrge}
              </span>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-dm text-muted-foreground">
          {log.factors.slice(0, 3).map(f => (
            <span key={f} className="px-1.5 py-0.5 rounded bg-surface-2">{f}</span>
          ))}
          {log.factors.length > 3 && <span>+{log.factors.length - 3}</span>}
          {log.waterMl > 0 && <span>· {WATER_LABELS[log.waterMl] || `${log.waterMl}ml`}</span>}
          <span>· {log.meals} meals</span>
        </div>
      </div>
    </div>
  );
};

export default RecentEntries;
