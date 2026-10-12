import {
  changeCurrentUserRole,
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
} from "./usersApi";
import { authenticatedApi, publicApi } from "./axiosConfig";

jest.mock("./axiosConfig", () => ({
  authenticatedApi: {
    get: jest.fn(),
    patch: jest.fn(),
  },
  publicApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("usersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("consulta o perfil atual usando o cliente autenticado", async () => {
    authenticatedApi.get.mockResolvedValue({ data: { id: "user-id" } });

    await expect(fetchCurrentUserProfile()).resolves.toEqual({ id: "user-id" });
    expect(authenticatedApi.get).toHaveBeenCalledWith("/v1/users/me");
    expect(publicApi.get).not.toHaveBeenCalled();
  });

  it("envia o novo papel para a rota de troca de perfil", async () => {
    authenticatedApi.patch.mockResolvedValue({
      data: { userId: "user-id", currentRole: "BENEFICIARY" },
    });

    await expect(changeCurrentUserRole("BENEFICIARY")).resolves.toMatchObject({
      currentRole: "BENEFICIARY",
    });
    expect(authenticatedApi.patch).toHaveBeenCalledWith("/v1/users/me/role", {
      role: "BENEFICIARY",
    });
  });

  it("envia as alterações do perfil para o backend autenticado", async () => {
    const payload = { fullName: "Ana Silva", birthDate: "1995-05-20" };
    authenticatedApi.patch.mockResolvedValue({ data: payload });

    await expect(updateCurrentUserProfile(payload)).resolves.toEqual(payload);
    expect(authenticatedApi.patch).toHaveBeenCalledWith(
      "/v1/users/me",
      payload,
    );
  });
});
