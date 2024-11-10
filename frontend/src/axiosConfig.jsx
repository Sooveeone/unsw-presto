import axios from 'axios';
import config from '../backend.config.json'; 

const baseURL = `http://localhost:${config.BACKEND_PORT}`;

const instance = axios.create({
  baseURL: baseURL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;