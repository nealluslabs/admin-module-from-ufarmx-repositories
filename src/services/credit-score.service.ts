import api from '@/lib/api';

export type CreditScoreRuleType =
  | 'open_ended'
  | 'single_choice'
  | 'multi_choice'
  | 'number_range'
  | 'not_applicable';

export interface CreditScoreOptionRule {
  value: string;
  points: number;
}

export interface CreditScoreRangeRule {
  min: number;
  max: number;
  points: number;
}

export interface CreditScoreFieldRule {
  fieldName: string;
  fieldLabel?: string;
  fieldType: CreditScoreRuleType;
  openEndedPoints?: number;
  optionPoints?: CreditScoreOptionRule[];
  ranges?: CreditScoreRangeRule[];
  notes?: string;
}

export interface CreditScoreCalculatorPayload {
  name: string;
  description?: string;
  setActive?: boolean;
  applyToExistingFarmers?: boolean;
  config: {
    form: {
      enabled: boolean;
      formId?: string;
      formVersion?: number;
      rules: CreditScoreFieldRule[];
    };
    external: {
      creditBureau: {
        enabled: boolean;
        status: 'not_applicable' | 'active';
        weight: number;
      };
      bankTransactions: {
        enabled: boolean;
        status: 'not_applicable' | 'active';
        weight: number;
      };
    };
  };
}

export interface FarmerCreditScoreEvent {
  _id: string;
  total_score: number;
  form_raw_score: number;
  form_max_score: number;
  calculator_version: number;
  reason: string;
  createdAt: string;
  breakdown: Array<{
    fieldName: string;
    fieldLabel?: string;
    fieldType: CreditScoreRuleType;
    responseValue: unknown;
    awardedPoints: number;
    maxPoints: number;
    notes?: string;
  }>;
}

export const creditScoreService = {
  getCalculatorVersions: async () => {
    const response = await api.get('/credit-scores/calculators');
    return response.data.data;
  },

  getActiveCalculatorVersion: async () => {
    const response = await api.get('/credit-scores/calculators/active');
    return response.data.data;
  },

  createCalculatorVersion: async (payload: CreditScoreCalculatorPayload) => {
    const response = await api.post('/credit-scores/calculators', payload);
    return response.data.data;
  },

  getFarmerLatestScore: async (farmerId: string): Promise<FarmerCreditScoreEvent | null> => {
    const response = await api.get(`/credit-scores/farmers/${farmerId}/latest`);
    return response.data.data || null;
  },

  getFarmerScoreHistory: async (farmerId: string, limit = 20): Promise<FarmerCreditScoreEvent[]> => {
    const response = await api.get(`/credit-scores/farmers/${farmerId}/history`, {
      params: { limit },
    });
    return response.data.data || [];
  },

  recalculateFarmerScore: async (farmerId: string) => {
    const response = await api.post(`/credit-scores/farmers/${farmerId}/recalculate`);
    return response.data.data;
  },
};
