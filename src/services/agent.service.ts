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
        email: agent.user?.email || agent.email,
        phone: agent.phoneNumber || agent.phone,
        phoneNumber: agent.phoneNumber || agent.phone,
        userId: agent.user_id || agent.user?._id || agent.userId,
        user_id: agent.user_id,
        user: agent.user,
      }));
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },
};

