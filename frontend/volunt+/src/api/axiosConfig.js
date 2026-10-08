import axios from "axios";

import { getClerkSessionToken } from "./clerkTokenProvider";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
};

export const publicApi = axios.create(apiConfig);
export const authenticatedApi = axios.create(apiConfig);

authenticatedApi.interceptors.request.use(async (config) => {
  const token = await getClerkSessionToken();

  if (typeof config.headers?.delete === "function") {
    config.headers.delete("Authorization");
  } else if (config.headers) {
    delete config.headers.Authorization;
  }

  if (token) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

export function isUnauthorizedError(error) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
