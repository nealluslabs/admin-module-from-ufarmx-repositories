import api from '@/lib/api';

export interface Admin {
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
  isActive?: boolean;
  isSuperAdmin?: boolean;
  role?: string;
}

export const adminService = {
  getAdmins: async (): Promise<Admin[]> => {
    try {
      const response = await api.get('/admins');
      const admins = response.data?.data || [];

      return admins.map((admin: any) => ({
        _id: admin._id || admin.id,
        id: admin.id || admin._id,
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.user?.email || admin.user_id?.email || admin.email,
        phone: admin.phoneNumber || admin.phone,
        phoneNumber: admin.phoneNumber || admin.phone,
        userId: admin.user_id || admin.user?._id || admin.userId,
        user_id: admin.user_id,
        user: admin.user,
        location: admin.location || '',
        isActive: admin.isActive,
      }));
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  getAdmin: async (id: string): Promise<Admin> => {
    try {
      const response = await api.get(`/admins/${id}`);
      const admin = response.data.data;
      return {
        _id: admin._id || admin.id,
        id: admin.id || admin._id,
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.user?.email || admin.user_id?.email || admin.email,
        phone: admin.phoneNumber || admin.phone,
        phoneNumber: admin.phoneNumber || admin.phone,
        userId: admin.user_id || admin.user?._id || admin.userId,
        user_id: admin.user_id,
        user: admin.user,
        location: admin.location || '',
        isActive: admin.isActive,
      };
    } catch (error: any) {
      console.error('Error fetching admin:', error);
      throw error;
    }
  },

  createAdmin: async (data: Partial<Admin>): Promise<Admin> => {
    try {
      const response = await api.post('/admins', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  updateAdmin: async (id: string, data: Partial<Admin>): Promise<Admin> => {
    try {
      const response = await api.put(`/admins/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  deleteAdmin: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admins/${id}`);
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },

  deleteAdminUser: async (userId: string): Promise<void> => {
    try {
      await api.post('/auth/delete-user', { user: userId });
    } catch (error: any) {
      console.error('Error deleting admin user:', error);
      throw error;
    }
  },

  createSuperAdmin: async (data: Partial<Admin>): Promise<Admin> => {
    try {
      const response = await api.post('/admins/create-super-admin', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      throw error;
    }
  },
};
