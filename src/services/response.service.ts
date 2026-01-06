import api from '@/lib/api';

export interface FormResponse {
    _id: string;
    form_id: string;
    form?: {
        _id: string;
        title: string;
        fields?: any[];
    };
    agent_user_id?: string;
    filledBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
    responseObject: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export const responseService = {
    getAllResponses: async (): Promise<FormResponse[]> => {
        try {
            const response = await api.get('/forms/responses');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching responses:', error);
            throw error;
        }
    },

    getResponseById: async (id: string): Promise<FormResponse> => {
        try {
            const response = await api.get(`/responses/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching response details:', error);
            throw error;
        }
    },

    deleteResponse: async (id: string): Promise<void> => {
        try {
            await api.delete(`/responses/${id}/delete-response`);
        } catch (error) {
            console.error('Error deleting response:', error);
            throw error;
        }
    },

    updateResponse: async (id: string, data: Partial<FormResponse>): Promise<FormResponse> => {
        try {
            const response = await api.put(`/responses/${id}/update-response`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error updating response:', error);
            throw error;
        }
    },

    analyzeResponse: async (id: string, data: { newChat: boolean, message?: string }): Promise<any[]> => {
        try {
            const response = await api.post(`/responses/${id}/analyse`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error analyzing response:', error);
            throw error;
        }
    },

    getResponseAnalysis: async (id: string): Promise<any[]> => {
        try {
            const response = await api.get(`/responses/${id}/analysis`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching analysis:', error);
            throw error;
        }
    },

    deleteResponseAnalysis: async (id: string): Promise<void> => {
        try {
            await api.delete(`/responses/${id}/analysis`);
        } catch (error) {
            console.error('Error deleting analysis:', error);
            throw error;
        }
    }
};
