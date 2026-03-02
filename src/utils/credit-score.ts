export type CreditCategory = 'Good' | 'Medium' | 'Low' | 'N/A';

export interface CreditCategoryPalette {
  scoreColor: string;
  bgColor: string;
  textColor: string;
  label: string;
}

const GOOD_SET = new Set(['good', 'high', 'excellent']);
const MEDIUM_SET = new Set(['medium', 'average', 'fair']);
const LOW_SET = new Set(['low', 'poor', 'bad']);

export const normalizeScore = (value: unknown): number | null => {
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed)) return null;
  return Math.min(10, Math.max(0, parsed));
};

export const deriveCreditCategory = (
  score?: number | null,
  rawCategory?: string | null
): CreditCategory => {
  if (typeof score === 'number' && Number.isFinite(score)) {
    if (score >= 7) return 'Good';
    if (score >= 4) return 'Medium';
    return 'Low';
  }

  const normalizedCategory = String(rawCategory || '').trim().toLowerCase();
  if (GOOD_SET.has(normalizedCategory)) return 'Good';
  if (MEDIUM_SET.has(normalizedCategory)) return 'Medium';
  if (LOW_SET.has(normalizedCategory)) return 'Low';

  return 'N/A';
};

export const getCreditCategoryPalette = (category: CreditCategory): CreditCategoryPalette => {
  switch (category) {
    case 'Good':
      return { scoreColor: '#059669', bgColor: '#D1FAE5', textColor: '#065F46', label: 'Good Standing' };
    case 'Medium':
      return { scoreColor: '#df8506', bgColor: '#ffe0b8', textColor: '#df8506', label: 'Average Standing' };
    case 'Low':
      return { scoreColor: '#d92d20', bgColor: '#FEE4E2', textColor: '#d92d20', label: 'Needs Attention' };
    case 'N/A':
    default:
      return { scoreColor: '#667085', bgColor: '#F2F4F7', textColor: '#475467', label: 'Not Rated' };
  }
};
