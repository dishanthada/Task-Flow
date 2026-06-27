import axiosInstance from './axiosInstance';

export const getBoards = async () => {
  const res = await axiosInstance.get('/boards');
  return res.data;
};

export const createBoard = async (data) => {
  const res = await axiosInstance.post('/boards', data);
  return res.data;
};

export const getBoardById = async (boardId) => {
  const res = await axiosInstance.get(`/boards/${boardId}`);
  return res.data;
};

export const updateBoard = async (boardId, data) => {
  const res = await axiosInstance.put(`/boards/${boardId}`, data);
  return res.data;
};

export const deleteBoard = async (boardId) => {
  const res = await axiosInstance.delete(`/boards/${boardId}`);
  return res.data;
};
