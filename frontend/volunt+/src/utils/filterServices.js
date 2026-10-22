import { locationKey, serviceValues } from "./serviceValues";
import { calculateAge } from "../utils/optionsUtils";

function matchesFilter(selectedValues, serviceValue) {
  if (!selectedValues?.length) {
    return true;
  }

  if (serviceValue === null || serviceValue === undefined) {
    return false;
  }

  const values = serviceValues(serviceValue);

  return selectedValues.some((selectedValue) =>
    values.some(
      (currentValue) => String(selectedValue).trim().toLowerCase() === String(currentValue).trim().toLowerCase(),
    ),
  );
}

export function getServiceRating(service) {
  const reviews = service.avaliacoes ?? service.reviews ?? service.avaliacao;
  const entries = Array.isArray(reviews) ? reviews : reviews ? [reviews] : [];
  const scores = entries
    .map((review) => Number(review?.nota ?? review?.rating ?? review?.score ?? review))
    .filter((score) => Number.isFinite(score) && score >= 1 && score <= 5);

  // Prefer actual reviews when available; otherwise use the API aggregate.
  if (scores.length) {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  const aggregate = Number(
    service.avaliacaoMedia ?? service.averageRating ?? service.rating ?? 0,
  );
  return Number.isFinite(aggregate) && aggregate >= 1 && aggregate <= 5
    ? aggregate
    : 0;
}

export function filterServices(services = [], filters = {}) {
  return services.filter((service) => {
    if (service.status && !["ATIVO", "ACTIVE"].includes(String(service.status).toUpperCase())) return false;
    if (filters.search?.trim()) {
      const search = filters.search.trim().toLowerCase();

      const matchesSearch = [
        service.name,
        service.titulo,
        service.descricao,
        service.description,
        service.categoria?.nome || service.category?.name,
        service.localizacao?.bairro || service.bairro,
        service.localizacao?.cidade || service.cidade,
        service.localizacao?.estado || service.estado,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      );

      if (!matchesSearch) {
        return false;
      }
    }

    if (
      !matchesFilter(
        filters.locations,
        locationKey(service),
      )
    ) {
      return false;
    }

    if (
      !matchesFilter(
        filters.category,
        service.categoria?.id ?? service.category?.id ?? service.idCategoria ?? service.categoryId,
      )
    ) {
      return false;
    }

    if (
      !matchesFilter(
        filters.modality,
        service.modalities ?? service.modality ?? service.modalidade,
      )
    ) {
      return false;
    }

    if (
      !matchesFilter(
        filters.state,
        service.localizacao?.estado ?? service.estado,
      )
    ) {
      return false;
    }

    if (
      !matchesFilter(
        filters.typeLocalization,
        service.localizacao?.tipoLocalizacao ??
          service.tipoLocalizacao ??
          service.typeLocalization,
      )
    ) {
      return false;
    }

    if (
      !matchesFilter(filters.genero, service.usuario?.genero ?? service.genero)
    ) {
      return false;
    }

    if (
      !matchesFilter(
        filters.providerType,
        service.usuario?.tipoUsuario ?? service.tipoUsuario,
      )
    ) {
      return false;
    }

    if (filters.dataNascimento?.length) {
      const idade = service.usuario?.idade ?? calculateAge(
        service.usuario?.dataNascimento ?? service.dataNascimento,
      );

      if (!matchesFilter(filters.dataNascimento, idade)) {
        return false;
      }
    }

    if (filters.diaDaSemana?.length) {
      const hasDay = service.agendamentos?.some((agendamento) =>
        matchesFilter(filters.diaDaSemana, serviceValues(agendamento.diaSemana)),
      );

      if (!hasDay) {
        return false;
      }
    }

    if (filters.turno?.length) {
      const hasShift = service.agendamentos?.some((agendamento) =>
        matchesFilter(filters.turno, serviceValues(agendamento.turno)),
      );

      if (!hasShift) {
        return false;
      }
    }

    if (filters.avaliacao?.length) {
      const rating = getServiceRating(service);
      // A selected star count represents its rating band, not a minimum.
      // Example: 4 stars matches averages from 4.0 to 4.99.
      const hasMinimumRating = rating >= 1 && filters.avaliacao.some(
        (selectedRating) => Math.floor(rating) === Number(selectedRating),
      );

      if (!hasMinimumRating) {
        return false;
      }
    }

    return true;
  });
}
