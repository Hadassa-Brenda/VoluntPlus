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
  if (service.avaliacaoMedia !== undefined && service.avaliacaoMedia !== null) {
    return Number(service.avaliacaoMedia) || 0;
  }

  const evaluations = service.avaliacoes ?? service.reviews ?? service.avaliacao ?? [];
  const reviews = Array.isArray(evaluations) ? evaluations : [evaluations];

  if (!reviews.length) {
    return 0;
  }

  return (
    reviews.reduce(
      (sum, evaluation) => sum + Number(evaluation.nota || 0),
      0,
    ) / reviews.length
  );
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
      const hasMinimumRating = rating > 0 && filters.avaliacao.some(
        (selectedRating) => rating >= Number(selectedRating),
      );

      if (!hasMinimumRating) {
        return false;
      }
    }

    return true;
  });
}
