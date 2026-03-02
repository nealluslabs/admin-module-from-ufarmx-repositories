import { Mail, MapPin, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type FarmerDetail } from '@/services/farmer.service';
import { ROUTES } from '@/utils/routes';

const parseCoordinates = (value: string): { lat: number; lng: number } | null => {
  if (!value || value === 'N/A') return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
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
        style={{ width: 48, height: 48, minWidth: 48 }}
        className="flex shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-xs font-semibold text-[#667085]"
      >
        {initials || 'FM'}
      </div>
    );
  }

  return (
    <div style={{ width: 48, height: 48, minWidth: 48 }} className="shrink-0 overflow-hidden rounded-full">
      <img src={photo} alt={name} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex w-full items-start justify-between">
      <p className={`min-w-0 flex-1 text-[14px] font-medium capitalize leading-[16px] ${danger ? 'text-[#d92d20]' : 'text-[#392751]'}`}>
        {label}
      </p>
      <p className={`min-w-0 flex-1 text-[14px] leading-[16px] ${danger ? 'text-[#475467]' : 'text-[#392751]'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

interface Props {
  farmer: FarmerDetail;
}

export function FarmerInformationSection({ farmer }: Props) {
  const navigate = useNavigate();
  const coordinates = parseCoordinates(farmer.gps || farmer.location || '');

  return (
    <div className="flex flex-col gap-4">
      {/* Information Card */}
      <div className="rounded-[20px] bg-white px-8 py-7">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Information</h3>
          <span className="flex items-center gap-1 rounded-md bg-[#F0FAF8] px-2 py-0.5 text-[11px] font-medium text-[#0a6054]">
            AI
          </span>
        </div>

        <div className="flex items-stretch gap-5">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-5 text-[14px] leading-[16px]">
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

          <div className="w-px self-stretch bg-[#D0D5DD]" />

          {/* Right column */}
          <div className="flex flex-1 flex-col gap-5 text-[14px] leading-[16px]">
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
              <div className="flex h-full min-h-[300px] items-center justify-center bg-[#F9FAFB] px-6 text-center text-sm text-[#667085]">
                Map preview unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Card */}
      <div className="rounded-2xl bg-white py-5">
        <h3 className="mb-3 px-8 text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Agent</h3>

        {farmer.agent ? (
          <div className="flex w-full items-center px-8">
            <div className="flex w-[267px] shrink-0 items-center gap-3">
              <Avatar name={farmer.agent.name} photo={farmer.agent.photo} />
              <p className="truncate text-[15px] font-medium capitalize text-[#392751]">{farmer.agent.name}</p>
            </div>
            <div className="flex w-[250px] shrink-0 items-center">
              <div className="flex items-center gap-2 text-[14px] text-[#667085]">
                <MapPin className="h-4 w-4 shrink-0 text-[#98a2b3]" />
                {farmer.agent.location}
              </div>
            </div>
            <div className="flex w-[217px] shrink-0 items-center">
              <div className="flex items-center gap-2 text-[14px] text-[#667085]">
                <UserRound className="h-4 w-4 shrink-0 text-[#98a2b3]" />
                {farmer.agent.phone}
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end">
              <button
                type="button"
                className="rounded-lg border border-[#0a6054] px-4 py-1.5 text-[13px] font-medium text-[#0a6054] transition-colors hover:bg-[#F0FAF8]"
                onClick={() => navigate(ROUTES.AGENTS)}
              >
                View Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-8 flex items-center gap-3 rounded-xl border border-dashed border-[#D0D5DD] px-6 py-8 text-[#667085]">
            <Mail className="h-5 w-5 shrink-0 text-[#98a2b3]" />
            <span className="text-sm">No agent is linked to this farmer.</span>
          </div>
        )}
      </div>
    </div>
  );
}
