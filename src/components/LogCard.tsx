import { useState, useEffect } from 'react';
import { ENERGY_LEVELS, FACTORS, WATER_STEPS, WATER_LABELS } from '@/types/energy';
import { Minus, Plus } from 'lucide-react';
import { getUserId } from '@/lib/auth';
import { saveEnergyLog } from '@/lib/db';

interface LogCardProps {
  onSave: () => void;
}

const LogCard = ({ onSave }: LogCardProps) => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [energyType, setEnergyType] = useState<'Physical' | 'Cognitive' | 'Both'>('Both');
  const [factors, setFactors] = useState<string[]>([]);
  const [tobaccoUrge, setTobaccoUrge] = useState<'None' | 'Mild' | 'Strong'>('None');
  const [meals, setMeals] = useState(0);
  const [waterIdx, setWaterIdx] = useState(0);
  const [activity, setActivity] = useState<'None' | 'Light' | 'Moderate' | 'Vigorous'>('None');
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [editingTime, setEditingTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!editingTime) setTimestamp(new Date().toISOString());
    }, 60000);
    return () => clearInterval(timer);
  }, [editingTime]);

  const toggleFactor = (f: string) =>
    setFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) + ' IST';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB');
  };

  const handleSave = async () => {
    if (!level) return;
    const userId = getUserId();
    if (!userId) return;

    setSaving(true);
    try {
      await saveEnergyLog(userId, {
        id: crypto.randomUUID(), // Will be overwritten by DB anyway
        timestamp,
        level,
        energyType,
        factors,
        tobaccoUrge,
        physicalActivity: activity,
        meals,
        waterMl: WATER_STEPS[waterIdx],
        notes,
      });

      // Reset
      setLevel(null);
      setFactors([]);
      setTobaccoUrge('None');
      setMeals(0);
      setWaterIdx(0);
      setActivity('None');
      setNotes('');
      setTimestamp(new Date().toISOString());
      setEditingTime(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSave();
    } catch (error) {
      console.error("Failed to save energy log:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-base flex flex-col gap-4">
      <h2 className="section-title">Log Energy Level</h2>

      {/* Level select */}
      <div>
        <p className="section-label">Energy level</p>
        <div className="flex flex-col gap-1.5">
          {ENERGY_LEVELS.map(el => (
            <button key={el.level}
              disabled={saving}
              onClick={() => setLevel(el.level)}
              className={`energy-level-btn ${level === el.level ? 'energy-level-btn-selected' : ''}`}>
              <span className="text-[20px] pl-4 leading-none">{el.emoji}</span>
              <span className="flex-1 text-sm font-dm text-text text-center">{el.label}</span>
              <span className="text-[11px] font-dm text-muted-foreground pr-4">Level {el.level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy type */}
      <div>
        <p className="section-label">Energy type</p>
        <div className="flex gap-2">
          {(['Physical', 'Cognitive', 'Both'] as const).map(t => (
            <button key={t} onClick={() => setEnergyType(t)} disabled={saving}
              className={`pill ${energyType === t ? 'pill-selected' : 'pill-unselected'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Factors */}
      <div>
        <p className="section-label">Contributing factors</p>
        <div className="flex flex-wrap gap-2">
          {FACTORS.map(f => (
            <button key={f} onClick={() => toggleFactor(f)} disabled={saving}
              className={`chip ${factors.includes(f) ? 'chip-selected' : 'chip-unselected'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Tobacco urge */}
      <div>
        <p className="section-label">Tobacco urge for energy</p>
        <div className="flex gap-2">
          {(['None', 'Mild', 'Strong'] as const).map(u => (
            <button key={u} onClick={() => setTobaccoUrge(u)} disabled={saving}
              className={`pill ${tobaccoUrge === u ? 'pill-selected' : 'pill-unselected'}`}>{u}</button>
          ))}
        </div>
        {tobaccoUrge === 'Strong' && (
          <div className="mt-3 p-3 rounded-[10px] border text-[13px] font-dm text-body"
            style={{ background: 'hsl(48 100% 96%)', borderColor: 'hsla(37 91% 44% / 0.4)' }}>
            Tobacco relieves withdrawal-induced fatigue rather than generating energy. Sustained energy typically improves as withdrawal resolves. — NHS Smokefree, 2023
          </div>
        )}
      </div>

      {/* Meals & Fluid */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: 'hsl(210 25% 95%)' }}>
          <p className="section-label mb-2">Meals today</p>
          <div className="flex items-center justify-between">
            <button className="stepper-btn" disabled={saving} onClick={() => setMeals(Math.max(0, meals - 1))}><Minus size={16} className="text-primary" /></button>
            <span className="font-sora text-xl font-bold text-primary">{meals}</span>
            <button className="stepper-btn" disabled={saving} onClick={() => setMeals(Math.min(6, meals + 1))}><Plus size={16} className="text-primary" /></button>
          </div>
        </div>
        <div className="flex-1 rounded-xl p-3" style={{ background: 'hsl(210 25% 95%)' }}>
          <p className="section-label mb-2">Fluid intake</p>
          <div className="flex items-center justify-between">
            <button className="stepper-btn" disabled={saving} onClick={() => setWaterIdx(Math.max(0, waterIdx - 1))}><Minus size={16} className="text-primary" /></button>
            <span className="font-sora text-xl font-bold text-primary">{WATER_LABELS[WATER_STEPS[waterIdx]]}</span>
            <button className="stepper-btn" disabled={saving} onClick={() => setWaterIdx(Math.min(WATER_STEPS.length - 1, waterIdx + 1))}><Plus size={16} className="text-primary" /></button>
          </div>
        </div>
      </div>

      {/* Physical activity */}
      <div>
        <p className="section-label">Physical activity today</p>
        <div className="flex gap-2">
          {(['None', 'Light', 'Moderate', 'Vigorous'] as const).map(a => (
            <button key={a} onClick={() => setActivity(a)} disabled={saving}
              className={`pill ${activity === a ? 'pill-selected' : 'pill-unselected'}`}>{a}</button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-[13px] font-dm">
        <span className="text-muted-foreground">Recorded at</span>
        {editingTime ? (
          <input type="datetime-local"
            className="input-field py-1.5 text-[13px] w-auto"
            value={new Date(timestamp).toISOString().slice(0, 16)}
            onChange={e => setTimestamp(new Date(e.target.value).toISOString())}
            onBlur={() => setEditingTime(false)} autoFocus />
        ) : (
          <>
            <span className="text-text">{formatDate(timestamp)}, {formatTime(timestamp)}</span>
            <button onClick={() => setEditingTime(true)} disabled={saving} className="text-primary font-medium">Edit time</button>
          </>
        )}
      </div>

      {/* Notes */}
      <div>
        <p className="section-label">Notes</p>
        <input type="text" className="input-field" placeholder="Optional notes..."
          disabled={saving} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Divider + Save */}
      <div className="border-t border-border-light pt-4">
        <button onClick={handleSave} disabled={!level || saving}
          className={`btn-primary ${(!level || saving) ? 'opacity-40 cursor-not-allowed' : ''}`}>
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 toast-custom px-5 py-3 animate-slide-up z-50">
          Entry saved.
        </div>
      )}
    </div>
  );
};

export default LogCard;
