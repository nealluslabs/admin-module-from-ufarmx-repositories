import api from '@/lib/api';

export interface Retailer {
  _id: string;
  retailer_user_id?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  companyName?: string;
  storeName?: string;
  email?: string;
  companyEmail?: string;
  phone?: string;
  phoneNumber?: string;
  state?: string;
  location?: string;
  is_active?: boolean;
  createdAt?: string;
  middleName?: string;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
  currentState?: string;
  currentLocalGovernment?: string;
  stateOfOrigin?: string;
  localGovernmentOfOrigin?: string;
  nearestLandmark?: string;
  businessAddress?: string;
  localGovernment?: string;
  yearsInBusiness?: string;
  shopOwnership?: string;
  shopSize?: string;
  utilityType?: string;
  meansOfId?: string;
  meterNumber?: string;
  nin?: string;
  country?: string;
  companyAddress?: string;
  contactPerson?: string;
  proofOfAddress?: unknown;
  utilityBill?: unknown;
  idDocument?: unknown;
  shopPhotos?: unknown;
  photoUrl?: string;
  user?: {
    _id?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    profilePicture?: string;
    photo?: string;
  };
}

export interface RetailerListItem {
  id: string;
  name: string;
  photo: string;
  business: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface RetailerListResponse {
  retailers: RetailerListItem[];
  page: number;
  pages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RetailerDetail {
  id: string;
  userId: string;
  name: string;
  photo: string;
  business: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  middleName: string;
  gender: string;
  nationality: string;
  dateOfBirth: string;
  address: string;
  currentState: string;
  currentLocalGovernment: string;
  stateOfOrigin: string;
  localGovernmentOfOrigin: string;
  nearestLandmark: string;
  businessAddress: string;
  localGovernment: string;
  yearsInBusiness: string;
  shopOwnership: string;
  shopSize: string;
  utilityType: string;
  meansOfId: string;
  meterNumber: string;
  nin: string;
  proofOfAddress: string;
  utilityBill: string;
  idDocument: string;
  shopPhotos: string;
  proofOfAddressRaw: string;
  utilityBillRaw: string;
  idDocumentRaw: string;
  shopPhotosRaw: string;
}

export interface RetailerFarmerItem {
  id: string;
  createdAt: string;
  name: string;
  farmerId: string;
  age: string;
  location: string;
  contact: string;
}

export interface RetailerProductItem {
  id: string;
  createdAt: string;
  name: string;
  image: string;
  category: string;
  price: string;
  quantity: string;
  status: string;
}

export interface RetailerRequestItem {
  id: string;
  requestType: string;
  farmerName: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

export interface PaginatedRetailerRequests {
  requests: RetailerRequestItem[];
  page: number;
  pages: number;
  totalCount: number;
}

export interface PaginatedRetailerProducts {
  products: RetailerProductItem[];
  page: number;
  pages: number;
  totalCount: number;
}

const asText = (value: unknown, fallback = 'N/A'): string => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const formatAssetField = (value: unknown): string => {
  const text = asText(value, 'N/A').trim();
  if (text === 'N/A') return text;
  if (text.startsWith('data:')) return 'Uploaded file';
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

const toAssetRaw = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate =
      record.url ||
      record.fileUrl ||
      record.secure_url ||
      record.location ||
      record.path ||
      '';
    return typeof candidate === 'string' ? candidate.trim() : '';
  }
  return '';
};

const toRetailerListItem = (retailer: Retailer): RetailerListItem => {
  const firstName = asText(retailer.firstName, '').trim();
  const lastName = asText(retailer.lastName, '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: retailer._id,
    name: fullName || 'Unknown Retailer',
    photo: asText(retailer.photoUrl || retailer.user?.profilePicture || retailer.user?.photo, ''),
    business:
      asText(retailer.businessName, '').trim() ||
      asText(retailer.companyName, '').trim() ||
      asText(retailer.storeName, '').trim() ||
      'N/A',
    email:
      asText(retailer.email, '').trim() ||
      asText(retailer.companyEmail, '').trim() ||
      'N/A',
    phone:
      asText(retailer.phoneNumber, '').trim() ||
      asText(retailer.phone, '').trim() ||
      'N/A',
    location:
      asText(retailer.location, '').trim() ||
      asText(retailer.state, '').trim() ||
      'N/A',
    status: retailer.is_active ? 'Active' : 'Inactive',
    createdAt: retailer.createdAt || '',
  };
};

const toRetailerDetail = (retailer: Retailer): RetailerDetail => {
  const firstName = asText(retailer.firstName, '').trim();
  const lastName = asText(retailer.lastName, '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: retailer._id,
    userId: asText(retailer.retailer_user_id || retailer.user?._id, ''),
    name: fullName || 'Unknown Retailer',
    photo: asText(retailer.photoUrl || retailer.user?.profilePicture || retailer.user?.photo, ''),
    business:
      asText(retailer.businessName, '').trim() ||
      asText(retailer.companyName, '').trim() ||
      asText(retailer.storeName, '').trim() ||
      'N/A',
    email:
      asText(retailer.email, '').trim() ||
      asText(retailer.companyEmail, '').trim() ||
      asText(retailer.user?.email, '').trim() ||
      'N/A',
    phone:
      asText(retailer.phoneNumber, '').trim() ||
      asText(retailer.phone, '').trim() ||
      asText(retailer.user?.phoneNumber, '').trim() ||
      asText(retailer.user?.phone, '').trim() ||
      'N/A',
    location:
      asText(retailer.location, '').trim() ||
      asText(retailer.state, '').trim() ||
      'N/A',
    status: retailer.is_active ? 'Active' : 'Inactive',
    createdAt: retailer.createdAt || '',
    middleName: asText(retailer.middleName, 'N/A'),
    gender: asText(retailer.gender, 'N/A'),
    nationality: asText(retailer.nationality, 'N/A'),
    dateOfBirth: asText(retailer.dateOfBirth, 'N/A'),
    address: asText(retailer.address, 'N/A'),
    currentState: asText(retailer.currentState || retailer.state, 'N/A'),
    currentLocalGovernment: asText(
      retailer.currentLocalGovernment || retailer.localGovernment,
      'N/A'
    ),
    stateOfOrigin: asText(retailer.stateOfOrigin, 'N/A'),
    localGovernmentOfOrigin: asText(retailer.localGovernmentOfOrigin, 'N/A'),
    nearestLandmark: asText(retailer.nearestLandmark, 'N/A'),
    businessAddress: asText(
      retailer.businessAddress || retailer.companyAddress,
      'N/A'
    ),
    localGovernment: asText(retailer.localGovernment, 'N/A'),
    yearsInBusiness: asText(retailer.yearsInBusiness, 'N/A'),
    shopOwnership: asText(retailer.shopOwnership, 'N/A'),
    shopSize: asText(retailer.shopSize, 'N/A'),
    utilityType: asText(retailer.utilityType, 'N/A'),
    meansOfId: asText(retailer.meansOfId, 'N/A'),
    meterNumber: asText(retailer.meterNumber, 'N/A'),
    nin: asText(retailer.nin, 'N/A'),
    proofOfAddress: formatAssetField(retailer.proofOfAddress),
    utilityBill: formatAssetField(retailer.utilityBill),
    idDocument: formatAssetField(retailer.idDocument),
    shopPhotos: formatAssetField(retailer.shopPhotos),
    proofOfAddressRaw: toAssetRaw(retailer.proofOfAddress),
    utilityBillRaw: toAssetRaw(retailer.utilityBill),
    idDocumentRaw: toAssetRaw(retailer.idDocument),
    shopPhotosRaw: toAssetRaw(retailer.shopPhotos),
  };
};

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export const retailerService = {
  getRetailers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<RetailerListResponse> => {
    const response = await api.get('/retailers', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search || undefined,
      },
    });

    const data = response.data?.data || {};
    const retailers: Retailer[] = data.retailers || [];
    const page = Number(data.page || params?.page || 1);
    const pages = Number(data.pages || 1);
    const totalCount = Number(data.total || data.totalCount || 0);

    return {
      retailers: retailers.map(toRetailerListItem),
      page,
      pages,
      totalCount,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    };
  },

  getRetailerById: async (id: string): Promise<RetailerDetail> => {
    const response = await api.get(`/retailers/admin/${id}`);
    const data: Retailer = response.data?.data || {};
    return toRetailerDetail(data);
  },

  getRetailerFarmers: async (id: string): Promise<RetailerFarmerItem[]> => {
    const response = await api.get(`/farmers/retailer/${id}`);
    const farmers: any[] = response.data?.data || [];
    return farmers
      .map((farmer) => {
      const firstName = asText(farmer.firstName, '').trim();
      const lastName = asText(farmer.lastName, '').trim();
      const fullName = `${firstName} ${lastName}`.trim();
      return {
        id: asText(farmer._id, ''),
        createdAt: asText(farmer.createdAt, ''),
        name: fullName || asText(farmer.name, 'Unknown Farmer'),
        farmerId: asText(farmer.farmerId, 'Farmer ID'),
        age: asText(farmer.age ?? farmer.Age, 'N/A'),
        location: asText(farmer.locationName || farmer.location, 'N/A'),
        contact: asText(farmer.phone || farmer.phoneNumber || farmer.phone_number, 'N/A'),
      };
      })
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
  },

  getRetailerProducts: async (
    id: string,
    params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }
  ): Promise<PaginatedRetailerProducts> => {
    const response = await api.get(`/retailers/admin/${id}/products`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search || undefined,
        status: params?.status || undefined,
        category: params?.category || undefined,
      },
    });

    const data = response.data?.data || {};
    const products: any[] = data.products || [];
    const page = Number(data.page || 1);
    const pages = Number(data.pages || 1);
    const totalCount = Number(data.total || data.totalCount || 0);

    return {
      products: products.map((product) => ({
        id: asText(product._id, ''),
        createdAt: asText(product.createdAt, ''),
        name: asText(product.name, 'N/A'),
        image: asText(product.image || product.images?.[0] || product.imageUrls?.[0], ''),
        category: asText(product.category, 'N/A'),
        price: asText(product.price, 'N/A'),
        quantity: asText(product.quantity, 'N/A'),
        status: asText(product.status, 'N/A'),
      })).sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
      page,
      pages,
      totalCount,
    };
  },

  getRetailerRequests: async (
    id: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      direction?: 'raised' | 'received' | 'all';
    }
  ): Promise<PaginatedRetailerRequests> => {
    const response = await api.get(`/retailers/admin/${id}/requests`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search || undefined,
        status: params?.status || undefined,
        direction: params?.direction || 'all',
      },
    });

    const data = response.data?.data || {};
    const requests: any[] = data.requests || [];
    const page = Number(data.page || 1);
    const pages = Number(data.pages || 1);
    const totalCount = Number(data.total || data.totalCount || 0);

    return {
      requests: requests.map((request) => ({
        id: asText(request._id, ''),
        requestType: asText(request.requestType, 'N/A'),
        farmerName: asText(request.farmerName, 'N/A'),
        status: asText(request.status, 'N/A'),
        totalAmount: asText(
          request.financingDetails?.totalAmount ?? request.totalAmount,
          'N/A'
        ),
        createdAt: asText(request.createdAt, ''),
      })).sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
      page,
      pages,
      totalCount,
    };
  },
};
