import api from '@/lib/api';

export interface RequestListItem {
  id: string;
  requestType: string;
  retailerName: string;
  farmerName: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

export interface RequestListResponse {
  requests: RequestListItem[];
  page: number;
  pages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
};
