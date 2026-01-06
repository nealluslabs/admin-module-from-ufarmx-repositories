import api from '@/lib/api';

export interface FormResponse {
  _id: string;
  responseObject: Record<string, any>;
  form_id: string;
  agent_user_id?: string;
  admin_user_id?: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  form?: {
    _id: string;
    title: string;
    fields?: any[];
  };
  filledBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ResponseWithLocation extends FormResponse {
  location?: {
    lat: number;
    lng: number;
  };
}

export const responseService = {
  getAllResponses: async (): Promise<FormResponse[]> => {
    const response = await api.get('/forms/responses');
    return response.data.data;
  },

  getResponseById: async (id: string): Promise<FormResponse> => {
    const response = await api.get(`/responses/${id}`);
    return response.data.data;
  },

  getResponsesWithLocation: async (): Promise<ResponseWithLocation[]> => {
    const response = await api.get('/responses/withLocation');
    return response.data.data;
  },

  updateResponse: async (id: string, responseObject: Record<string, any>): Promise<FormResponse> => {
    const response = await api.put(`/responses/${id}/update-response`, { responseObject });
    return response.data.data;
  },

  deleteResponse: async (id: string): Promise<void> => {
    await api.delete(`/responses/${id}/delete-response`);
  },

  analyzeResponse: async (id: string, message: string, newChat: boolean = false): Promise<any> => {
    const response = await api.post(`/responses/${id}/analyse`, { message, newChat });
    return response.data.data;
  },

  getResponseAnalysis: async (id: string): Promise<any> => {
    const response = await api.get(`/responses/${id}/analysis`);
    return response.data.data;
  },

  deleteResponseAnalysis: async (id: string): Promise<void> => {
    await api.delete(`/responses/${id}/analysis`);
  },
};
