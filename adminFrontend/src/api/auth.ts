import { apiClient } from './client';

export const loginAdmin = async (credentials: any) => {
  const { data } = await apiClient.post('/auth/admin/login', credentials);
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/admin-users/me');
  return data;
};
