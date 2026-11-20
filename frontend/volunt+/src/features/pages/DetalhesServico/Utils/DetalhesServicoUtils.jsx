export function formatInstagram(instagram) {
  if (!instagram) {
    return "";
  }

  const username = instagram
    .replace("https://www.instagram.com/", "")
    .replace("https://instagram.com/", "")
    .replace("/", "")
    .replace("@", "");

  return `@${username}`;
}

export function buildInstagramLink(instagram) {
  if (!instagram) {
    return "#";
  }

  if (instagram.startsWith("http")) {
    return instagram;
  }

  const username = instagram.replace("@", "");

  return `https://www.instagram.com/${username}`;
}

export function formatDate(date) {
  if (!date) {
    return "Não informado";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não informado";
  }

  return parsedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPhone(phone) {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(/\D/g, "");
  const localNumber =
    digits.length > 11 ? digits.slice(digits.length - 11) : digits;

  if (localNumber.length !== 11) {
    return phone;
  }

  return localNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function buildWhatsAppLink(phone, serviceTitle) {
  if (!phone) {
    return "#";
  }

  const digits = phone.replace(/\D/g, "");
  const numberWithCountryCode = digits.startsWith("55")
    ? digits
    : `55${digits}`;

  const message = encodeURIComponent(
    `Olá! Encontrei o serviço "${serviceTitle}" na plataforma Volunt+ e gostaria de saber mais.`,
  );

  return `https://wa.me/${numberWithCountryCode}?text=${message}`;
}

export function formatLocation(service) {
  const location = [
    service.localizacao?.bairro,
    service.localizacao?.cidade,
    service.localizacao?.estado,
  ].filter(Boolean);

  return location.join(", ");
}
