import axios from "axios";

// Ceiling for a normal request. Without it a hung backend (TCP accepted but no
// response) leaves the UI spinning forever — axios aborts the request instead.
export const REQUEST_TIMEOUT = 5000;

// Multipart uploads legitimately take longer than 5s on a slow connection
// (4G, large photo), so image endpoints opt into a longer ceiling.
export const UPLOAD_TIMEOUT = 60_000;

// API definida fora de componentes para melhor entendimento futuro.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: REQUEST_TIMEOUT,
});

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
