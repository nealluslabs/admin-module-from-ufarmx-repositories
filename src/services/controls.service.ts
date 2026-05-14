import api from '@/lib/api';


export type TierRange = {
  min?: number;
  max?: number;
};

export type TierGroup = {
  gold?: TierRange;
  silver?: TierRange;
  bronze?: TierRange;
  basic?: TierRange;
};

export type InterestRate = {
  rate?: number;
};

export type CreditCap = {
  maxCreditLimit?: number;
  maxSingleTransaction?: number;
};

export type CreditCapGroup = {
  gold?: CreditCap;
  silver?: CreditCap;
  bronze?: CreditCap;
  basic?: CreditCap;
};

export interface CreditCapsControls {
  _id: string;
  id?: string;

  /**
   * Common
   */

  name?: 'credit_tiers' | 'credit_caps' | 'interest_rates';

  createdAt?: string;
  updatedAt?: string | null;

  updatedBy?: string | null;


  /**
   * CREDIT CAPS
   */

  retailersCreditCaps?: CreditCapGroup;
}


export interface CreditTiersControls {
  _id: string;
  id?: string;

  /**
   * Common
   */

  name?: 'credit_tiers';

  createdAt?: string;
  updatedAt?: string | null;

  updatedBy?: string | null;

  /**
   * CREDIT TIERS
   */

  farmers?: TierGroup;
  retailers?: TierGroup;

 
}



export interface InterestRatesControls {
  _id: string;
  id?: string;

  /**
   * Common
   */

  name?:'interest_rates';

  createdAt?: string;
  updatedAt?: string | null;

  updatedBy?: string | null;

  /**
   * INTEREST RATES
   */

  farmers?: InterestRate;
  retailers?: InterestRate;

}



export const controlsService = {


  




  updateCreditCaps: async (id: string, data:any): Promise<CreditCapsControls> => {
    try {
      const response = await api.put(`/controls/creditcaps/:${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating credit caps:', error);
      throw error;
    }
  },

  updateCreditTiers: async (id: string, data: any): Promise<any> => {
    try {
      const response = await api.put(`/controls/credittiers/:${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating credit tiers:', error);
      throw error;
    }
  },

  updateInterest: async (id: string, data: any): Promise<any> => {
    try {
      const response = await api.put(`/controls/interestrates/:${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating interest rates:', error);
      throw error;
    }
  },



 


};
