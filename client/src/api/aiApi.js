import axiosInstance from './axiosInstance';

/**
 * Request AI estimate for a task.
 * Call is made to OUR backend — Gemini API key never reaches the browser.
 */
export const suggestEstimate = async ({ title, description }) => {
  const res = await axiosInstance.post('/ai/suggest', { title, description });
  return res.data;
};
