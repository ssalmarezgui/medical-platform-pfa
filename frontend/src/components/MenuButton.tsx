import { IconMenu2 } from '@tabler/icons-react';

export const MenuButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="p-3 bg-white border border-[#A7C0E4]/30 rounded-2xl hover:bg-[#DCE6F5]/50 transition-all shadow-sm"
  >
    <IconMenu2 size={20} className="text-[#2B5296]" />
  </button>
);