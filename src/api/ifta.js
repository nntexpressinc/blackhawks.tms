import axios from 'axios';

const API_URL = 'https://blackhawks.nntexpressinc.com/api';

export const getIftaRecords = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/ifta/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IFTA records:', error.message);
    throw error;
  }
};

export const getIftaRecordById = async (id) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/ifta/${id}/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IFTA record:', error.message);
    throw error;
  }
};

export const createIftaBulk = async (data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.post(`${API_URL}/ifta/bulk_create/`, data, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating IFTA records:', error.message);
    throw error;
  }
};

// Yangi fuel tax rates API funksiyalari
export const getFuelTaxRates = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/fuel-tax-rates/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fuel tax rates:', error.message);
    throw error;
  }
};

export const createFuelTaxRatesBulk = async (data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.post(`${API_URL}/fuel-tax-rates/bulk_create/`, data, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating fuel tax rates:', error.message);
    throw error;
  }
};

export const updateIftaRecord = async (id, data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.put(`${API_URL}/ifta/${id}/`, data, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating IFTA record:', error.message);
    throw error;
  }
};

export const deleteIftaRecord = async (id) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.delete(`${API_URL}/ifta/${id}/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting IFTA record:', error.message);
    throw error;
  }
};

export const updateFuelTaxRate = async (id, data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.put(`${API_URL}/fuel-tax-rates/${id}/`, data, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating fuel tax rate:', error.message);
    throw error;
  }
};

export const deleteFuelTaxRate = async (id) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.delete(`${API_URL}/fuel-tax-rates/${id}/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting fuel tax rate:', error.message);
    throw error;
  }
};
