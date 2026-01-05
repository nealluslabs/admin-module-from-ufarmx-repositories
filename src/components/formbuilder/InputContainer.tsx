import { cn } from '@/lib/utils';

interface InputContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function InputContainer({ children, className }: InputContainerProps) {
  return (
    <div className={cn('flex flex-col gap-3 my-3', className)}>
      {children}
    </div>
  );
}

