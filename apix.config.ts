import { Config } from './src/types/index.js';

const config: Config = {
  baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  headers: {
    'Accept': 'application/json',
    'Authorization': process.env.API_TOKEN ? `Bearer ${process.env.API_TOKEN}` : undefined
  }
};

export default config;
