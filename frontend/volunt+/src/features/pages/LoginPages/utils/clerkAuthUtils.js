const CLERK_ERROR_MESSAGES = {
  form_password_incorrect: "A senha informada está incorreta.",
  form_password_pwned: "Escolha uma senha diferente para proteger sua conta.",
  form_identifier_exists: "Este e-mail já está cadastrado.",
  form_identifier_not_found: "Não encontramos uma conta com este e-mail.",
  form_email_address_invalid: "Informe um endereço de e-mail válido.",
  form_code_incorrect: "O código informado está incorreto.",
  verification_code_incorrect: "O código informado está incorreto.",
  verification_failed: "Não foi possível confirmar o código. Confira e tente novamente.",
  verification_expired: "Este código expirou. Solicite um novo código.",
  verification_code_expired: "Este código expirou. Solicite um novo código.",
};

function translateClerkMessage(message) {
  if (!message) {
    return "";
  }

  if (/[áàâãéêíóôõúüç]|\bnão\b|\be-mail\b|\bsenha\b|\bcódigo\b/i.test(message)) {
    return message;
  }

  const normalized = message.toLowerCase();

  if (/password.*(incorrect|invalid|wrong)|(incorrect|invalid|wrong).*password/.test(normalized)) {
    return "A senha informada está incorreta.";
  }
  if (/password.*(short|characters)|(short|characters).*password/.test(normalized)) {
    const minimum = message.match(/(\d+)\s+characters?/i)?.[1];
    return minimum
      ? `A senha deve ter pelo menos ${minimum} caracteres.`
      : "A senha é muito curta para os requisitos desta conta.";
  }
  if (/email.*invalid|invalid.*email|email address.*valid/.test(normalized)) {
    return "Informe um endereço de e-mail válido.";
  }
  if (/email|identifier|account/.test(normalized) && /(already|exists|taken|in use)/.test(normalized)) {
    return "Este e-mail já está cadastrado.";
  }
  if (/code.*(incorrect|invalid|wrong)|(incorrect|invalid|wrong).*code/.test(normalized)) {
    return "O código informado está incorreto.";
  }
  if (/code.*expired|expired.*code|verification.*expired/.test(normalized)) {
    return "Este código expirou. Solicite um novo código.";
  }

  return "";
}

export function getClerkErrorMessage(error, fallbackMessage = "") {
  if (!error) {
    return fallbackMessage;
  }

  const detail = error.errors?.[0] || error;
  const codeMessage =
    CLERK_ERROR_MESSAGES[detail.code] || CLERK_ERROR_MESSAGES[error.code];
  const message =
    detail.longMessage ||
    detail.long_message ||
    detail.message ||
    error.longMessage ||
    error.long_message ||
    error.message;

  if (detail.code === "form_password_length_too_short" || error.code === "form_password_length_too_short") {
    return translateClerkMessage(message) || "A senha é muito curta para os requisitos desta conta.";
  }

  return (
    codeMessage ||
    translateClerkMessage(message) ||
    message ||
    fallbackMessage ||
    "Não foi possível concluir esta etapa. Tente novamente."
  );
}

export function getClerkFieldMessage(errors, field) {
  const error = errors?.fields?.[field];

  return error ? getClerkErrorMessage(error, "Não foi possível validar este campo.") : "";
}

export function supportsEmailCodeSecondFactor(signIn) {
  return signIn.supportedSecondFactors.some(
    (factor) => factor.strategy === "email_code",
  );
}

export async function finalizeClerkSession(authenticationAttempt, navigate) {
  let hasPendingTask = false;

  const { error } = await authenticationAttempt.finalize({
    navigate: ({ session, decorateUrl }) => {
      if (session?.currentTask) {
        hasPendingTask = true;
        return;
      }

      const destination = decorateUrl("/");

      if (/^https?:\/\//.test(destination)) {
        window.location.assign(destination);
        return;
      }

      navigate(destination, { replace: true });
    },
  });

  return { error, hasPendingTask };
}
