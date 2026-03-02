import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CircleUserRound, Package, ReceiptText, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import {
  retailerService,
  type RetailerDetail,
  type RetailerFarmerItem,
  type RetailerProductItem,
  type RetailerRequestItem,
} from '@/services/retailer.service';
import { ROUTES } from '@/utils/routes';

type TabId = 'information' | 'farmers' | 'products' | 'requests' | 'score';

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'information', label: 'Information', icon: CircleUserRound },
  { id: 'farmers', label: 'Farmers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'requests', label: 'Requests', icon: ReceiptText },
  { id: 'score', label: 'Score', icon: Building2 },
];

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
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-lg font-semibold text-[#667085]">
        {initials || 'RT'}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      className="h-20 w-20 shrink-0 rounded-full object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

function ProductThumbnail({ name, image }: { name: string; image?: string }) {
  const [imageError, setImageError] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || 'P';

  if (!image || imageError) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EAECF0] text-xs font-semibold text-[#667085]">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="h-9 w-9 shrink-0 rounded-md object-cover"
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

export default function RetailerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [retailer, setRetailer] = useState<RetailerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('information');

  const [farmers, setFarmers] = useState<RetailerFarmerItem[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [farmersPage, setFarmersPage] = useState(1);
  const [farmersPageSize, setFarmersPageSize] = useState(10);
  const [farmersSearch, setFarmersSearch] = useState('');

  const [products, setProducts] = useState<RetailerProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsTotalCount, setProductsTotalCount] = useState(0);
  const [productsSearch, setProductsSearch] = useState('');

  const [requests, setRequests] = useState<RetailerRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPageSize, setRequestsPageSize] = useState(10);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsTotalCount, setRequestsTotalCount] = useState(0);
  const [requestsSearch, setRequestsSearch] = useState('');

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.RETAILERS);
      return;
    }

    const fetchRetailer = async () => {
      try {
        setLoading(true);
        const data = await retailerService.getRetailerById(id);
        setRetailer(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch retailer details');
        navigate(ROUTES.RETAILERS);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailer();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || activeTab !== 'farmers') return;
    const fetchFarmers = async () => {
      try {
        setFarmersLoading(true);
        const data = await retailerService.getRetailerFarmers(id);
        setFarmers(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch retailer farmers');
      } finally {
        setFarmersLoading(false);
      }
    };
    fetchFarmers();
  }, [id, activeTab]);

  useEffect(() => {
    if (!id || activeTab !== 'products') return;
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await retailerService.getRetailerProducts(id, {
          page: productsPage,
          limit: productsPageSize,
          search: productsSearch || undefined,
        });
        setProducts(
          [...data.products].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )
        );
        setProductsPage(data.page);
        setProductsTotalPages(Math.max(1, data.pages));
        setProductsTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch retailer products');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [id, activeTab, productsPage, productsPageSize, productsSearch]);

  useEffect(() => {
    if (!id || activeTab !== 'requests') return;
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const data = await retailerService.getRetailerRequests(id, {
          page: requestsPage,
          limit: requestsPageSize,
          search: requestsSearch || undefined,
          direction: 'all',
        });
        setRequests(
          [...data.requests].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          )
        );
        setRequestsPage(data.page);
        setRequestsTotalPages(Math.max(1, data.pages));
        setRequestsTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch retailer requests');
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, [id, activeTab, requestsPage, requestsPageSize, requestsSearch]);

  const filteredFarmers = useMemo(() => {
    const search = farmersSearch.trim().toLowerCase();
    const base = search
      ? farmers.filter((farmer) =>
          [farmer.name, farmer.farmerId, farmer.location, farmer.contact].some((value) =>
            String(value).toLowerCase().includes(search)
          )
        )
      : farmers;

    const sorted = [...base].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const start = (farmersPage - 1) * farmersPageSize;
    return sorted.slice(start, start + farmersPageSize);
  }, [farmers, farmersSearch, farmersPage, farmersPageSize]);

  const totalFilteredFarmers = useMemo(() => {
    const search = farmersSearch.trim().toLowerCase();
    if (!search) return farmers.length;
    return farmers.filter((farmer) =>
      [farmer.name, farmer.farmerId, farmer.location, farmer.contact].some((value) =>
        String(value).toLowerCase().includes(search)
      )
    ).length;
  }, [farmers, farmersSearch]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
      </div>
    );
  }

  if (!retailer) return null;

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.RETAILERS)}
        className="inline-flex w-fit items-center gap-1 py-2 text-[12px] text-[rgba(44,51,57,0.95)] hover:opacity-80"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Retailers</span>
        <span className="opacity-40">/</span>
        <span className="text-[rgba(122,134,147,0.95)]">{retailer.name}</span>
      </button>

      <div className="rounded-2xl bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <RetailerAvatar name={retailer.name} photo={retailer.photo} />
            <div>
              <h1 className="text-[24px] font-semibold text-[#1b2559]">{retailer.name}</h1>
              <p className="mt-1 text-sm text-[#667085]">{retailer.business}</p>
              <p className="mt-2 text-sm text-[#667085]">{retailer.email}</p>
              <p className="text-sm text-[#667085]">{retailer.phone}</p>
              <p className="text-sm text-[#667085]">{retailer.location}</p>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              retailer.status === 'Active'
                ? 'bg-[#ECFDF3] text-[#027A48]'
                : 'bg-[#F2F4F7] text-[#667085]'
            }`}
          >
            {retailer.status}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {tabs.map(({ id: tabId, label, icon: Icon }) => {
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#0a6054] text-white shadow-[0_2px_8px_rgba(10,96,84,0.30)]'
                    : 'text-[#98a2b3] hover:bg-[#F0FAF8] hover:text-[#0a6054]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#90C434]' : ''}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'information' && (
        <div className="rounded-2xl bg-white p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#EAECF0] p-6">
              <h3 className="mb-4 text-base font-semibold text-[#344054]">Personal Information</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="First Name" value={retailer.name.split(' ')[0] || 'N/A'} />
                <InfoRow label="Middle Name" value={retailer.middleName} />
                <InfoRow label="Gender" value={retailer.gender} />
                <InfoRow label="Nationality" value={retailer.nationality} />
                <InfoRow label="Date of Birth" value={retailer.dateOfBirth} />
                <InfoRow label="Phone" value={retailer.phone} />
                <InfoRow label="Email" value={retailer.email} />
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] p-6">
              <h3 className="mb-4 text-base font-semibold text-[#344054]">Location</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Address" value={retailer.address} />
                <InfoRow label="Current State" value={retailer.currentState} />
                <InfoRow label="Current LGA" value={retailer.currentLocalGovernment} />
                <InfoRow label="State of Origin" value={retailer.stateOfOrigin} />
                <InfoRow label="LGA of Origin" value={retailer.localGovernmentOfOrigin} />
                <InfoRow label="Nearest Landmark" value={retailer.nearestLandmark} />
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] p-6">
              <h3 className="mb-4 text-base font-semibold text-[#344054]">Business Information</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Business" value={retailer.business} />
                <InfoRow label="Business Address" value={retailer.businessAddress} />
                <InfoRow label="Local Government" value={retailer.localGovernment} />
                <InfoRow label="Years in Business" value={retailer.yearsInBusiness} />
                <InfoRow label="Shop Ownership" value={retailer.shopOwnership} />
                <InfoRow label="Shop Size" value={retailer.shopSize} />
                <InfoRow label="Utility Type" value={retailer.utilityType} />
                <InfoRow label="Meter Number" value={retailer.meterNumber} />
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] p-6">
              <h3 className="mb-4 text-base font-semibold text-[#344054]">KYC & Documents</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Means of ID" value={retailer.meansOfId} />
                <InfoRow label="NIN" value={retailer.nin} />
                <DocumentRow
                  label="ID Document"
                  value={retailer.idDocument}
                  rawUrl={retailer.idDocumentRaw}
                />
                <DocumentRow
                  label="Proof of Address"
                  value={retailer.proofOfAddress}
                  rawUrl={retailer.proofOfAddressRaw}
                />
                <DocumentRow
                  label="Utility Bill"
                  value={retailer.utilityBill}
                  rawUrl={retailer.utilityBillRaw}
                />
                <DocumentRow
                  label="Shop Photos"
                  value={retailer.shopPhotos}
                  rawUrl={retailer.shopPhotosRaw}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'farmers' && (
        <div className="rounded-2xl bg-white p-8">
          <div className="mb-4 flex justify-end">
            <div className="relative h-[45px] w-[329px]">
              <Input
                value={farmersSearch}
                onChange={(e) => {
                  setFarmersSearch(e.target.value);
                  setFarmersPage(1);
                }}
                placeholder="Search Farmer"
                className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            <div className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr_1fr_0.6fr] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#344054]">
              <p>Farmer</p>
              <p>Age</p>
              <p>Farmer ID</p>
              <p>Location</p>
              <p>Contact</p>
              <p>Date</p>
              <p className="text-right">Action</p>
            </div>
            {farmersLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#90C434] border-t-transparent" />
              </div>
            ) : filteredFarmers.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#667085]">No farmers found</div>
            ) : (
              <div className="divide-y divide-[#EAECF0]">
                {filteredFarmers.map((farmer) => (
                  <div key={farmer.id} className="grid grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr_1fr_0.6fr] px-4 py-3 text-sm text-[#392751]">
                    <p>{farmer.name}</p>
                    <p>{farmer.age}</p>
                    <p>{farmer.farmerId}</p>
                    <p>{farmer.location}</p>
                    <p>{farmer.contact}</p>
                    <p>{farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <button
                      type="button"
                      className="text-right text-[#0A6054] hover:underline"
                      onClick={() => navigate(`/farmers/${farmer.id}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <PaginationControls
              currentPage={farmersPage}
              totalPages={Math.max(1, Math.ceil(totalFilteredFarmers / farmersPageSize))}
              pageSize={farmersPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              totalItems={totalFilteredFarmers}
              activeButtonClassName="bg-[#90C434] text-[#0A6054] border-[#90C434]"
              inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
              onPageChange={setFarmersPage}
              onPageSizeChange={(size) => {
                setFarmersPageSize(size);
                setFarmersPage(1);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="rounded-2xl bg-white p-8">
          <div className="mb-4 flex justify-end">
            <div className="relative h-[45px] w-[329px]">
              <Input
                value={productsSearch}
                onChange={(e) => {
                  setProductsSearch(e.target.value);
                  setProductsPage(1);
                }}
                placeholder="Search Product"
                className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#344054]">
              <p>Product</p>
              <p>Category</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Status</p>
              <p>Date</p>
            </div>
            {productsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#90C434] border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#667085]">No products found</div>
            ) : (
              <div className="divide-y divide-[#EAECF0]">
                {products.map((product) => (
                  <div key={product.id} className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr] px-4 py-3 text-sm text-[#392751]">
                    <div className="flex items-center gap-2">
                      <ProductThumbnail name={product.name} image={product.image} />
                      <p className="truncate">{product.name}</p>
                    </div>
                    <p>{product.category}</p>
                    <p>{product.price}</p>
                    <p>{product.quantity}</p>
                    <p className="capitalize">{product.status}</p>
                    <p>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <PaginationControls
              currentPage={productsPage}
              totalPages={productsTotalPages}
              pageSize={productsPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              totalItems={productsTotalCount}
              activeButtonClassName="bg-[#90C434] text-[#0A6054] border-[#90C434]"
              inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
              onPageChange={setProductsPage}
              onPageSizeChange={(size) => {
                setProductsPageSize(size);
                setProductsPage(1);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="rounded-2xl bg-white p-8">
          <div className="mb-4 flex justify-end">
            <div className="relative h-[45px] w-[329px]">
              <Input
                value={requestsSearch}
                onChange={(e) => {
                  setRequestsSearch(e.target.value);
                  setRequestsPage(1);
                }}
                placeholder="Search Request"
                className="h-[45px] rounded-[8px] border-[#E4E7EC] bg-white text-sm text-[#667085] placeholder:text-[#667085] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#344054]">
              <p>Type</p>
              <p>Farmer</p>
              <p>Status</p>
              <p>Total</p>
              <p>Date</p>
            </div>
            {requestsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#90C434] border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#667085]">No requests found</div>
            ) : (
              <div className="divide-y divide-[#EAECF0]">
                {requests.map((request) => (
                  <div key={request.id} className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr] px-4 py-3 text-sm text-[#392751]">
                    <p className="capitalize">{request.requestType.replaceAll('_', ' ')}</p>
                    <p>{request.farmerName}</p>
                    <p className="capitalize">{request.status}</p>
                    <p>{request.totalAmount}</p>
                    <p>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <PaginationControls
              currentPage={requestsPage}
              totalPages={requestsTotalPages}
              pageSize={requestsPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              totalItems={requestsTotalCount}
              activeButtonClassName="bg-[#90C434] text-[#0A6054] border-[#90C434]"
              inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
              onPageChange={setRequestsPage}
              onPageSizeChange={(size) => {
                setRequestsPageSize(size);
                setRequestsPage(1);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'score' && (
        <div className="rounded-2xl bg-white p-12 text-center">
          <p className="text-lg font-medium text-[#344054]">Score tab coming soon</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F2F4F7] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[#667085]">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-[#344054]">{value || 'N/A'}</span>
    </div>
  );
}

function canViewAsset(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  );
}

function DocumentRow({ label, value, rawUrl }: { label: string; value: string; rawUrl?: string }) {
  const hasView = canViewAsset(rawUrl);

  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F2F4F7] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[#667085]">{label}</span>
      <div className="flex max-w-[60%] items-center gap-3">
        <span className="truncate text-right font-medium text-[#344054]" title={value || 'N/A'}>
          {value || 'N/A'}
        </span>
        {hasView ? (
          <a
            href={rawUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-medium text-[#0A6054] hover:underline"
          >
            View
          </a>
        ) : null}
      </div>
    </div>
  );
}
