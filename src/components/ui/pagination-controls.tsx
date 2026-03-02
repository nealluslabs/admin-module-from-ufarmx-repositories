import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  showRange?: boolean;
  showPageSize?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  maxVisiblePages = 3,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
  activeButtonClassName,
  inactiveButtonClassName,
  showRange = true,
  showPageSize = true,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const visibleCount = Math.max(1, maxVisiblePages);
  const halfWindow = Math.floor(visibleCount / 2);
  let start = Math.max(1, currentPage - halfWindow);
  let end = Math.min(safeTotalPages, start + visibleCount - 1);

  if (end - start + 1 < visibleCount) {
    start = Math.max(1, end - visibleCount + 1);
  }

  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i += 1) {
    pageNumbers.push(i);
  }

  const rangeStart = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Left side: show/range info */}
      <div className="flex items-center gap-2">
        {showPageSize && (
          <>
            <span className="text-sm text-[#5E6482]">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-6 w-[66px] rounded-[4px] border-[#E8E9ED] bg-[#F6F6F7] px-2 text-xs text-[#5E6482]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-[#5E6482]">items</span>
          </>
        )}
        {showRange && typeof totalItems === 'number' && totalItems > 0 && (
          <span className={cn('text-sm text-[#5E6482]', showPageSize && 'ml-2')}>
            {rangeStart}–{rangeEnd} of {totalItems}
          </span>
        )}
      </div>

      {/* Right side: page buttons */}
      <div className="flex items-center gap-3">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={cn(
            'flex items-center justify-center rounded-[4px] px-[9px] py-[6px] text-xs leading-none transition-colors',
            'disabled:pointer-events-none disabled:opacity-40',
            inactiveButtonClassName ?? 'border border-[#E8E9ED] bg-[#F6F6F7] text-[#5E6482] hover:bg-[#EAECF0]'
          )}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              'flex items-center justify-center rounded-[4px] px-[9px] py-[6px] text-xs leading-none tracking-[-0.12px] transition-colors',
              page === currentPage
                ? cn('border', activeButtonClassName ?? 'border-[#90C434] bg-[#90C434] text-[#0A6054]')
                : cn('border', inactiveButtonClassName ?? 'border-[#E8E9ED] bg-[#F6F6F7] text-[#5E6482] hover:bg-[#EAECF0]')
            )}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
          disabled={currentPage >= safeTotalPages}
          aria-label="Next page"
          className={cn(
            'flex items-center justify-center rounded-[4px] px-[9px] py-[6px] text-xs leading-none transition-colors',
            'disabled:pointer-events-none disabled:opacity-40',
            inactiveButtonClassName ?? 'border border-[#E8E9ED] bg-[#F6F6F7] text-[#5E6482] hover:bg-[#EAECF0]'
          )}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
