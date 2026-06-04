import { IconMenu2 } from '@tabler/icons-react';

export const Topbar = ({ onToggle }: { onToggle: () => void }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
    <button onClick={onToggle} className="p-2 hover:bg-slate-100 rounded-lg">
      <IconMenu2 size={20} />
    </button>
    <div className="font-medium text-slate-700 text-sm">Interface Admin</div>
  </header>
);