import { locationKey, serviceValues } from "./serviceValues";
import { calculateAge } from "../utils/optionsUtils";

function matchesFilter(selectedValues, serviceValue) {
  if (!selectedValues?.length) {
    return true;
  }

  if (serviceValue === null || serviceValue === undefined) {
    return false;
  }

  const serviceValues = Array.isArray(serviceValue)
    ? serviceValue
    : [serviceValue];

  return selectedValues.some((selectedValue) =>
    serviceValues.some(
      (currentValue) => String(selectedValue) === String(currentValue),
    ),
  );
}

function getServiceRating(service) {
  if (service.avaliacaoMedia !== undefined) {
    return Number(service.avaliacaoMedia) || 0;
  }

  const evaluations = Array.isArray(service.avaliacao)
    ? service.avaliacao
    : service.avaliacao
      ? [service.avaliacao]
      : [];

  if (!evaluations.length) {
    return 0;
  }

  return (
    evaluations.reduce(
      (sum, evaluation) => sum + Number(evaluation.nota || 0),
      0,
    ) / evaluations.length
  );
}

export function filterServices(services = [], filters = {}) {
  return services.filter((service) => {
    if (service.status && service.status !== "ATIVO") return false;
    if (filters.search?.trim()) {
      const search = filters.search.trim().toLowerCase();

      const matchesSearch = [
        service.name,
        service.descricao,
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
        service.categoria?.id ?? service.category?.id ?? service.idCategoria,
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
      const hasMinimumRating = filters.avaliacao.some(
        (selectedRating) => rating >= Number(selectedRating),
      );

      if (!hasMinimumRating) {
        return false;
      }
    }

    return true;
  });
}
