#!/usr/bin/env node
const os = require('os');
const path = require('path');
require('dotenv').config({ path: path.join(os.homedir(), '.insighta', '.env') });   

const axios = require('axios');
const { getCredentials, saveCredentials, clearCredentials } = require('./credentials');

const BASE_URL = process.env.API_URL || 'https://web-production-5347.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-API-Version': '1' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const creds = getCredentials();
  if (creds?.access_token) {
    config.headers.Authorization = `Bearer ${creds.access_token}`;
  }
  return config;
});

// Auto refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const creds = getCredentials();
      if (!creds?.refresh_token) {
        clearCredentials();
        console.log('\nSession expired. Please run: insighta login');
        process.exit(1);
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: creds.refresh_token,
        });

        saveCredentials({
          ...creds,
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
        });

        original.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(original);
      } catch {
        clearCredentials();
        console.log('\nSession expired. Please run: insighta login');
        process.exit(1);
      }
    }

    return Promise.reject(error);
  }
);

module.exports = api;