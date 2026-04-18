import axios from 'axios';

declare const __SCORPANION_API_BASE_URL__: string;

const baseURL =
  __SCORPANION_API_BASE_URL__.trim().replace(/\/+$/, '') || '/api';

export const axiosClient = axios.create({
  baseURL,
});
