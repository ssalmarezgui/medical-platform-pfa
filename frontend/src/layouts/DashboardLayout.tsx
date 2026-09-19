import { ReactNode } from 'react';
import { useUIStore } from '../store/useUIStore';
import { Sidebar } from '../components/Sidebar';
import { MenuButton } from '../components/MenuButton';

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen bg-[#F1F5FB] overflow-hidden relative">
      
      {isSidebarOpen && (
        <div className="z-50 bg-white shrink-0 h-full shadow-lg shadow-slate-900/5">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-[8px]"
          style={{ 
            backgroundImage: 'url(/src/assets/bg-medical.jpg)', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        

        

        <main className="flex-1 p-8 overflow-y-auto relative z-10">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};