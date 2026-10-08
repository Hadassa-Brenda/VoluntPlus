import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CompleteProfilePage from "./CompleteProfilePage";
import { registerIndividual } from "../../../api/usersApi";
import { useCurrentUser } from "../../../context/CurrentUserContext";

jest.mock("@clerk/react", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true, getToken: async () => "token" }),
  useUser: () => ({ user: { primaryEmailAddress: { emailAddress: "ana@example.com" } } }),
}));
jest.mock("../../../api/usersApi", () => ({
  registerIndividual: jest.fn(),
  registerOrganization: jest.fn(),
}));
jest.mock("../../../context/CurrentUserContext", () => ({
  useCurrentUser: jest.fn(),
}));

it("vincula automaticamente o perfil depois que o Clerk conclui o cadastro", async () => {
  const refreshUser = jest.fn().mockResolvedValue({ id: 1 });
  useCurrentUser.mockReturnValue({ user: null, refreshUser });
  registerIndividual.mockResolvedValue({ id: 1 });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[{ pathname: "/completar-perfil", state: {
      retryRegistration: true,
      draft: { personType: "INDIVIDUAL", fullName: "Ana Silva", birthDate: "1995-05-20",
        gender: "FEMALE", role: "OFFERER" },
    } }]}>
      <Routes>
        <Route path="/completar-perfil" element={<CompleteProfilePage />} />
        <Route path="/" element={<p>Homepage</p>} />
      </Routes>
    </MemoryRouter>,
  );

  await waitFor(() => expect(registerIndividual).toHaveBeenCalledWith({
    fullName: "Ana Silva", birthDate: "1995-05-20", gender: "FEMALE", initialRole: "OFFERER",
  }, "token"));
  expect(refreshUser).toHaveBeenCalledWith("token");
  expect(await screen.findByText("Homepage")).toBeInTheDocument();
});
