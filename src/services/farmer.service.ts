import api from '@/lib/api';

export interface Farmer {
  _id: string;
  farmerId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  age?: string | number;
  Age?: string | number;
  farmingType?: string;
  farmingCrop?: string;
  cropsLivestock?: string;
  produce?: string;
  locationName?: string;
  location?: string;
  farmLocationGPS?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  photo?: string;
}

const toDisplayName = (farmer: Farmer): string => {
  const fullName = [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  if (farmer.name?.trim()) {
    return farmer.name.trim();
  }

  return 'Unknown Farmer';
};

const toCropType = (farmer: Farmer): string => {
  return (
    farmer.farmingType ||
    farmer.farmingCrop ||
    farmer.cropsLivestock ||
    farmer.produce ||
    'N/A'
  );
};

const toLocation = (farmer: Farmer): string => {
  return farmer.locationName || farmer.location || farmer.farmLocationGPS || 'N/A';
};

const toContact = (farmer: Farmer): string => {
  return farmer.phone || farmer.phoneNumber || farmer.phone_number || 'N/A';
};

const toAge = (farmer: Farmer): string => {
  const value = farmer.age ?? farmer.Age;
  return value === undefined || value === null || value === '' ? 'N/A' : String(value);
};

export interface FarmerListItem {
  id: string;
  farmerId: string;
  name: string;
  age: string;
  cropType: string;
  location: string;
  contact: string;
  photo?: string;
}

export interface FarmerListResponse {
  farmers: FarmerListItem[];
  page: number;
  pages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const farmerService = {
  getFarmers: async (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<FarmerListResponse> => {
    const response = await api.get('/farmers/paginated', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        keyword: params?.keyword || undefined,
      },
    });
    const data = response.data?.data || {};
    const farmers: Farmer[] = data.farmers || [];

    return {
      farmers: farmers.map((farmer) => ({
        id: farmer._id,
        farmerId: farmer.farmerId || 'Farmer ID',
        name: toDisplayName(farmer),
        age: toAge(farmer),
        cropType: toCropType(farmer),
        location: toLocation(farmer),
        contact: toContact(farmer),
        photo: farmer.photo,
      })),
      page: data.page || 1,
      pages: data.pages || 1,
      totalCount: data.totalCount || 0,
      hasNextPage: !!data.hasNextPage,
      hasPrevPage: !!data.hasPrevPage,
    };
  },
};
