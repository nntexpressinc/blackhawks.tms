import axios from 'axios';
import { BASE_URL } from './config';

export const getIftaReports = async () => {
  const response = await axios.get(`${BASE_URL}/ifta-reports/`);
  return response.data;
};

export const createIftaReport = async (formData) => {
  const response = await axios.post(`${BASE_URL}/ifta-reports/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateIftaReport = async (id, formData) => {
  const response = await axios.put(`${BASE_URL}/ifta-reports/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteIftaReport = async (id) => {
  const response = await axios.delete(`${BASE_URL}/ifta-reports/${id}/`);
  return response.data;
};

export const downloadIftaReport = async (id) => {
  const response = await axios.get(`${BASE_URL}/ifta-reports/${id}/download/`, {
    responseType: 'blob',
  });
  return response;
}; 