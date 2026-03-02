import api from '@/lib/api';

export interface LoanListItem {
  _id: string;
  requestId?: {
    _id?: string;
    farmerName?: string;
    status?: string;
    requestType?: string;
    createdAt?: string;
  } | null;
  retailerUserId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  retailerId?: {
    _id?: string;
    businessName?: string;
  } | null;
  farmerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  principalAmount: number;
  disbursedAmount: number;
  approvedTenorWeeks: number;
  status: string;
  disbursedAt?: string;
  createdAt?: string;
  coveragePercent?: number;
  disbursementReference ?: string;
  disbursementNote?: string;
}

export interface LoanListResponse {
  loans: LoanListItem[];
  page: number;
  pages: number;
  total: number;
}

export interface LoanInstallment {
  _id: string;
  leg: 'retailer_to_platform' | 'farmer_to_retailer';
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
  paidAt?: string;
}

export interface LoanTransaction {
  _id: string;
  type: 'disbursement' | 'repayment';
  leg: 'platform_to_retailer' | 'retailer_to_platform' | 'farmer_to_retailer';
  amount: number;
  reference?: string;
  note?: string;
  status: string;
  createdAt: string;
}

export interface LoanDetailsResponse {
  loan: LoanListItem;
  installments: LoanInstallment[];
  transactions: LoanTransaction[];
}

export interface MarkInstallmentPaidPayload {
  paidDate: string;
  reference: string;
  note?: string;
}

export const loanService = {
  async getLoans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<LoanListResponse> {
    const response = await api.get('/loans/admin', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search || undefined,
        status: params?.status || undefined,
      },
    });

    return response.data?.data;
  },

  async getLoanDetails(id: string): Promise<LoanDetailsResponse> {
    const response = await api.get(`/loans/${id}/details`);
    return response.data?.data;
  },

  async markRetailerInstallmentPaid(
    loanId: string,
    installmentId: string,
    payload: MarkInstallmentPaidPayload
  ): Promise<LoanDetailsResponse> {
    const response = await api.put(
      `/loans/${loanId}/installments/${installmentId}/mark-paid`,
      payload
    );
    return response.data?.data;
  },
};
