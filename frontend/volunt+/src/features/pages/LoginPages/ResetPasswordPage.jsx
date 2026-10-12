import { PASSWORD_MIN_LENGTH, PASSWORD_HINT } from "./utils/passwordPolicy";
import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./LoginPages.css";

import {
  finalizeClerkSession,
  getClerkErrorMessage,
  getClerkFieldMessage,
  supportsEmailCodeSecondFactor,
} from "./utils/clerkAuthUtils";

function getInitialStep(status) {
  if (status === "needs_new_password") {
    return "newPassword";
  }

  if (status === "needs_second_factor" || status === "needs_client_trust") {
    return "securityCode";
  }

  return "resetCode";
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [step, setStep] = useState(() => getInitialStep(signIn.status));
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showClerkErrors, setShowClerkErrors] = useState(false);

  const isSubmitting = fetchStatus === "fetching";
  const hasResetAttempt = Boolean(signIn.id);
  const emailAddress = location.state?.emailAddress || "seu e-mail";

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isAuthLoaded, isSignedIn, navigate]);

  function clearFeedback() {
    setStatus({ type: "", message: "" });
    setShowClerkErrors(false);
  }

  function setError(error, fallbackMessage) {
    setShowClerkErrors(true);
    setStatus({
      type: "error",
      message: getClerkErrorMessage(error, fallbackMessage),
    });
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    clearFeedback();
  }

  async function finalizeReset() {
    const result = await finalizeClerkSession(signIn, navigate);

    if (result.error) {
      setError(
        result.error,
        "A senha foi atualizada, mas não foi possível ativar sua sessão.",
      );
      return;
    }

    if (result.hasPendingTask) {
      setStatus({
        type: "error",
        message:
          "O Clerk solicitou uma etapa adicional antes de ativar a sessão.",
      });
    }
  }

  async function sendSecurityCode() {
    if (!supportsEmailCodeSecondFactor(signIn)) {
      setStatus({
        type: "error",
        message:
          "Sua conta exige uma verificação adicional que não está disponível nesta tela.",
      });
      return;
    }

    const { error } = await signIn.mfa.sendEmailCode();

    if (error) {
      setError(error, "Não foi possível enviar o código de segurança.");
      return;
    }

    setCode("");
    setStep("securityCode");
    setStatus({
      type: "success",
      message: "Enviamos um código adicional de segurança para seu e-mail.",
    });
  }

  async function handleResetCodeSubmit() {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setStatus({
        type: "error",
        message: "Informe o código de recuperação recebido por e-mail.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: normalizedCode,
    });

    if (error) {
      setError(error, "O código informado é inválido ou expirou.");
      return;
    }

    if (signIn.status !== "needs_new_password") {
      setStatus({
        type: "error",
        message: "O Clerk ainda não liberou a definição de uma nova senha.",
      });
      return;
    }

    setCode("");
    setStep("newPassword");
    clearFeedback();
  }

  async function handleNewPasswordSubmit() {
    if ([...form.password].length < PASSWORD_MIN_LENGTH) {
      setStatus({
        type: "error",
        message: `A nova senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({
        type: "error",
        message: "As senhas não conferem.",
      });
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: form.password,
      signOutOfOtherSessions: true,
    });

    if (error) {
      setError(error, "Não foi possível redefinir a senha.");
      return;
    }

    setForm({ password: "", confirmPassword: "" });

    if (signIn.status === "complete") {
      await finalizeReset();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await sendSecurityCode();
      return;
    }

    setStatus({
      type: "error",
      message:
        "O Clerk não confirmou a atualização da senha. Revise os requisitos e tente novamente.",
    });
  }

  async function handleSecurityCodeSubmit() {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setStatus({
        type: "error",
        message: "Informe o código adicional de segurança.",
      });
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({
      code: normalizedCode,
    });

    if (error) {
      setError(error, "O código informado é inválido ou expirou.");
      return;
    }

    if (signIn.status !== "complete") {
      setStatus({
        type: "error",
        message:
          "A verificação foi recebida, mas o Clerk ainda não concluiu o acesso.",
      });
      return;
    }

    await finalizeReset();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isAuthLoaded || isSubmitting || !hasResetAttempt) {
      return;
    }

    clearFeedback();

    try {
      if (step === "resetCode") {
        await handleResetCodeSubmit();
      } else if (step === "newPassword") {
        await handleNewPasswordSubmit();
      } else {
        await handleSecurityCodeSubmit();
      }
    } catch (error) {
      setError(error, "Não foi possível concluir a redefinição da senha.");
    }
  }

  async function handleResendCode() {
    if (isSubmitting || !hasResetAttempt) {
      return;
    }

    clearFeedback();

    try {
      const delivery =
        step === "securityCode"
          ? await signIn.mfa.sendEmailCode()
          : await signIn.resetPasswordEmailCode.sendCode();

      if (delivery.error) {
        setError(delivery.error, "Não foi possível reenviar o código.");
        return;
      }

      setStatus({
        type: "success",
        message: "Um novo código foi enviado para seu e-mail.",
      });
    } catch (error) {
      setError(error, "Não foi possível reenviar o código.");
    }
  }

  async function handleChangeEmail() {
    if (isSubmitting) {
      return;
    }

    await signIn.reset();
    navigate("/esqueci-minha-senha", { replace: true });
  }

  async function handleReturnToLogin() {
    if (signIn.id) {
      await signIn.reset();
    }

    navigate("/login");
  }

  const fieldError = showClerkErrors
    ? getClerkFieldMessage(
        errors,
        step === "newPassword" ? "password" : "code",
      )
    : "";
  const globalError = showClerkErrors
    ? getClerkErrorMessage(errors.global?.[0], "")
    : "";
  const visibleMessage = status.message || fieldError || globalError;
  const isError = Boolean(fieldError || globalError || status.type === "error");

  const content = {
    resetCode: {
      tag: "Código de recuperação",
      title: "Confirmar código",
      description: `Digite o código enviado pelo Clerk para ${emailAddress}.`,
      button: "Validar código",
    },
    newPassword: {
      tag: "Redefinir senha",
      title: "Atualizar acesso",
      description: "Crie uma nova senha para sua identidade Clerk.",
      button: "Salvar nova senha",
    },
    securityCode: {
      tag: "Verificação de segurança",
      title: "Confirmar acesso",
      description: "Digite o código adicional enviado pelo Clerk.",
      button: "Confirmar código",
    },
  }[step];

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
          <span className="login-page__tag">Acesso</span>
          <h1>
            Nova <span>senha</span>
          </h1>
          <p>
            Confirme sua identidade e atualize sua senha com segurança pelo
            Clerk.
          </p>
        </div>
      </section>

      <section className="login-page__right">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card__header">
            <span>{content.tag}</span>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>

          {!hasResetAttempt ? (
            <p className="login-card__error" role="alert">
              A solicitação de recuperação expirou ou não foi iniciada neste
              navegador. Solicite um novo código.
            </p>
          ) : step === "newPassword" ? (
            <>
              <label className="login-card__field">
                Nova senha
                <div>
                  <Lock size={18} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Digite a nova senha"
                    autoComplete="new-password"
                    placeholder={PASSWORD_HINT}
                    disabled={isSubmitting}
                  />
                </div>
              </label>

              <label className="login-card__field">
                Confirmar senha
                <div>
                  <Lock size={18} />
                  <input
                    required
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Confirme a nova senha"
                    autoComplete="new-password"
                    placeholder={PASSWORD_HINT}
                    disabled={isSubmitting}
                  />
                </div>
              </label>
            </>
          ) : (
            <>
              <label className="login-card__field">
                {step === "securityCode"
                  ? "Código de segurança"
                  : "Código de recuperação"}
                <div>
                  <ShieldCheck size={18} />
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
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

          {visibleMessage && hasResetAttempt && (
            <p
              className={isError ? "login-card__error" : "login-card__success"}
              role={isError ? "alert" : "status"}
            >
              {visibleMessage}
            </p>
          )}

          {hasResetAttempt && (
            <button
              className="login-card__button"
              type="submit"
              disabled={isSubmitting || !isAuthLoaded}
            >
              {isSubmitting ? "Processando..." : content.button}
            </button>
          )}

          <p className="login-card__footer">
            {!hasResetAttempt ? (
              <Link to="/esqueci-minha-senha">Solicitar novo código</Link>
            ) : (
              <>
                Voltar para{" "}
                <Link
                  to="/login"
                  onClick={(event) => {
                    event.preventDefault();
                    handleReturnToLogin();
                  }}
                >
                  login
                </Link>
              </>
            )}
          </p>
        </form>
      </section>
    </main>
  );
}
