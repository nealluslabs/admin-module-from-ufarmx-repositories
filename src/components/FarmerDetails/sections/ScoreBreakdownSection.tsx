import { BarChart3, TrendingUp, ShieldCheck, Clock } from 'lucide-react';
import { type FarmerDetail } from '@/services/farmer.service';

interface Props {
  farmer: FarmerDetail;
}

const getCreditColors = (category: string): { scoreColor: string; bgColor: string; textColor: string; label: string } => {
  const cat = category.toLowerCase();
  if (cat === 'good' || cat === 'high' || cat === 'excellent')
    return { scoreColor: '#059669', bgColor: '#D1FAE5', textColor: '#065F46', label: 'Good Standing' };
  if (cat === 'medium' || cat === 'average' || cat === 'fair')
    return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506', label: 'Average Standing' };
  if (cat === 'low' || cat === 'poor' || cat === 'bad')
    return { scoreColor: '#d92d20', bgColor: '#FEE4E2', textColor: '#d92d20', label: 'Needs Attention' };
  return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506', label: 'Not Rated' };
};

const scoreNum = (val: string): number => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : 0;
};

export function ScoreBreakdownSection({ farmer }: Props) {
  const c = getCreditColors(farmer.creditCategory);
  const score = scoreNum(farmer.creditScore);
  const pct = (score / 10) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Score Overview */}
      <div className="rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Score Breakdown</h3>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: c.bgColor, color: c.textColor }}
          >
            {c.label}
          </span>
        </div>

        <div className="flex items-center gap-12">
          {/* Circular score */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F2F4F7" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={c.scoreColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[28px] font-bold leading-none" style={{ color: c.scoreColor }}>
                {farmer.creditScore !== 'N/A' ? score.toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-[#98a2b3]">out of 10</span>
            </div>
          </div>

          {/* Score bars */}
          <div className="flex flex-1 flex-col gap-4">
            {[
              { label: 'Payment History', value: pct * 0.9 },
              { label: 'Farm Activity', value: pct * 0.75 },
              { label: 'Input Utilisation', value: pct * 0.85 },
              { label: 'Harvest Consistency', value: farmer.harvests.length > 0 ? Math.min(100, farmer.harvests.length * 25) : 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <p className="w-[160px] shrink-0 text-[13px] text-[#667085]">{item.label}</p>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F2F4F7]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${item.value}%`, backgroundColor: c.scoreColor }}
                  />
                </div>
                <p className="w-8 shrink-0 text-right text-[12px] font-medium text-[#344054]">
                  {Math.round(item.value)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History placeholder */}
      <div className="rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Score History</h3>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FAF8]">
            <TrendingUp className="h-8 w-8 text-[#0a6054]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#344054]">Score history coming soon</p>
            <p className="mt-1 text-[13px] text-[#98a2b3]">
              Historical credit score trends will appear here once data is collected.
            </p>
          </div>
        </div>

        {/* Placeholder metrics row */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#F2F4F7] pt-6">
          {[
            { icon: ShieldCheck, label: 'Risk Level', value: farmer.creditCategory || 'N/A' },
            { icon: BarChart3, label: 'Data Points', value: `${farmer.harvests.length + farmer.cropDeposits.length}` },
            { icon: Clock, label: 'Last Updated', value: 'Pending' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-[#F9FAFB] px-4 py-4">
              <Icon className="h-5 w-5 text-[#98a2b3]" />
              <p className="text-[11px] text-[#98a2b3]">{label}</p>
              <p className="text-[15px] font-semibold capitalize text-[#1b2559]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
