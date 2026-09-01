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

// Read the token per request rather than relying on api.defaults being set at
// login: a full page load reaches components before AuthContext has rehydrated,
// so the first calls used to go out unauthenticated.
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = window.localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Called by AuthContext so a rejected token clears the same state a manual
// logout would, instead of this module reaching into React's state itself.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // A 401 from the login/register endpoints is the expected answer to bad
    // credentials — the form shows it. Only a 401 on an already-authenticated
    // call means the stored token expired or was revoked.
    const isAuthAttempt = url.includes("/auth/");

    if (status === 401 && !isAuthAttempt && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      if (onUnauthorized) onUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default api;
