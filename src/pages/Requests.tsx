import { useEffect, useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { requestService, type RequestListItem } from '@/services/request.service';

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestListItem[]>([]);
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
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await requestService.getRequests({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
        });
        setRequests(data.requests);
        setCurrentPage(data.page);
        setTotalPages(Math.max(1, data.pages));
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentPage, pageSize, debouncedSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="text-2xl font-medium leading-9 text-[#344054]">Requests</h1>
        <p className="text-xs leading-4 text-[#667085]">View and manage all requests</p>
      </div>

      <div className="flex items-center justify-end">
        <div className="relative h-[45px] w-[329px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Request"
            className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white pl-12 text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="w-full rounded-2xl bg-white pb-8">
        <div className="flex w-full items-center border-b border-[#EAECF0] px-8 py-4">
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Type</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Retailer</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Farmer</span>
          </div>
          <div className="w-[120px] shrink-0 px-4">
            <span className="text-base leading-4 text-[#392751]">Status</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Total</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base leading-4 text-[#392751]">Date</span>
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2">
              <Inbox className="h-8 w-8 text-[#667085]" />
              <p className="font-medium text-[#344054]">No requests found</p>
              <p className="text-sm text-[#667085]">
                {searchQuery ? 'Try a different search term.' : 'No requests are available yet.'}
              </p>
            </div>
          ) : (
            requests.map((request, index) => (
              <div
                key={request.id}
                className={`flex w-full items-center rounded-lg px-8 py-4 ${
                  index % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-white'
                }`}
              >
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751] capitalize">
                    {request.requestType.replaceAll('_', ' ')}
                  </p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{request.retailerName}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{request.farmerName}</p>
                </div>
                <div className="w-[120px] shrink-0 px-4">
                  <span className="inline-flex rounded-full bg-[#F2F4F7] px-2 py-1 text-xs font-medium text-[#667085] capitalize">
                    {request.status}
                  </span>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{request.totalAmount}</p>
                </div>
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
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
