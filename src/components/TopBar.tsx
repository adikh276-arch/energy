import { Zap, BarChart2 } from 'lucide-react';

interface TopBarProps {
  onOpenHistory: () => void;
}

const TopBar = ({ onOpenHistory }: TopBarProps) => (
  <header className="sticky top-0 z-30 flex items-center justify-between px-4 bg-card border-b border-border-light"
    style={{ height: 56, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div className="flex items-center gap-2">
      <Zap size={18} className="text-primary" />
      <span className="font-sora text-[17px] font-bold text-text">Energy Tracker</span>
    </div>
    <button onClick={onOpenHistory} className="p-2 -mr-2" aria-label="History">
      <BarChart2 size={20} className="text-primary" />
    </button>
  </header>
);

export default TopBar;
