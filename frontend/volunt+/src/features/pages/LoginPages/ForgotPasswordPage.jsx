import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPages.css";

import {
  getClerkErrorMessage,
  getClerkFieldMessage,
} from "./utils/clerkAuthUtils";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [showClerkErrors, setShowClerkErrors] = useState(false);

  const isSubmitting = fetchStatus === "fetching";

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isAuthLoaded, isSignedIn, navigate]);

  async function handleReturnToLogin() {
    if (signIn.id) {
      await signIn.reset();
    }

    navigate("/login");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthLoaded || isSubmitting) {
      return;
    }

    const emailAddress = email.trim().toLowerCase();

    if (!emailAddress) {
      setStatus("Informe seu e-mail para continuar.");
      return;
    }

    setStatus("");
    setShowClerkErrors(false);

    try {
      await signIn.reset();
      const creation = await signIn.create({ identifier: emailAddress });

      if (creation.error) {
        setShowClerkErrors(true);
        setStatus(
          getClerkErrorMessage(
            creation.error,
            "Não foi possível iniciar a recuperação da senha.",
          ),
        );
        return;
      }

      const delivery = await signIn.resetPasswordEmailCode.sendCode();

      if (delivery.error) {
        setShowClerkErrors(true);
        setStatus(
          getClerkErrorMessage(
            delivery.error,
            "Não foi possível enviar o código de recuperação.",
          ),
        );
        return;
      }

      navigate("/redefinir-senha", {
        state: { emailAddress },
      });
    } catch (error) {
      setStatus(
        getClerkErrorMessage(
          error,
          "Não foi possível solicitar a recuperação da senha.",
        ),
      );
    }
  }

  const identifierError = showClerkErrors
    ? getClerkFieldMessage(errors, "identifier")
    : "";
  const globalError = showClerkErrors
    ? getClerkErrorMessage(errors.global?.[0], "")
    : "";
  const visibleError = status || identifierError || globalError;

  return (
    <main className="login-page login-page--recovery">
      <section className="login-page__left">
        <header className="login-page__topbar">
          <button
            className="login-page__back-button"
            type="button"
            onClick={handleReturnToLogin}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </header>

        <Link className="header__brand" to="/" aria-label="Voluntá+ início">
          <span className="header__brand-icon">♡</span>
          <strong>Voluntá+</strong>
        </Link>

        <div className="login-page__text">
          <span className="login-page__tag">Segurança</span>
          <h1>
            Recuperar <span>senha</span>
          </h1>
          <p>
            Digite seu e-mail para receber um código de redefinição de senha.
          </p>
        </div>
      </section>

      <section className="login-page__right">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card__header">
            <span>Esqueci minha senha</span>
            <h2>Redefinir acesso</h2>
            <p>O Clerk enviará um código de segurança para seu e-mail.</p>
          </div>

          <label className="login-card__field">
            E-mail
            <div>
              <Mail size={18} />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus("");
                  setShowClerkErrors(false);
                }}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
          </label>

          {visibleError && (
            <p className="login-card__error" role="alert">
              {visibleError}
            </p>
          )}

          <button
            className="login-card__button"
            type="submit"
            disabled={isSubmitting || !isAuthLoaded}
          >
            {isSubmitting ? "Enviando..." : "Enviar código"}
          </button>

          <p className="login-card__footer">
            Lembrou a senha?{" "}
            <Link
              to="/login"
              onClick={(event) => {
                event.preventDefault();
                handleReturnToLogin();
              }}
            >
              Voltar para o login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
