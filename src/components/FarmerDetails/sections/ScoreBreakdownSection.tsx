import { useMemo, useState } from 'react';
import { BarChart3, Clock, Eye, ShieldCheck, TrendingUp } from 'lucide-react';
import { type FarmerDetail } from '@/services/farmer.service';
import { type FarmerCreditScoreEvent } from '@/services/credit-score.service';
import { deriveCreditCategory, getCreditCategoryPalette, normalizeScore } from '@/utils/credit-score';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  farmer: FarmerDetail;
  latestScore: FarmerCreditScoreEvent | null;
  scoreHistory: FarmerCreditScoreEvent[];
  onRecalculate: () => void;
  isRecalculating: boolean;
}

const formatReason = (reason: string): string =>
  reason
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const MAX_VISIBLE_TEXT_LENGTH = 140;

const sanitizeLongString = (value: string): string => {
  const trimmed = value.trim();
  const isImageDataUri = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmed);
  const isGenericDataUri = /^data:[^;]+;base64,/i.test(trimmed);

  if (isImageDataUri) return '[Image uploaded: base64 hidden]';
  if (isGenericDataUri) return '[File uploaded: base64 hidden]';

  if (trimmed.length > MAX_VISIBLE_TEXT_LENGTH) {
    return `${trimmed.slice(0, 80)}... [truncated ${trimmed.length} chars]`;
  }

  return trimmed;
};

const formatResponseValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'Not answered';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Not answered';
    return value
      .map((entry) => (typeof entry === 'string' ? sanitizeLongString(entry) : String(entry)))
      .join(', ');
  }
  if (typeof value === 'string') return sanitizeLongString(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, (_, nestedValue) =>
        typeof nestedValue === 'string' ? sanitizeLongString(nestedValue) : nestedValue
      );
    } catch {
      return 'Complex value';
    }
  }
  return String(value);
};

export function ScoreBreakdownSection({
  farmer,
  latestScore,
  scoreHistory,
  onRecalculate,
  isRecalculating,
}: Props) {
  const [selectedEvent, setSelectedEvent] = useState<FarmerCreditScoreEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const history = useMemo(() => scoreHistory || [], [scoreHistory]);

  const score = normalizeScore(latestScore?.total_score) ?? 0;
  const category = deriveCreditCategory(
    latestScore?.total_score,
    latestScore ? undefined : farmer.creditCategory
  );
  const c = getCreditCategoryPalette(category);
  const pct = (score / 10) * 100;

  const openBreakdownModal = (event: FarmerCreditScoreEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
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
                {latestScore ? score.toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-[#98a2b3]">out of 10</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {[
              { label: 'Payment History', value: pct * 0.9 },
              { label: 'Farm Activity', value: pct * 0.75 },
              { label: 'Input Utilisation', value: pct * 0.85 },
              {
                label: 'Harvest Consistency',
                value: farmer.harvests.length > 0 ? Math.min(100, farmer.harvests.length * 25) : 0,
              },
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

        <div className="mt-6 flex items-center justify-end gap-2">
          {latestScore ? (
            <button
              type="button"
              onClick={() => openBreakdownModal(latestScore)}
              className="inline-flex items-center gap-1 rounded-md border border-[#90C434] bg-[#F7FCEB] px-3 py-1.5 text-[12px] font-medium text-[#0a6054]"
            >
              <Eye className="h-3.5 w-3.5" />
              See Score Breakdown
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="rounded-md border border-[#0a6054] px-3 py-1.5 text-[12px] font-medium text-[#0a6054] disabled:opacity-50"
          >
            {isRecalculating ? 'Recalculating...' : 'Recalculate Score'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Score History</h3>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FAF8]">
              <TrendingUp className="h-8 w-8 text-[#0a6054]" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-[#344054]">No score history yet</p>
              <p className="mt-1 text-[13px] text-[#98a2b3]">Recalculate to generate a new immutable score event.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center bg-[#F9FAFB] px-4 py-3 text-[12px] font-medium text-[#344054]">
              <p>Created</p>
              <p>Score</p>
              <p>Version</p>
              <p>Reason</p>
              <p className="text-right">Action</p>
            </div>
            <div className="divide-y divide-[#EAECF0]">
              {history.map((event) => (
                <div
                  key={event._id}
                  className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 text-[13px] text-[#392751]"
                >
                  <p>{new Date(event.createdAt).toLocaleString()}</p>
                  <p className="font-medium">{event.total_score.toFixed(2)} / 10</p>
                  <p>v{event.calculator_version}</p>
                  <p className="capitalize">{formatReason(event.reason)}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openBreakdownModal(event)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#D0D5DD] px-2.5 py-1 text-[12px] text-[#0A6054] hover:bg-[#F7FCEB]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      See Score Breakdown
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#F2F4F7] pt-6">
          {[
            { icon: ShieldCheck, label: 'Risk Level', value: category || 'N/A' },
            {
              icon: BarChart3,
              label: 'Data Points',
              value: String(latestScore?.breakdown.length || 0),
            },
            {
              icon: Clock,
              label: 'Last Updated',
              value: latestScore?.createdAt ? new Date(latestScore.createdAt).toLocaleDateString() : 'N/A',
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-[#F9FAFB] px-4 py-4">
              <Icon className="h-5 w-5 text-[#98a2b3]" />
              <p className="text-[11px] text-[#98a2b3]">{label}</p>
              <p className="text-[15px] font-semibold capitalize text-[#1b2559]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden rounded-2xl border border-[#EAECF0] bg-[#FFFFFF] p-0">
          <DialogHeader className="border-b border-[#EAECF0] bg-[linear-gradient(90deg,#F7FCEB_0%,#F0FAF8_100%)] px-6 py-5">
            <DialogTitle className="text-[20px] font-semibold text-[#1b2559]">Score Breakdown</DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              {selectedEvent
                ? `Version v${selectedEvent.calculator_version} • ${new Date(selectedEvent.createdAt).toLocaleString()}`
                : 'Score details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 overflow-y-auto px-6 py-5">
            {selectedEvent ? (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg bg-[#F9FAFB] p-3">
                    <p className="text-[11px] text-[#667085]">Total Score</p>
                    <p className="text-[18px] font-semibold text-[#0A6054]">{selectedEvent.total_score.toFixed(2)} / 10</p>
                  </div>
                  <div className="rounded-lg bg-[#F9FAFB] p-3">
                    <p className="text-[11px] text-[#667085]">Form Raw Score</p>
                    <p className="text-[18px] font-semibold text-[#1b2559]">{selectedEvent.form_raw_score.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-[#F9FAFB] p-3">
                    <p className="text-[11px] text-[#667085]">Form Max Score</p>
                    <p className="text-[18px] font-semibold text-[#1b2559]">{selectedEvent.form_max_score.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-[#F9FAFB] p-3">
                    <p className="text-[11px] text-[#667085]">Reason</p>
                    <p className="text-[16px] font-semibold text-[#1b2559]">{formatReason(selectedEvent.reason)}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
                  <div className="grid grid-cols-[1.2fr_1.4fr_0.6fr_1fr] items-center bg-[#F9FAFB] px-4 py-3 text-[12px] font-medium text-[#344054]">
                    <p>Field</p>
                    <p>Response</p>
                    <p>Points</p>
                    <p>Notes</p>
                  </div>
                  <div className="max-h-[44vh] divide-y divide-[#EAECF0] overflow-y-auto">
                    {selectedEvent.breakdown.map((item, idx) => (
                      <div
                        key={`${item.fieldName}-${idx}`}
                        className="grid grid-cols-[1.2fr_1.4fr_0.6fr_1fr] items-start px-4 py-3 text-[13px] text-[#392751]"
                      >
                        <div>
                          <p className="font-medium text-[#1b2559]">{item.fieldLabel || item.fieldName}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#98A2B3]">
                            {item.fieldType.replaceAll('_', ' ')}
                          </p>
                        </div>
                        <p className="break-all text-[#475467]">{formatResponseValue(item.responseValue)}</p>
                        <p className="font-medium text-[#0A6054]">
                          {item.awardedPoints.toFixed(2)} / {item.maxPoints.toFixed(2)}
                        </p>
                        <p className="text-[#667085]">{item.notes || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
