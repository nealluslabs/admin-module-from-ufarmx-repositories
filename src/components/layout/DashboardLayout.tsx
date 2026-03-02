import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        {/* Mobile Sidebar */}
        <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F2F4F7] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

