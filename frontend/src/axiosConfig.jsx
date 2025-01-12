import axios from "axios";
// import config from '../backend.config.json';

const baseURL = `http:presto-deploy2-n27fcjaz5-vittos-projects-4de1ee50.vercel.app`;

const instance = axios.create({
  baseURL: baseURL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
