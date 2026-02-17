import { EnergyLog, LEVEL_COLORS } from '@/types/energy';
import { useState } from 'react';

interface TodaySnapshotProps {
  logs: EnergyLog[];
}

const TodaySnapshot = ({ logs }: TodaySnapshotProps) => {
  const [tooltip, setTooltip] = useState<{ log: EnergyLog; x: number } | null>(null);

  const entries = logs.length;
  const avgLevel = entries ? (logs.reduce((s, l) => s + l.level, 0) / entries).toFixed(1) : '—';
  const totalFluid = logs.reduce((s, l) => s + l.waterMl, 0);
  const totalMeals = logs.length > 0 ? Math.max(...logs.map(l => l.meals)) : 0;

  // Timeline: 6AM to 11PM
  const startHour = 6, endHour = 23;
  const totalMinutes = (endHour - startHour) * 60;
  const ticks = [6, 9, 12, 15, 18, 21];

  const getX = (iso: string) => {
    const d = new Date(iso);
    const mins = d.getHours() * 60 + d.getMinutes() - startHour * 60;
    return Math.max(0, Math.min(1, mins / totalMinutes));
  };

  const formatHour = (h: number) => {
    if (h === 0 || h === 12) return h === 0 ? '12AM' : '12PM';
    return h > 12 ? `${h - 12}PM` : `${h}AM`;
  };

  return (
    <div className="card-base flex flex-col gap-3">
      <h2 className="section-title">Today</h2>

      {/* 2x2 stat grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-cell">
          <p className="section-label mb-1">Entries</p>
          <p className="stat-number text-[26px]">{entries}</p>
        </div>
        <div className="stat-cell">
          <p className="section-label mb-1">Avg level</p>
          <p className="stat-number text-[26px]">{avgLevel}<span className="text-[14px] text-muted-foreground font-dm">/5</span></p>
        </div>
        <div className="stat-cell">
          <p className="section-label mb-1">Fluid intake</p>
          <p className="stat-number text-[22px]">{totalFluid}<span className="text-[12px] text-muted-foreground font-dm"> / 2,000 ml</span></p>
          <div className="mt-2 h-1 rounded-full bg-border">
            <div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (totalFluid / 2000) * 100)}%` }} />
          </div>
        </div>
        <div className="stat-cell">
          <p className="section-label mb-1">Meals</p>
          <p className="stat-number text-[26px]">{totalMeals}</p>
        </div>
      </div>

      {/* Timeline */}
      {logs.length > 0 && (
        <div className="relative mt-2" style={{ height: 50 }}>
          <svg width="100%" height="40" className="overflow-visible">
            {/* Axis line */}
            <line x1="0" y1="30" x2="100%" y2="30" stroke="hsl(216 20% 94%)" strokeWidth={1} />
            {/* Ticks */}
            {ticks.map(h => {
              const x = ((h - startHour) * 60) / totalMinutes * 100;
              return (
                <g key={h}>
                  <line x1={`${x}%`} y1="26" x2={`${x}%`} y2="34" stroke="hsl(216 20% 94%)" strokeWidth={1} />
                  <text x={`${x}%`} y="44" textAnchor="middle" className="text-[10px] fill-muted-foreground font-dm">{formatHour(h)}</text>
                </g>
              );
            })}
            {/* Dots */}
            {logs.map(log => {
              const xPct = getX(log.timestamp) * 100;
              return (
                <circle key={log.id} cx={`${xPct}%`} cy="20" r={5}
                  fill={LEVEL_COLORS[log.level]}
                  className="cursor-pointer"
                  onPointerDown={() => setTooltip(tooltip?.log.id === log.id ? null : { log, x: xPct })} />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute bg-card border border-border rounded-[10px] px-3 py-2 text-[12px] font-dm shadow-lg z-10"
              style={{ left: `${Math.min(75, Math.max(10, tooltip.x))}%`, top: -10, transform: 'translateX(-50%)' }}>
              <span className="font-semibold" style={{ color: LEVEL_COLORS[tooltip.log.level] }}>
                Level {tooltip.log.level}
              </span>
              <span className="text-muted-foreground ml-2">
                {new Date(tooltip.log.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodaySnapshot;
