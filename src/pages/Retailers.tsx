import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { retailerService, type RetailerListItem } from '@/services/retailer.service';

function RetailerAvatar({ name, photo }: { name: string; photo?: string }) {
  const [imageError, setImageError] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (!photo || imageError) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-xs font-semibold text-[#667085]">
        {initials || 'RT'}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

export default function Retailers() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState<RetailerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true);
        const data = await retailerService.getRetailers({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
        });
        setRetailers(
          [...data.retailers].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )
        );
        setCurrentPage(data.page);
        setTotalPages(Math.max(1, data.pages));
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch retailers');
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, [currentPage, pageSize, debouncedSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="text-2xl font-medium leading-9 text-[#344054]">Retailers</h1>
        <p className="text-xs leading-4 text-[#667085]">View and manage all retailers</p>
      </div>

      <div className="flex items-center justify-end">
        <div className="relative h-[45px] w-[329px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Retailer"
            className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white pl-12 text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white pb-8">
        <div className="flex w-full items-center border-b border-[#EAECF0] px-8 py-4">
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Retailer</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Business</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Email</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Phone</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Location</span>
          </div>
          <div className="w-[120px] shrink-0 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Status</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Date</span>
          </div>
          <div className="w-[80px] shrink-0" />
        </div>

        <div className="flex flex-col gap-[7px]">
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
            </div>
          ) : retailers.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2">
              <Store className="h-8 w-8 text-[#667085]" />
              <p className="font-medium text-[#344054]">No retailers found</p>
              <p className="text-sm text-[#667085]">
                {searchQuery ? 'Try a different search term.' : 'No retailers are available yet.'}
              </p>
            </div>
          ) : (
            retailers.map((retailer, index) => (
              <div
                key={retailer.id}
                className={`flex w-full items-center rounded-lg px-8 py-4 ${
                  index % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-white'
                }`}
              >
                <div className="flex flex-1 items-center gap-2 px-4">
                  <RetailerAvatar name={retailer.name} photo={retailer.photo} />
                  <div className="min-w-0">
                    <p className="truncate text-base leading-4 text-[#392751]">{retailer.name}</p>
                  </div>
                </div>

                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{retailer.business}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{retailer.email}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{retailer.phone}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{retailer.location}</p>
                </div>
                <div className="w-[120px] shrink-0 px-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      retailer.status === 'Active'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : 'bg-[#F2F4F7] text-[#667085]'
                    }`}
                  >
                    {retailer.status}
                  </span>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">
                    {retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex w-[80px] shrink-0 items-center justify-end px-4">
                  <button
                    type="button"
                    className="text-base capitalize leading-4 text-[#90C434] hover:underline"
                    onClick={() => navigate(`/retailers/${retailer.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        totalItems={totalCount}
        activeButtonClassName="bg-[#90C434] text-[#0A6054] border-[#90C434]"
        inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
