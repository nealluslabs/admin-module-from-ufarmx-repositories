import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gauge, Mail, MapPin, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerService, type FarmerDetail } from '@/services/farmer.service';
import { ROUTES } from '@/utils/routes';
import { FarmerDetailTabs, type FarmerTab } from '@/components/FarmerDetails/FarmerDetailTabs';

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

const getCreditColors = (category: string) => {
  const cat = category.toLowerCase();
  if (cat === 'good' || cat === 'high' || cat === 'excellent')
    return { scoreColor: '#059669', bgColor: '#D1FAE5', textColor: '#065F46' };
  if (cat === 'medium' || cat === 'average' || cat === 'fair')
    return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506' };
  if (cat === 'low' || cat === 'poor' || cat === 'bad')
    return { scoreColor: '#d92d20', bgColor: '#FEE4E2', textColor: '#d92d20' };
  return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506' };
};

function Avatar({ name, photo }: { name: string; photo?: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  if (!photo) {
    return (
      <div
        style={{ width: 130, height: 130, minWidth: 130 }}
        className="flex shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-2xl font-semibold text-[#667085]"
      >
        {initials || 'FM'}
      </div>
    );
  }

  return (
    <div style={{ width: 130, height: 130, minWidth: 130 }} className="shrink-0 overflow-hidden rounded-full">
      <img src={photo} alt={name} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export default function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FarmerTab>('information');

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

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
      </div>
    );
  }

  if (!farmer) return null;

  const creditColors = getCreditColors(farmer.creditCategory);

  return (
    <div className="flex flex-col gap-4 pb-6">
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

      {/* ── Top Row: Profile + Stats ── */}
      <div className="flex items-stretch gap-6">
        {/* Profile Card */}
        <div className="flex flex-1 items-center gap-10 rounded-2xl bg-white px-8 py-6">
          <Avatar name={farmer.name} photo={farmer.photo} />

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

          {/* Credit Score */}
          <div className="flex shrink-0 items-center gap-3 border-l border-[#EAECF0] pl-8">
            <Gauge className="h-6 w-6 shrink-0 text-[#141b34]" />
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-[#141b34]">Credit Score</p>
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold" style={{ color: creditColors.scoreColor }}>
                  {farmer.creditScore}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ backgroundColor: creditColors.bgColor, color: creditColors.textColor }}
                >
                  {farmer.creditCategory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="flex flex-1 items-stretch rounded-2xl bg-white">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-6">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Farm Size/ha</p>
            <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#1b2559]">
              {farmer.farmSize || 'N/A'}
            </p>
          </div>
          <div className="w-px self-stretch bg-[#EAECF0]" />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-6">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Crops/Livestock</p>
            <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#1b2559]">
              {farmer.cropsLivestock || 'N/A'}
            </p>
          </div>
          <div className="w-px self-stretch bg-[#EAECF0]" />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-6">
            <p className="whitespace-nowrap text-[12px] leading-5 tracking-[-0.24px] text-[#667085]">Harvests</p>
            <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#1b2559]">
              {farmer.harvests.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabbed Sections ── */}
      <FarmerDetailTabs
        farmer={farmer}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
