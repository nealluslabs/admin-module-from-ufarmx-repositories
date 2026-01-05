import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

