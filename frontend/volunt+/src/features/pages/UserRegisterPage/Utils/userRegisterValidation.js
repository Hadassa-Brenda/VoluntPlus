import { PASSWORD_MIN_LENGTH } from "../../LoginPages/utils/passwordPolicy";
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getOnlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

export function formatCnpj(value) {
  const numbers = getOnlyNumbers(value).slice(0, 14);

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function isValidCnpj(value) {
  const numbers = getOnlyNumbers(value);

  if (numbers.length !== 14 || /^([0-9])\1{13}$/.test(numbers)) {
    return false;
  }

  const calculateDigit = (length) => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = numbers
      .slice(0, length)
      .split("")
      .reduce(
        (total, digit, index) => total + Number(digit) * weights[index],
        0,
      );
    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    calculateDigit(12) === Number(numbers[12]) &&
    calculateDigit(13) === Number(numbers[13])
  );
}

export function validateField(field, value, form) {
  const textValue = String(value || "").trim();

  switch (field) {
    case "fullName":
      if (textValue.length < 3) {
        return "Informe seu nome completo.";
      }

      return "";

    case "email":
      if (!isValidEmail(textValue)) {
        return "Informe um e-mail válido.";
      }

      return "";

    case "cnpj":
      if (form.tipoUsuario !== "PJ" || !textValue) {
        return "";
      }

      if (!isValidCnpj(value)) {
        return "Informe um CNPJ válido.";
      }

      return "";

    case "tipoUsuario":
      return textValue ? "" : "Selecione o tipo de usuário.";

    case "perfilUsuario":
      return textValue ? "" : "Selecione o tipo de perfil.";

    case "gender":
      return form.tipoUsuario === "PF" && !textValue
        ? "Selecione o gênero."
        : "";

    case "dataNascimento":
      if (form.tipoUsuario !== "PF") {
        return "";
      }

      if (!textValue) {
        return "Informe a data de nascimento.";
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
        return "Informe uma data válida.";
      }

      if (new Date(`${textValue}T00:00:00`) > new Date()) {
        return "A data de nascimento não pode ser futura.";
      }

      return "";

    case "password":
      if ([...String(value || "")].length < PASSWORD_MIN_LENGTH) {
        return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
      }

      return "";

    case "confirmPassword":
      if (textValue !== form.password) {
        return "As senhas não conferem.";
      }

      return "";

    default:
      return "";
  }
}

export function validateForm(form) {
  const errors = {};

  Object.keys(form).forEach((field) => {
    const error = validateField(field, form[field], form);

    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function validateIdentityForm(form) {
  const errors = {};

  ["email", "password", "confirmPassword"].forEach((field) => {
    const error = validateField(field, form[field], form);

    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
