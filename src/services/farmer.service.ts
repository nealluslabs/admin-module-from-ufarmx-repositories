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

type UnknownRecord = Record<string, unknown>;

const readValue = (source: UnknownRecord, keys: string[]): unknown => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const asText = (value: unknown, fallback = 'N/A'): string => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toArray = <T = unknown>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

export interface FarmerDetailAgent {
  id?: string;
  name: string;
  phone: string;
  location: string;
  photo?: string;
}

export interface FarmerDetailHarvest {
  id: string;
  name: string;
  cropType: string;
  quantity: string;
  harvestDate: string;
}

export interface FarmerDetail {
  id: string;
  farmerId: string;
  name: string;
  photo?: string;
  onboardDate: string;
  creditScore: string;
  creditCategory: string;
  accountCode: string;
  location: string;
  contact: string;
  email: string;
  gps: string;
  age: string;
  gender: string;
  wife: string;
  children: string;
  smartphone: string;
  distributionMethod: string;
  farmingType: string;
  preRetailer: string;
  idType: string;
  insurance: string;
  irrigation: string;
  cropsLivestock: string;
  inputs: string;
  preProduction: string;
  farmSize: string;
  previousChemicals: string;
  previousCosts: string;
  farmingExperience: string;
  challenges: string;
  agent?: FarmerDetailAgent;
  harvests: FarmerDetailHarvest[];
  cropDeposits: FarmerDetailHarvest[];
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

  getFarmerById: async (id: string): Promise<FarmerDetail> => {
    const response = await api.get(`/farmers/${id}`, {
      params: { details: true },
    });

    const farmer = (response.data?.data || {}) as UnknownRecord;
    const agent = (farmer.agent || farmer.agent_user_id || {}) as UnknownRecord;

    const harvestsSource = toArray<UnknownRecord>(
      readValue(farmer, ['harvests', 'harvest', 'requests'])
    );
    const cropDepositsSource = toArray<UnknownRecord>(
      readValue(farmer, ['repayments', 'deposits', 'cropDeposits'])
    );

    const mapHarvestItem = (entry: UnknownRecord, index: number): FarmerDetailHarvest => ({
      id: asText(readValue(entry, ['_id', 'id']), `${index}`),
      name: asText(readValue(entry, ['name', 'crop', 'produce', 'title']), 'Produce'),
      cropType: asText(readValue(entry, ['cropType', 'type', 'category']), 'N/A'),
      quantity: asText(readValue(entry, ['harvestKg', 'kg', 'quantity', 'amount']), 'N/A'),
      harvestDate: asText(readValue(entry, ['harvestDate', 'date', 'createdAt']), 'N/A'),
    });

    const firstName = asText(readValue(farmer, ['firstName']), '').trim();
    const lastName = asText(readValue(farmer, ['lastName']), '').trim();
    const fullName = `${firstName} ${lastName}`.trim();

    const creditScoreValue = readValue(farmer, ['creditScore', 'riskScore']);
    const creditScoreNumber = asNumber(creditScoreValue, 0);
    const creditCategory =
      asText(readValue(farmer, ['creditScoreCategory']), '') ||
      (creditScoreNumber >= 7 ? 'Good' : creditScoreNumber >= 4 ? 'Medium' : 'Low');

    const farmSizeValue = readValue(farmer, ['farmSize', 'FarmSize', 'farm_size', 'farmsize']);
    const farmSizeUnit = asText(readValue(farmer, ['farmSizeUnit', 'FarmSizeUnit']), '').trim();
    const farmSizeText = `${asText(farmSizeValue)}${farmSizeUnit ? ` ${farmSizeUnit}` : ''}`;

    const output: FarmerDetail = {
      id: asText(readValue(farmer, ['_id', 'id']), id),
      farmerId: asText(readValue(farmer, ['farmerId']), 'Farmer ID'),
      name: fullName || asText(readValue(farmer, ['name', 'Name']), 'Unknown Farmer'),
      photo: asText(readValue(farmer, ['photo']), ''),
      onboardDate: asText(readValue(farmer, ['createdAt', 'start_record']), 'N/A'),
      creditScore: creditScoreValue !== undefined ? String(creditScoreValue) : 'N/A',
      creditCategory: creditCategory || 'N/A',
      accountCode: asText(readValue(farmer, ['uuid', 'farmerId']), '-'),
      location: asText(readValue(farmer, ['locationName', 'location', 'farmLocationGPS']), 'N/A'),
      contact: asText(readValue(farmer, ['phone', 'phoneNumber', 'phone_number']), 'N/A'),
      email: asText(readValue(farmer, ['email', 'username']), '-'),
      gps: asText(readValue(farmer, ['gps_stamp', 'gps', 'location', 'farmLocationGPS']), '-'),
      age: asText(readValue(farmer, ['age', 'Age']), 'N/A'),
      gender: asText(readValue(farmer, ['gender']), 'N/A'),
      wife: asText(readValue(farmer, ['noOfSpouse']), '-'),
      children: asText(readValue(farmer, ['noOfChildren']), '-'),
      smartphone: asText(readValue(farmer, ['smartphone']), 'N/A'),
      distributionMethod: asText(readValue(farmer, ['market', 'productSoldTo']), 'N/A'),
      farmingType: asText(readValue(farmer, ['farmingType', 'farmingCrop', 'crop_types']), 'N/A'),
      preRetailer: asText(readValue(farmer, ['pre_retailer']), '-'),
      idType: asText(readValue(farmer, ['identification']), '-'),
      insurance: asText(readValue(farmer, ['insurance']), 'N/A'),
      irrigation: asText(
        readValue(farmer, ['utilisezvous_lirrigation__oui_or_non', 'irrigation']),
        'N/A'
      ),
      cropsLivestock: asText(
        readValue(farmer, ['cropsLivestock', 'produce', 'farmingCrop', 'crop_types']),
        'N/A'
      ),
      inputs: asText(readValue(farmer, ['input', 'inputs', 'seeds']), 'N/A'),
      preProduction: asText(readValue(farmer, ['production_level', 'productionsize']), 'N/A'),
      farmSize: farmSizeText.trim(),
      previousChemicals: asText(
        readValue(farmer, ['previousChemicals', 'chemicals', 'chemical', 'typeOfChemical']),
        'N/A'
      ),
      previousCosts: asText(readValue(farmer, ['previousCosts', 'cost']), 'N/A'),
      farmingExperience: asText(readValue(farmer, ['farmingExperience', 'experience']), 'N/A'),
      challenges: asText(readValue(farmer, ['challenges', 'challenge', 'problem']), 'N/A'),
      agent: agent && Object.keys(agent).length > 0
        ? {
            id: asText(readValue(agent, ['_id', 'id']), ''),
            name: asText(
              readValue(agent, ['name']),
              `${asText(readValue(agent, ['firstName']), '')} ${asText(readValue(agent, ['lastName']), '')}`.trim() || 'N/A'
            ),
            phone: asText(readValue(agent, ['phoneNumber', 'phone']), 'N/A'),
            location: asText(readValue(agent, ['location', 'country']), 'N/A'),
            photo: asText(readValue(agent, ['photo']), ''),
          }
        : undefined,
      harvests: harvestsSource.map(mapHarvestItem),
      cropDeposits: cropDepositsSource.map(mapHarvestItem),
    };

    return output;
  },
};
