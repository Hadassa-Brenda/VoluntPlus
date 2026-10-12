import { authenticatedApi, publicApi } from "./axiosConfig";

function authenticatedConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function registerIndividual(payload, token) {
  const response = await publicApi.post(
    "/v1/users/individuals",
    payload,
    authenticatedConfig(token),
  );

  return response.data;
}

export async function registerOrganization(payload, token) {
  const response = await publicApi.post(
    "/v1/users/organizations",
    payload,
    authenticatedConfig(token),
  );

  return response.data;
}

export async function fetchCurrentUserProfile(token) {
  const response = token
    ? await publicApi.get("/v1/users/me", authenticatedConfig(token))
    : await authenticatedApi.get("/v1/users/me");

  return response.data;
}

export async function fetchPublicUserProfile(id) {
  const response = await publicApi.get(`/v1/users/${encodeURIComponent(id)}`);
  return response.data;
}

export async function changeCurrentUserRole(role) {
  const response = await authenticatedApi.patch("/v1/users/me/role", { role });

  return response.data;
}

export async function updateCurrentUserProfile(payload) {
  const response = await authenticatedApi.patch("/v1/users/me", payload);

  return response.data;
}
