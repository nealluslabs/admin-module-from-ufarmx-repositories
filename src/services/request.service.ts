import api from '@/lib/api';

export interface RequestListItem {
  id: string;
  requestType: string;
  retailerName: string;
  farmerName: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  invoiceUrl?: string;
  offerLetterUrl?: string;
  requestedTenorWeeks?: number;
}

export interface RequestListResponse {
  requests: RequestListItem[];
  page: number;
  pages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RequestDetail {
  _id: string;
  retailer_id?: string;
  requestType?: string;
  status: string;
  farmerName: string;
  farmerPhone?: string;
  farmerEmail?: string;
  farmer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    creditScore?: number;
    creditScoreCategory?: string;
  } | null;
  retailer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  financingDetails?: {
    tenor: number;
    paymentFrequency?: string;
    interestRate: number;
    productPrice: number;
    interest: number;
    totalAmount: number;
    numberOfPayments: number;
  };
  paymentSchedule?: Array<{
    paymentNumber: number;
    dueDate: string;
    amount: number;
    paidAmount?: number;
    status: string;
    paidAt?: string;
  }>;
  products: Array<{
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  note?: string;
  rejectionReason?: string;
  downPaymentAmount?: number;
  remainingAmount?: number;
  requestedTenorWeeks?: number;
  approvedTenorWeeks?: number;
  coveragePercent?: number;
  farmerLetterImageUrl?: string;
  totalAmount?: string | number;
  invoice?: string;
  offerLetterUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestAdminNote {
  _id: string;
  requestId: string;
  authorType: 'admin';
  authorUserId?:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestAuditEntry {
  _id: string;
  requestId: string;
  actorType: 'admin' | 'retailer' | 'system';
  actorUserId?:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  action: string;
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const asText = (value: unknown, fallback = 'N/A'): string => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const toRetailerName = (request: any): string => {
  const retailer = request?.retailer;
  if (retailer && typeof retailer === 'object') {
    const firstName = asText(retailer.firstName, '').trim();
    const lastName = asText(retailer.lastName, '').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    return asText(retailer.email, 'N/A');
  }
  return 'N/A';
};

export const requestService = {
  getRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<RequestListResponse> => {
    const response = await api.get('/requests/admin', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status || undefined,
        search: params?.search || undefined,
      },
    });

    const data = response.data?.data || {};
    const requests: any[] = data.requests || [];
    const page = Number(data.page || params?.page || 1);
    const pages = Number(data.pages || 1);
    const totalCount = Number(data.total || data.totalCount || 0);

    const normalized = requests
      .map((request) => ({
        id: asText(request._id, ''),
        requestType: asText(request.requestType, 'N/A'),
        retailerName: toRetailerName(request),
        farmerName: asText(request.farmerName, 'N/A'),
        status: asText(request.status, 'N/A'),
        totalAmount: asText(
          request.financingDetails?.totalAmount ?? request.totalAmount,
          'N/A'
        ),
        createdAt: asText(request.createdAt, ''),
        invoiceUrl: asText(request.invoice, ''),
        offerLetterUrl: asText(request.offerLetterUrl, ''),
        requestedTenorWeeks:
          typeof request.requestedTenorWeeks === 'number'
            ? request.requestedTenorWeeks
            : undefined,
      }))
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

    return {
      requests: normalized,
      page,
      pages,
      totalCount,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    };
  },

  getRequestById: async (id: string): Promise<RequestDetail> => {
    const response = await api.get(`/requests/${id}/details`);
    return response.data?.data;
  },

  moveToReview: async (requestId: string) => {
    const response = await api.post(`/requests/${requestId}/review`);
    return response.data?.data;
  },

  approveRequest: async (
    requestId: string,
    payload: { coveragePercent: number; approvedTenorWeeks: number; note?: string }
  ) => {
    const response = await api.post(`/requests/${requestId}/approve`, payload);
    return response.data?.data;
  },

  rejectRequest: async (
    requestId: string,
    payload: { reason: string; note?: string }
  ) => {
    const response = await api.post(`/requests/${requestId}/reject`, payload);
    return response.data?.data;
  },

  getRequestNotes: async (requestId: string): Promise<RequestAdminNote[]> => {
    const response = await api.get(`/requests/${requestId}/notes`);
    return response.data?.data || [];
  },

  addRequestNote: async (requestId: string, note: string): Promise<RequestAdminNote> => {
    const response = await api.post(`/requests/${requestId}/notes`, { note });
    return response.data?.data;
  },

  getRequestAuditTrail: async (
    requestId: string,
    params?: { limit?: number }
  ): Promise<RequestAuditEntry[]> => {
    const response = await api.get(`/requests/${requestId}/audit-trail`, {
      params: {
        limit: params?.limit ?? 100,
      },
    });
    return response.data?.data || [];
  },
};
