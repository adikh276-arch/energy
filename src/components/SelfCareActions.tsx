import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Droplets, Footprints, UtensilsCrossed, Wind, Coffee, Moon, Check } from 'lucide-react';

interface SelfCareActionsProps {
  onAction: (type: string) => void;
}

const ACTIONS = [
  { key: 'water', label: 'Drink Water', icon: Droplets },
  { key: 'walk', label: '5-min Walk', icon: Footprints },
  { key: 'meal', label: 'Have a Meal', icon: UtensilsCrossed },
  { key: 'breathing', label: 'Breathing', icon: Wind },
  { key: 'beverage', label: 'Beverage Break', icon: Coffee },
  { key: 'rest', label: 'Rest — 20 min', icon: Moon },
];

const CountdownRing = ({ duration, onDone }: { duration: number; onDone: () => void }) => {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = Date.now();
    ref.current = window.setInterval(() => {
      const e = (Date.now() - start) / 1000;
      if (e >= duration) { clearInterval(ref.current); setElapsed(duration); onDone(); }
      else setElapsed(e);
    }, 100);
    return () => clearInterval(ref.current);
  }, [duration, onDone]);

  const progress = elapsed / duration;
  const r = 24, c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="hsl(216 20% 94%)" strokeWidth={4} />
        <circle cx={28} cy={28} r={r} fill="none" stroke="hsl(201 92% 59%)" strokeWidth={4}
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 0.1s' }} />
      </svg>
      <span className="text-[11px] font-dm text-muted-foreground">
        {Math.max(0, Math.ceil(duration - elapsed))}s left
      </span>
    </div>
  );
};

const BreathingGuide = ({ onDone }: { onDone: () => void }) => {
  const [phase, setPhase] = useState<'Inhale'|'Hold'|'Exhale'>('Inhale');
  const [count, setCount] = useState(4);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const DURATION = 120; // 2 minutes

  useEffect(() => {
    const cycle = [
      { phase: 'Inhale' as const, dur: 4 },
      { phase: 'Hold' as const, dur: 7 },
      { phase: 'Exhale' as const, dur: 8 },
    ];
    let idx = 0, remaining = cycle[0].dur;
    const iv = setInterval(() => {
      setTotalElapsed(prev => {
        const next = prev + 1;
        if (next >= DURATION) { clearInterval(iv); onDone(); return DURATION; }
        return next;
      });
      remaining--;
      setCount(remaining);
      if (remaining <= 0) {
        idx = (idx + 1) % 3;
        remaining = cycle[idx].dur;
        setPhase(cycle[idx].phase);
        setCount(remaining);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [onDone]);

  const progress = totalElapsed / DURATION;
  const r = 24, c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="hsl(216 20% 94%)" strokeWidth={4} />
        <circle cx={28} cy={28} r={r} fill="none" stroke="hsl(201 92% 59%)" strokeWidth={4}
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="text-[13px] font-sora font-semibold text-primary">{phase} — {count}</span>
    </div>
  );
};

const SelfCareActions = ({ onAction }: SelfCareActionsProps) => {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [showMealTip, setShowMealTip] = useState(false);

  const handleTap = useCallback((key: string) => {
    if (completed.has(key)) return;
    if (key === 'water' || key === 'beverage') {
      onAction(key);
      setCompleted(prev => new Set(prev).add(key));
    } else if (key === 'walk') {
      setActiveTimer('walk');
    } else if (key === 'rest') {
      setActiveTimer('rest');
    } else if (key === 'breathing') {
      setActiveTimer('breathing');
    } else if (key === 'meal') {
      setShowMealTip(!showMealTip);
    }
  }, [completed, onAction, showMealTip]);

  const handleTimerDone = useCallback((key: string) => {
    setActiveTimer(null);
    onAction(key);
    setCompleted(prev => new Set(prev).add(key));
  }, [onAction]);

  return (
    <div className="card-base">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div>
          <h2 className="section-title text-left">Self-Care Actions</h2>
          <p className="text-[12px] font-dm text-muted-foreground text-left mt-0.5">
            Evidence-based approaches during withdrawal recovery.
          </p>
        </div>
        <ChevronDown size={20} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            const isDone = completed.has(a.key);
            const isActive = activeTimer === a.key;

            return (
              <div key={a.key} className="action-tile" onClick={() => !isActive && handleTap(a.key)}>
                {isDone ? (
                  <Check size={18} className="text-success" />
                ) : isActive ? (
                  a.key === 'breathing' ? (
                    <BreathingGuide onDone={() => handleTimerDone(a.key)} />
                  ) : (
                    <CountdownRing duration={a.key === 'walk' ? 300 : 1200} onDone={() => handleTimerDone(a.key)} />
                  )
                ) : (
                  <Icon size={18} className="text-primary" />
                )}
                <span className="text-[13px] font-dm text-text">{a.label}</span>
              </div>
            );
          })}
          {showMealTip && (
            <div className="col-span-2 p-3 rounded-[10px] text-[13px] font-dm text-muted-foreground"
              style={{ background: 'hsl(210 25% 95%)' }}>
              Complex carbohydrates and protein support sustained energy.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelfCareActions;
