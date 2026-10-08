import { useAuth } from "@clerk/react";
import { Link, Navigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function RequireRole({ role, children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, loading, error, refreshUser } = useCurrentUser();

  if (!isLoaded || loading) return <p role="status">Carregando sua conta...</p>;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (!user) return (
    <main>
      <h1>Perfil indisponível</h1>
      <p>{error?.response?.status === 404
        ? "Sua conta Clerk ainda não tem um perfil no Voluntá+. Complete seus dados para continuar."
        : "Não foi possível consultar seu perfil no servidor."}</p>
      <button type="button" onClick={() => refreshUser().catch(() => undefined)}>Tentar novamente</button>
      {error?.response?.status === 404 && <Link to="/completar-perfil">Completar perfil</Link>}
      <Link to="/explorar">Voltar ao catálogo</Link>
    </main>
  );
  if (role && user.currentRole !== role) return <Navigate to="/explorar" replace />;
  return children;
}
