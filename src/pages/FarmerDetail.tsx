import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gauge, Mail, MapPin, Sparkles, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerService, type FarmerDetail, type FarmerDetailHarvest } from '@/services/farmer.service';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { ROUTES } from '@/utils/routes';

const formatOnboardDate = (value: string): string => {
  if (!value || value === 'N/A') return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getCreditColors = (category: string): { scoreColor: string; bgColor: string; textColor: string } => {
  const cat = category.toLowerCase();
  if (cat === 'good' || cat === 'high' || cat === 'excellent')
    return { scoreColor: '#059669', bgColor: '#D1FAE5', textColor: '#065F46' };
  if (cat === 'medium' || cat === 'average' || cat === 'fair')
    return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506' };
  if (cat === 'low' || cat === 'poor' || cat === 'bad')
    return { scoreColor: '#d92d20', bgColor: '#FEE4E2', textColor: '#d92d20' };
  return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506' };
};

const parseCoordinates = (value: string): { lat: number; lng: number } | null => {
  if (!value || value === 'N/A') return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

function Avatar({
  name,
  photo,
  size = 'md',
}: {
  name: string;
  photo?: string;
  size?: 'profile' | 'md';
}) {
  const dim = size === 'profile' ? 130 : 48;
  const textClass = size === 'profile' ? 'text-2xl' : 'text-xs';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  if (!photo) {
    return (
      <div
        style={{ width: dim, height: dim, minWidth: dim }}
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#EAECF0] font-semibold text-[#667085] ${textClass}`}
      >
        {initials || 'FM'}
      </div>
    );
  }

  return (
    <div
      style={{ width: dim, height: dim, minWidth: dim }}
      className="shrink-0 overflow-hidden rounded-full"
    >
      <img
        src={photo}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex w-full items-start justify-between">
      <p
        className={`min-w-0 flex-1 text-[14px] font-medium capitalize leading-[16px] ${
          danger ? 'text-[#d92d20]' : 'text-[#392751]'
        }`}
      >
        {label}
      </p>
      <p
        className={`min-w-0 flex-1 text-[14px] leading-[16px] ${
          danger ? 'text-[#475467]' : 'text-[#392751]'
        }`}
      >
        {value || 'N/A'}
      </p>
    </div>
  );
}

export default function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'crops' | 'cropDeposits'>('crops');
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 5;

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.FARMERS);
      return;
    }

    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const data = await farmerService.getFarmerById(id);
        setFarmer(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch farmer details');
        navigate(ROUTES.FARMERS);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id, navigate]);

  const coordinates = useMemo(
    () => parseCoordinates(farmer?.gps || farmer?.location || ''),
    [farmer?.gps, farmer?.location]
  );

  const tableItems = useMemo<FarmerDetailHarvest[]>(() => {
    if (!farmer) return [];
    return activeTab === 'crops' ? farmer.harvests : farmer.cropDeposits;
  }, [activeTab, farmer]);

  const tableTotalPages = Math.max(1, Math.ceil(tableItems.length / tablePageSize));
  const visibleRows = tableItems.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  useEffect(() => {
    setTablePage(1);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
      </div>
    );
  }

  if (!farmer) return null;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.FARMERS)}
        className="inline-flex w-fit items-center gap-1 py-2 text-[12px] text-[rgba(44,51,57,0.95)] hover:opacity-80"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Farmers</span>
        <span className="opacity-40">/</span>
        <span className="text-[rgba(122,134,147,0.95)]">{farmer.name}</span>
      </button>

      {/* Profile Row */}
      <div className="flex items-stretch gap-6">
        {/* Profile Card */}
        <div className="flex flex-1 items-center gap-10 rounded-2xl bg-white px-8 py-6">
          <Avatar name={farmer.name} photo={farmer.photo} size="profile" />

          {/* Name + sub-info */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.48px] text-[#1b2559]">
                {farmer.name}
              </h1>
              <p className="text-[10px] capitalize text-[#392751]">
                Onboard Date{' '}
                <span className="font-semibold">{formatOnboardDate(farmer.onboardDate)}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-[7px] text-[12px] tracking-[-0.24px] text-[#98a2b3]">
                <UserRound className="h-4 w-4 shrink-0" />
                {farmer.accountCode || 'N/A'}
              </p>
              <p className="flex items-center gap-[7px] text-[12px] tracking-[-0.24px] text-[#98a2b3]">
                <MapPin className="h-4 w-4 shrink-0" />
                {farmer.location || 'N/A'}
              </p>
              <p className="flex items-center gap-[7px] text-[12px] tracking-[-0.24px] text-[#98a2b3]">
                <Mail className="h-4 w-4 shrink-0" />
                {farmer.email || 'N/A'}
              </p>
            </div>
          </div>

          {/* Credit Score — vertically centred by parent items-center */}
          {(() => {
            const c = getCreditColors(farmer.creditCategory);
            return (
              <div className="flex shrink-0 items-center gap-3 border-l border-[#EAECF0] pl-8">
                <Gauge className="h-6 w-6 shrink-0 text-[#141b34]" />
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-[#141b34]">Credit Score</p>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[16px] font-semibold"
                      style={{ color: c.scoreColor }}
                    >
                      {farmer.creditScore}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ backgroundColor: c.bgColor, color: c.textColor }}
                    >
                      {farmer.creditCategory}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Stats Card */}
        <div className="flex flex-1 items-stretch rounded-2xl bg-white">
          {/* Farm Size */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Farm Size/ha</p>
            <p className="text-[32px] font-semibold tracking-[-0.64px] text-[#1b2559]">
              {farmer.farmSize || 'N/A'}
            </p>
          </div>

          <div className="w-px self-stretch bg-[#EAECF0]" />

          {/* Crops/Livestock */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Crops/Livestock</p>
            <p className="text-[32px] font-semibold tracking-[-0.64px] text-[#1b2559]">
              {farmer.cropsLivestock || 'N/A'}
            </p>
          </div>

          <div className="w-px self-stretch bg-[#EAECF0]" />

          {/* Harvests */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Harvests</p>
            <p className="text-[32px] font-semibold tracking-[-0.64px] text-[#1b2559]">
              {farmer.harvests.length}
            </p>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="rounded-[20px] bg-white px-8 py-[29px]">
        {/* Heading */}
        <div className="mb-8 flex items-center gap-[10px] py-2">
          <h2 className="text-[20px] leading-8 tracking-[-0.4px] text-[#1b2559]">Information</h2>
          <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] tracking-[-0.24px] text-[#0a6054]">
            <Sparkles className="h-4 w-4" />
            AI
          </span>
        </div>

        {/* Detail columns + map */}
        <div className="flex items-stretch gap-5 px-4">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-6 capitalize text-[14px] leading-[16px]">
            <DetailRow label="Age" value={farmer.age} />
            <DetailRow label="Gender" value={farmer.gender} />
            <DetailRow label="Wife" value={farmer.wife} />
            <DetailRow label="Children" value={farmer.children} />
            <DetailRow label="Phone Number" value={farmer.contact} />
            <DetailRow label="Smartphone" value={farmer.smartphone} />
            <DetailRow label="GPS Stamp" value={farmer.gps} />
            <DetailRow label="Distribution Method" value={farmer.distributionMethod} />
            <DetailRow label="Farming Type" value={farmer.farmingType} />
            <DetailRow label="Pre. Retailer" value={farmer.preRetailer} />
            <DetailRow label="ID Type" value={farmer.idType} />
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-[#D0D5DD]" />

          {/* Right column */}
          <div className="flex flex-1 flex-col gap-6 capitalize text-[14px] leading-[16px]">
            <DetailRow label="Insurance" value={farmer.insurance} />
            <DetailRow label="Irrigation" value={farmer.irrigation} />
            <DetailRow label="Crops/Livestock" value={farmer.cropsLivestock} />
            <DetailRow label="Inputs" value={farmer.inputs} />
            <DetailRow label="Pre Production" value={farmer.preProduction} />
            <DetailRow label="Farm Size" value={farmer.farmSize} />
            <DetailRow label="Prev. Chemicals Used" value={farmer.previousChemicals} />
            <DetailRow label="Prev. Costs" value={farmer.previousCosts} />
            <DetailRow label="Farming Experience" value={farmer.farmingExperience} />
            <DetailRow label="Challenges" value={farmer.challenges} danger />
          </div>

          {/* Map */}
          <div className="w-[267px] shrink-0 overflow-hidden rounded-2xl border border-[#EAECF0]">
            {coordinates ? (
              <iframe
                title="Farmer location map"
                className="h-full w-full"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=14&output=embed`}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#F9FAFB] px-6 text-center text-sm text-[#667085]">
                Map preview is unavailable for this farmer
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Section */}
      <div className="rounded-lg bg-white py-4">
        <h2 className="px-8 py-2 text-[20px] leading-8 tracking-[-0.4px] text-[#1b2559]">Agent</h2>

        {farmer.agent ? (
          <div className="flex w-full items-center">
            {/* Avatar + Name */}
            <div className="flex w-[267px] shrink-0 items-center gap-2 pl-8 pr-4">
              <Avatar name={farmer.agent.name} photo={farmer.agent.photo} size="md" />
              <p className="truncate text-[16px] capitalize text-[#392751]">{farmer.agent.name}</p>
            </div>

            {/* Location */}
            <div className="flex w-[250px] shrink-0 items-center px-4">
              <p className="truncate text-[16px] capitalize text-[#392751]">
                {farmer.agent.location}
              </p>
            </div>

            {/* Phone */}
            <div className="flex w-[217px] shrink-0 items-center px-4">
              <p className="truncate text-[16px] text-[#392751]">{farmer.agent.phone}</p>
            </div>

            {/* View */}
            <div className="flex flex-1 items-center justify-end pr-8">
              <button
                type="button"
                className="text-[16px] capitalize text-[#0a6054] underline"
                onClick={() => navigate(ROUTES.AGENTS)}
              >
                View
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-8 rounded-lg border border-dashed border-[#D0D5DD] p-6 text-sm text-[#667085]">
            No agent linked to this farmer.
          </div>
        )}
      </div>

      {/* Farm Produce and Deposit Section */}
      <div className="rounded-2xl bg-white">
        {/* Section heading */}
        <div className="px-8 py-2">
          <h2 className="text-[20px] leading-8 tracking-[-0.4px] text-[#1b2559]">
            Farm produce and Deposit
          </h2>
        </div>

        {/* Tabs */}
        <div className="relative border-b border-[#98a2b3]/30 bg-[#f9fafb]">
          <div className="flex items-center gap-[18px] px-8 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('crops')}
              className={`border-b-2 px-[10px] py-[20px] text-[14px] leading-[16px] capitalize transition-colors ${
                activeTab === 'crops'
                  ? 'border-[#0a6054] font-medium text-[#1d2939]'
                  : 'border-transparent font-normal text-[#98a2b3]'
              }`}
            >
              Crops
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cropDeposits')}
              className={`border-b-2 px-[10px] py-[20px] text-[14px] leading-[16px] capitalize transition-colors ${
                activeTab === 'cropDeposits'
                  ? 'border-[#0a6054] font-medium text-[#1d2939]'
                  : 'border-transparent font-normal text-[#98a2b3]'
              }`}
            >
              Crop Deposits
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Table header */}
          <div className="flex w-full items-center justify-between py-1">
            <div className="flex flex-1 items-center gap-4 px-4">
              <div className="h-6 w-6 shrink-0 rounded border border-[#CBD5E1]" />
              <p className="text-[16px] capitalize text-[#392751]">Name</p>
            </div>
            <div className="flex-1 px-4">
              <p className="text-[16px] capitalize text-[#392751]">Crop Type</p>
            </div>
            <div className="flex-1 px-4">
              <p className="text-[16px] capitalize text-[#392751]">Harvest/Kg</p>
            </div>
            <div className="flex-1 px-4">
              <p className="text-[16px] capitalize text-[#392751]">Harvest Date</p>
            </div>
            <div className="w-[120px] shrink-0 px-4" />
          </div>

          {/* Table rows */}
          <div className="mt-2 flex flex-col gap-2">
            {visibleRows.length > 0 ? (
              visibleRows.map((item) => (
                <div
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-lg bg-[#f9fafb] py-4"
                >
                  <div className="flex flex-1 items-center gap-4 px-4">
                    <div className="h-6 w-6 shrink-0 rounded border border-[rgba(156,176,197,0.5)] bg-[#fafbfc] shadow-[inset_0px_1px_2px_1px_rgba(38,39,40,0.2)]" />
                    <div
                      style={{ width: 48, height: 48, minWidth: 48 }}
                      className="flex shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-xs font-semibold text-[#667085]"
                    >
                      {item.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p.charAt(0).toUpperCase())
                        .join('') || 'CR'}
                    </div>
                    <p className="text-[16px] capitalize text-[#392751]">{item.name}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-[16px] capitalize text-[#392751]">{item.cropType}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-[16px] text-[#392751]">{item.quantity}</p>
                  </div>
                  <div className="flex-1 px-4">
                    <p className="text-[16px] text-[#392751]">{item.harvestDate}</p>
                  </div>
                  <div className="flex w-[120px] shrink-0 items-center justify-end px-4">
                    <button
                      type="button"
                      className="text-[16px] capitalize text-[#0a6054] underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-[#667085]">No records available.</div>
            )}
          </div>

          <PaginationControls
            currentPage={tablePage}
            totalPages={tableTotalPages}
            pageSize={tablePageSize}
            totalItems={tableItems.length}
            showPageSize={false}
            showRange={false}
            className="mt-6 justify-end"
            activeButtonClassName="bg-[#D8F5EF] text-[#0A6054] border-[#D8F5EF]"
            inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
            onPageChange={setTablePage}
            onPageSizeChange={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
