import axiosInstance from './axiosInstance';

export const register = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};

export const login = async (data) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await axiosInstance.get('/auth/me');
  return res.data;
};

export const updateTheme = async (theme) => {
  const res = await axiosInstance.put('/auth/theme', { theme });
  return res.data;
};

export const googleLogin = async (data) => {
  const res = await axiosInstance.post('/auth/google', data);
  return res.data;
};
