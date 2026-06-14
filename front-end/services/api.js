import axios from "axios";

// API definida fora de componentes para melhor entendimento futuro.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

 

 
export default api;