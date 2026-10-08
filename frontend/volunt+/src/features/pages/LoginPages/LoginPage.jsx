import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, Search, ShieldCheck } from "lucide-react";

import {
  finalizeClerkSession,
  getClerkErrorMessage,
  getClerkFieldMessage,
  supportsEmailCodeSecondFactor,
} from "./utils/clerkAuthUtils";

import "./LoginPages.css";
import "../../../styles/global.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState("credentials");
  const [loginError, setLoginError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showClerkErrors, setShowClerkErrors] = useState(false);

  const isSubmitting = fetchStatus === "fetching";
  const isVerificationStep = step === "verification";

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isAuthLoaded, isSignedIn, navigate]);

  function clearFeedback() {
    setLoginError("");
    setStatusMessage("");
    setShowClerkErrors(false);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    clearFeedback();
  }

  async function finalizeLogin() {
    const result = await finalizeClerkSession(signIn, navigate);

    if (result.error) {
      setShowClerkErrors(true);
      setLoginError(
        getClerkErrorMessage(
          result.error,
          "Não foi possível ativar sua sessão. Tente novamente.",
        ),
      );
      return;
    }

    if (result.hasPendingTask) {
      setLoginError(
        "O Clerk solicitou uma etapa adicional antes de ativar a sessão.",
      );
    }
  }

  async function startEmailVerification() {
    if (!supportsEmailCodeSecondFactor(signIn)) {
      setLoginError(
        "Sua conta exige uma verificação adicional que ainda não está disponível nesta tela.",
      );
      return;
    }

    const { error } = await signIn.mfa.sendEmailCode();

    if (error) {
      setShowClerkErrors(true);
      setLoginError(
        getClerkErrorMessage(
          error,
          "Não foi possível enviar o código de verificação.",
        ),
      );
      return;
    }

    setForm((current) => ({ ...current, password: "" }));
    setStep("verification");
    setStatusMessage("Enviamos um código de segurança para seu e-mail.");
  }

  async function handleCredentialsSubmit() {
    if (!form.email.trim() || !form.password) {
      setLoginError("Informe seu e-mail e sua senha para continuar.");
      return;
    }

    const { error } = await signIn.password({
      emailAddress: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (error) {
      setShowClerkErrors(true);
      setLoginError(
        getClerkErrorMessage(error, "E-mail ou senha inválidos."),
      );
      return;
    }

    if (signIn.status === "complete") {
      setForm((current) => ({ ...current, password: "" }));
      await finalizeLogin();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await startEmailVerification();
      return;
    }

    setLoginError(
      "O Clerk solicitou uma etapa de autenticação não suportada nesta tela.",
    );
  }

  async function handleVerificationSubmit() {
    const code = verificationCode.trim();

    if (!code) {
      setLoginError("Informe o código recebido por e-mail.");
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code });

    if (error) {
      setShowClerkErrors(true);
      setLoginError(
        getClerkErrorMessage(
          error,
          "O código informado é inválido ou expirou.",
        ),
      );
      return;
    }

    if (signIn.status !== "complete") {
      setLoginError(
        "A verificação foi recebida, mas o Clerk ainda não concluiu o login.",
      );
      return;
    }

    await finalizeLogin();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthLoaded || isSubmitting) {
      return;
    }

    clearFeedback();

    try {
      if (isVerificationStep) {
        await handleVerificationSubmit();
      } else {
        await handleCredentialsSubmit();
      }
    } catch (error) {
      setLoginError(
        getClerkErrorMessage(
          error,
          "Não foi possível concluir o login agora. Tente novamente.",
        ),
      );
    }
  }

  async function handleResendCode() {
    if (isSubmitting) {
      return;
    }

    clearFeedback();

    try {
      const { error } = await signIn.mfa.sendEmailCode();

      if (error) {
        setShowClerkErrors(true);
        setLoginError(
          getClerkErrorMessage(error, "Não foi possível reenviar o código."),
        );
        return;
      }

      setStatusMessage("Um novo código foi enviado para seu e-mail.");
    } catch (error) {
      setLoginError(
        getClerkErrorMessage(error, "Não foi possível reenviar o código."),
      );
    }
  }

  async function handleChangeEmail() {
    if (isSubmitting) {
      return;
    }

    await signIn.reset();
    setStep("credentials");
    setVerificationCode("");
    clearFeedback();
  }

  const identifierError = showClerkErrors
    ? getClerkFieldMessage(errors, "identifier")
    : "";
  const passwordError = showClerkErrors
    ? getClerkFieldMessage(errors, "password")
    : "";
  const codeError = showClerkErrors
    ? getClerkFieldMessage(errors, "code")
    : "";
  const globalError = showClerkErrors
    ? getClerkErrorMessage(errors.global?.[0], "")
    : "";
  const visibleError =
    loginError || identifierError || passwordError || codeError || globalError;

  return (
    <main className="login-page">
      <section className="login-page__left">
        <header className="user-register-page__topbar">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate("/")}
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
          <span className="login-page__tag">Bem-vindo de volta</span>
          <h1>
            Entre para continuar <br />
            <span>ajudando</span> sua comunidade
          </h1>
          <p>
            Acesse sua conta para cadastrar serviços voluntários, encontrar
            oportunidades e se conectar com pessoas próximas.
          </p>
        </div>

        <div className="login-page__info-card">
          <Search size={22} />
          <div>
            <strong>Conecte-se com propósito</strong>
            <span>Encontre e ofereça ajuda de forma simples.</span>
          </div>
        </div>
      </section>

      <section className="login-page__right">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card__header">
            <span>Login</span>
            <h2>
              {isVerificationStep ? "Verificar acesso" : "Acessar conta"}
            </h2>
            <p>
              {isVerificationStep
                ? "Confirme o código de segurança enviado pelo Clerk."
                : "Informe seus dados para entrar na plataforma."}
            </p>
          </div>

          {!isVerificationStep ? (
            <>
              <label className="login-card__field">
                E-mail
                <div>
                  <Mail size={18} />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label className="login-card__field">
                Senha
                <div>
                  <Lock size={18} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <div className="login-card__options">
                <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
              </div>
            </>
          ) : (
            <>
              <label className="login-card__field">
                Código de segurança
                <div>
                  <ShieldCheck size={18} />
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(event) => {
                      setVerificationCode(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="Digite o código recebido"
                    autoComplete="one-time-code"
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <div className="login-card__inline-actions">
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isSubmitting}
                >
                  Alterar e-mail
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Reenviar código
                </button>
              </div>
            </>
          )}

          {statusMessage && (
            <p className="login-card__success" role="status">
              {statusMessage}
            </p>
          )}

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
            {isSubmitting
              ? "Processando..."
              : isVerificationStep
                ? "Confirmar código"
                : "Entrar"}
          </button>

          <p className="login-card__footer">
            Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
