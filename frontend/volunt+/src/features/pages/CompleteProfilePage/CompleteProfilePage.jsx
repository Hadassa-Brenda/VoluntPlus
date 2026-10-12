import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { registerIndividual, registerOrganization } from "../../../api/usersApi";
import { useCurrentUser } from "../../../context/CurrentUserContext";
import "./CompleteProfilePage.css";

export default function CompleteProfilePage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, refreshUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const autoAttemptedRef = useRef(false);
  const inFlightRef = useRef(false);
  const [form, setForm] = useState(() => ({
    personType: "INDIVIDUAL", role: "BENEFICIARY", fullName: "",
    birthDate: "", gender: "", organizationName: "", cnpj: "",
    ...(location.state?.draft || {}),
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  const saveProfile = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
      if (form.personType === "ORGANIZATION") {
        await registerOrganization({
          organizationName: form.organizationName.trim(),
          cnpj: form.cnpj.replace(/\D/g, "") || null,
        }, token);
      } else {
        await registerIndividual({
          fullName: form.fullName.trim(), birthDate: form.birthDate,
          gender: form.gender, initialRole: form.role,
        }, token);
      }
      await refreshUser(token);
      navigate("/", { replace: true });
    } catch (failure) {
      if (failure?.response?.status === 409) {
        try {
          await refreshUser();
          navigate("/", { replace: true });
          return;
        } catch { /* Mostra a falha original abaixo. */ }
      }
      setError(failure?.response?.data?.detail || failure.message || "Não foi possível salvar seu perfil.");
    } finally {
      inFlightRef.current = false;
      setSaving(false);
    }
  }, [form, getToken, navigate, refreshUser]);

  useEffect(() => {
    if (!location.state?.retryRegistration || !isLoaded || !isSignedIn || user || autoAttemptedRef.current) return;
    autoAttemptedRef.current = true;
    saveProfile();
  }, [isLoaded, isSignedIn, location.state, saveProfile, user]);

  if (!isLoaded) return <p>Carregando...</p>;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (user) return <Navigate to="/" replace />;

  function submit(event) {
    event.preventDefault();
    saveProfile();
  }

  return (
    <main className="complete-profile">
      <section>
        <Link to="/explorar">← Voltar ao catálogo</Link>
        <h1>Complete seu perfil</h1>
        <p>Sua conta {clerkUser?.primaryEmailAddress?.emailAddress} está ativa. Escolha como deseja participar.</p>
        <form onSubmit={submit}>
          <label>Tipo de conta
            <select value={form.personType} onChange={(event) => update("personType", event.target.value)}>
              <option value="INDIVIDUAL">Pessoa física</option>
              <option value="ORGANIZATION">Organização ofertante</option>
            </select>
          </label>
          {form.personType === "ORGANIZATION" ? <>
            <label>Nome da organização
              <input required maxLength={255} value={form.organizationName} onChange={(event) => update("organizationName", event.target.value)} />
            </label>
            <label>CNPJ (opcional)
              <input inputMode="numeric" value={form.cnpj} onChange={(event) => update("cnpj", event.target.value)} />
            </label>
          </> : <>
            <label>Nome completo
              <input required maxLength={255} value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
            </label>
            <label>Data de nascimento
              <input required type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
            </label>
            <label>Gênero
              <select required value={form.gender} onChange={(event) => update("gender", event.target.value)}>
                <option value="">Selecione</option><option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option><option value="NON_BINARY">Não binário</option>
                <option value="OTHER">Outro</option><option value="PREFER_NOT_TO_SAY">Prefiro não informar</option>
              </select>
            </label>
            <label>Perfil
              <select value={form.role} onChange={(event) => update("role", event.target.value)}>
                <option value="BENEFICIARY">Beneficiário</option><option value="OFFERER">Ofertante</option>
              </select>
            </label>
          </>}
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar perfil"}</button>
        </form>
      </section>
    </main>
  );
}
