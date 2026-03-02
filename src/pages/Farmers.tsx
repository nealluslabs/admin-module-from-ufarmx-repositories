import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerService, type FarmerListItem } from '@/services/farmer.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/ui/pagination-controls';

function FarmerAvatar({ name, photo }: { name: string; photo?: string }) {
  const [imageError, setImageError] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (!photo || imageError) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-xs font-semibold text-[#667085]">
        {initials || 'FM'}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      className="h-12 w-12 shrink-0 rounded-full object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

export default function Farmers() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
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
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const data = await farmerService.getFarmers({
          page: currentPage,
          limit: pageSize,
          keyword: debouncedSearch || undefined,
        });
        setFarmers(data.farmers);
        setCurrentPage(data.page);
        setTotalPages(Math.max(1, data.pages));
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch farmers');
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, [currentPage, pageSize, debouncedSearch]);

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div className="flex flex-col gap-2 py-2">
        <h1 className="text-2xl font-medium leading-9 text-[#344054]">Farmers</h1>
        <p className="text-xs leading-4 text-[#667085]">View and manage all farmers</p>
      </div>

      {/* Search + Filter — right-aligned */}
      <div className="flex items-center justify-end gap-[10px]">
        <div className="relative h-[45px] w-[329px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Farmer"
            className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white pl-12 text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
          />
        </div>
        <Button
          variant="outline"
          className="h-[45px] w-[124px] gap-2 rounded-[8px] border-[#0A6054] bg-white text-sm font-normal text-[#0A6054] hover:bg-[#F0FAF8]"
          onClick={() => toast('Advanced filters coming soon')}
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </Button>
      </div>

      {/* Table card */}
      <div className="w-full rounded-2xl bg-white pb-8">

        {/* Header */}
        <div className="flex w-full items-center border-b border-[#EAECF0] px-8 py-4">
          <div className="w-[220px] shrink-0 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Farmer</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Age</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Crop Type</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Location</span>
          </div>
          <div className="flex-1 px-4">
            <span className="text-base capitalize leading-4 text-[#392751]">Contact</span>
          </div>
          <div className="w-[110px] shrink-0" />
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-[7px]">
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
            </div>
          ) : farmers.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center gap-2">
              <Users className="h-8 w-8 text-[#667085]" />
              <p className="font-medium text-[#344054]">No farmers found</p>
              <p className="text-sm text-[#667085]">
                {searchQuery ? 'Try a different search term.' : 'No farmers are available yet.'}
              </p>
            </div>
          ) : (
            farmers.map((farmer, index) => (
              <div
                key={farmer.id}
                className={`flex w-full items-center rounded-lg px-8 py-4 ${
                  index % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-white'
                }`}
              >
                {/* Farmer */}
                <div className="flex w-[220px] shrink-0 items-center gap-2 px-4">
                  <FarmerAvatar name={farmer.name} photo={farmer.photo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base capitalize leading-4 text-[#392751]">
                      {farmer.name}
                    </p>
                    <p className="mt-1 truncate text-xs italic leading-4 text-[#392751]">
                      {farmer.farmerId}
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex-1 px-4">
                  <p className="truncate text-base capitalize leading-4 text-[#392751]">{farmer.age}</p>
                </div>

                {/* Crop Type */}
                <div className="flex-1 px-4">
                  <p className="truncate text-base capitalize leading-4 text-[#392751]">{farmer.cropType}</p>
                </div>

                {/* Location */}
                <div className="flex-1 px-4">
                  <p className="truncate text-base capitalize leading-4 text-[#392751]">{farmer.location}</p>
                </div>

                {/* Contact */}
                <div className="flex-1 px-4">
                  <p className="truncate text-base leading-4 text-[#392751]">{farmer.contact}</p>
                </div>

                {/* View */}
                <div className="flex w-[110px] shrink-0 items-center justify-end px-4">
                  <button
                    type="button"
                    className="text-base capitalize leading-4 text-[#90C434] hover:underline"
                    onClick={() => navigate(`/farmers/${farmer.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
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
