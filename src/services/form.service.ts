import api from '@/lib/api';

export interface Form {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  fields?: any[];
  agents?: string[];
  assignedAgents?: string[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isFarmerForm?: boolean;
  version?: number;
  schemaHash?: string;
}

export interface FormFieldOption {
  key: string;
  value: string;
}

export interface FormField {
  id: string;
  key: string;
  name: string;
  prompt?: string;
  type: string;
  options?: FormFieldOption[];
  validations?: {
    isRequired?: boolean;
    isReadOnly?: boolean;
  };
}

export const formService = {
  getForms: async (): Promise<Form[]> => {
    const response = await api.get('/forms');
    return response.data.data;
  },

  getForm: async (id: string): Promise<Form> => {
    const response = await api.get(`/forms/${id}`);
    return response.data.data;
  },

  getFarmerForm: async (): Promise<Form> => {
    const response = await api.get('/forms/farmer');
    return response.data.data;
  },

  createForm: async (formData: Partial<Form>): Promise<Form> => {
    const response = await api.post('/forms', formData);
    return response.data.data;
  },

  updateForm: async (id: string, formData: Partial<Form>): Promise<Form> => {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data.data;
  },

  deleteForm: async (id: string): Promise<void> => {
    await api.delete(`/forms/${id}`);
  },

  downloadFormResponseFormat: async (id: string): Promise<Blob> => {
    const response = await api.get(`/form/${id}/download-input-csv`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportFormResponses: async (id: string): Promise<Blob> => {
    const response = await api.get(`/form/${id}/export-responses`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportSelectedFormResponses: async (id: string, responseIds: string[]): Promise<Blob> => {
    const response = await api.post(`/forms/${id}/export-selected`, { responses: responseIds }, {
      responseType: 'blob',
    });
    return response.data;
  },

  uploadFormResponses: async (id: string, formData: FormData): Promise<void> => {
    await api.post(`/form/${id}/upload-responses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFarmerFormRequiredFields: async (): Promise<string[]> => {
    const response = await api.get('/form-config/farmer-required-fields');
    return response.data.data.requiredFields;
  },
};
