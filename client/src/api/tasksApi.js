import axiosInstance from './axiosInstance';

export const getTasks = async (boardId, params = {}) => {
  const res = await axiosInstance.get(`/boards/${boardId}/tasks`, { params });
  return res.data;
};

export const createTask = async (boardId, data) => {
  const res = await axiosInstance.post(`/boards/${boardId}/tasks`, data);
  return res.data;
};

export const getTaskById = async (boardId, taskId) => {
  const res = await axiosInstance.get(`/boards/${boardId}/tasks/${taskId}`);
  return res.data;
};

export const updateTask = async (boardId, taskId, data) => {
  const res = await axiosInstance.put(`/boards/${boardId}/tasks/${taskId}`, data);
  return res.data;
};

export const deleteTask = async (boardId, taskId) => {
  const res = await axiosInstance.delete(`/boards/${boardId}/tasks/${taskId}`);
  return res.data;
};
