import api from '@/lib/api';

export interface Agent {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  userId?: string;
  user_id?: string;
  user?: {
    email?: string;
    _id?: string;
  };
  location?: string;
  forms?: any[];
  responses?: any[];

}

export const agentService = {
  getAgents: async (): Promise<Agent[]> => {
    try {
      const response = await api.get('/agents');
      // Response structure: { success: true, message: '...', data: [...] }
      const agents = response.data?.data || [];

      // Map the response to ensure consistent structure
      return agents.map((agent: any) => ({
        _id: agent._id || agent.id,
        id: agent.id || agent._id,
        firstName: agent.firstName || '',
        lastName: agent.lastName || '',
        email: agent.user?.email || agent.user_id?.email || agent.email,
        phone: agent.phoneNumber || agent.phone,
        phoneNumber: agent.phoneNumber || agent.phone,
        userId: agent.user_id || agent.user?._id || agent.userId,
        user_id: agent.user_id,

        user: agent.user,
        location: agent.location || '',
        forms: agent.forms || [],
        responses: agent.responses || [],
      }));
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },


  deleteAgent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/agents/${id}`);
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  createAgent: async (data: Partial<Agent>): Promise<Agent> => {
    try {
      const response = await api.post('/agents', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  updateAgent: async (id: string, data: Partial<Agent>): Promise<Agent> => {
    try {
      const response = await api.put(`/agents/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  getAgent: async (id: string): Promise<Agent> => {
    try {
      const response = await api.get(`/agents/${id}`);
      const agent = response.data.data;
      return {
        _id: agent._id || agent.id,
        id: agent.id || agent._id,
        firstName: agent.firstName || '',
        lastName: agent.lastName || '',
        email: agent.user?.email || agent.user_id?.email || agent.email,
        phone: agent.phoneNumber || agent.phone,
        phoneNumber: agent.phoneNumber || agent.phone,
        userId: agent.user_id || agent.user?._id || agent.userId,
        user_id: agent.user_id,
        user: agent.user,
        location: agent.location || '',
        forms: agent.forms || [],
        responses: agent.responses || [],
      };
    } catch (error: any) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  },
};

