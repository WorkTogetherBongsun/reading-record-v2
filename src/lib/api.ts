import axios from 'axios';

const API_URL = 'http://localhost:4000/sentences';

export const getSentences = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createSentence = async (data: { content: string; bookTitle?: string; author?: string }) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const deleteSentence = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
