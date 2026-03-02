import { User, Wheat, BarChart3, Inbox } from 'lucide-react';
import { type FarmerDetail } from '@/services/farmer.service';
import { type FarmerCreditScoreEvent } from '@/services/credit-score.service';
import { FarmerInformationSection } from './sections/FarmerInformationSection';
import { FarmProduceSection } from './sections/FarmProduceSection';
import { ScoreBreakdownSection } from './sections/ScoreBreakdownSection';
import { RequestsSection } from './sections/RequestsSection';

export type FarmerTab = 'information' | 'produce' | 'score' | 'requests';

const TABS: { id: FarmerTab; label: string; icon: React.ElementType }[] = [
  { id: 'information', label: 'Farmer Information', icon: User },
  { id: 'produce',     label: 'Farm Produce',        icon: Wheat },
  { id: 'score',       label: 'Score & History',     icon: BarChart3 },
  { id: 'requests',    label: 'Requests',             icon: Inbox },
];

interface Props {
  farmer: FarmerDetail;
  latestScore: FarmerCreditScoreEvent | null;
  scoreHistory: FarmerCreditScoreEvent[];
  onRecalculate: () => void;
  isRecalculating: boolean;
  activeTab: FarmerTab;
  onTabChange: (tab: FarmerTab) => void;
}

export function FarmerDetailTabs({
  farmer,
  latestScore,
  scoreHistory,
  onRecalculate,
  isRecalculating,
  activeTab,
  onTabChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab Bar ── */}
      <div className="relative rounded-2xl bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeTab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className="relative flex items-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-medium transition-all duration-200"
                style={
                  isActive
                    ? {
                        backgroundColor: '#0a6054',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(10,96,84,0.30)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: '#98a2b3',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F0FAF8';
                    (e.currentTarget as HTMLButtonElement).style.color = '#0a6054';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#98a2b3';
                  }
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: isActive ? '#90C434' : 'currentColor' }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Section ── */}
      {activeTab === 'information' && <FarmerInformationSection farmer={farmer} />}
      {activeTab === 'produce'     && <FarmProduceSection farmer={farmer} />}
      {activeTab === 'score' && (
        <ScoreBreakdownSection
          farmer={farmer}
          latestScore={latestScore}
          scoreHistory={scoreHistory}
          onRecalculate={onRecalculate}
          isRecalculating={isRecalculating}
        />
      )}
      {activeTab === 'requests'    && <RequestsSection />}
    </div>
  );
}
