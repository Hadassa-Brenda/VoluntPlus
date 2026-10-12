export function serviceValues(value) {
  if (Array.isArray(value)) return value.flatMap(serviceValues);
  if (value === null || value === undefined || value === "") return [];
  const text = String(value).trim();
  if (text.startsWith("[")) {
    try { return serviceValues(JSON.parse(text)); } catch { /* Legacy Java lists. */ }
  }
  return text.replace(/^\[|\]$/g, "").split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}
export function locationKey(service) {
  const location = service.localizacao || service;
  const parts = [location.estado, location.cidade, location.bairro]
    .map((value) => String(value || "").trim().toLocaleLowerCase("pt-BR"));
  return parts.some(Boolean) ? parts.join("|") : "";
}
