import {
  mapBackendUserToFrontend,
  persistBackendUser,
} from "./userProfileStorage";

describe("userProfileStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("converte o contrato de usuário do backend para o modelo das telas", () => {
    expect(
      mapBackendUserToFrontend({
        id: "87be9d3a-0ac6-4ac4-8e44-f66f14637ec6",
        personType: "INDIVIDUAL",
        currentRole: "BENEFICIARY",
        fullName: "Ana Silva",
        birthDate: "1995-05-20",
        gender: "FEMALE",
        email: "ana@example.com",
      }),
    ).toMatchObject({
      id: "87be9d3a-0ac6-4ac4-8e44-f66f14637ec6",
      tipoUsuario: "PF",
      perfilUsuario: "BF",
      dataNascimento: "1995-05-20",
      genero: "F",
    });
  });

  it("preserva os dados pessoais ao aplicar a resposta parcial da troca de papel", () => {
    const mappedUser = persistBackendUser(
      {
        userId: "87be9d3a-0ac6-4ac4-8e44-f66f14637ec6",
        personType: "INDIVIDUAL",
        currentRole: "OFFERER",
      },
      {
        id: "87be9d3a-0ac6-4ac4-8e44-f66f14637ec6",
        fullName: "Ana Silva",
        email: "ana@example.com",
        perfilUsuario: "BF",
      },
    );

    expect(mappedUser).toMatchObject({
      fullName: "Ana Silva",
      email: "ana@example.com",
      perfilUsuario: "PF",
      currentRole: "OFFERER",
    });
    expect(JSON.parse(localStorage.getItem("volunt-user"))).toEqual(mappedUser);
  });

  it("não inventa um papel de ofertante para perfis sem papel no servidor", () => {
    expect(mapBackendUserToFrontend(
      { id: 7, fullName: "Ana" },
      { perfilUsuario: "PF", currentRole: "OFFERER" },
    ).perfilUsuario).toBeNull();
  });
});
