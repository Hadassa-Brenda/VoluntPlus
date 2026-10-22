import { locationKey, serviceValues } from "./serviceValues";
import { TIPO_LOCALIZACAO } from "types/enum/TipoLocalização";
import { GENDER_OPTIONS } from "types/enum/Gender";
import { DiaSemana } from "types/enum/DiaSemana";
import { Turno } from "types/enum/Turno";
import { Nota } from "types/enum/Nota";
import { SERVICE_MODALITIES } from "types/enum/Modalities";

export function getUniqueOptions(data = [], { value, label }) {
  const optionsMap = new Map();

  data.forEach((item) => {
    const optionValue = value(item);

    if (
      optionValue === null ||
      optionValue === undefined ||
      optionValue === ""
    ) {
      return;
    }

    const optionLabel = label(item);

    const values = Array.isArray(optionValue) ? optionValue : [optionValue];
    values.forEach((currentValue) => {
      if (currentValue !== null && currentValue !== undefined && String(currentValue).trim()) {
        optionsMap.set(String(currentValue), { value: currentValue, label: Array.isArray(optionLabel) ? String(currentValue) : optionLabel || String(currentValue) });
      }
    });
  });

  return [...optionsMap.values()];
}

export function getLocationOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) => locationKey(service),

    label: (service) => {
      const localizacao = service.localizacao;

      if (!localizacao) return "";

      return [localizacao.bairro, localizacao.cidade, localizacao.estado]
        .filter(Boolean)
        .join(" - ");
    },
  });
}

export function getStateOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) => service.localizacao?.estado ?? service.estado,

    label: (service) => service.localizacao?.estado ?? service.estado,
  });
}

export function getLocationTypeOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) =>
      service.localizacao?.tipoLocalizacao ??
      service.tipoLocalizacao ??
      service.typeLocalization,

    label: (service) => {
      const tipoValue =
        service.localizacao?.tipoLocalizacao ??
        service.tipoLocalizacao ??
        service.typeLocalization;

      const tipo = TIPO_LOCALIZACAO.find(
        (item) => String(item.value) === String(tipoValue),
      );

      return tipo?.label || String(tipoValue);
    },
  });
}

export function getCategoryOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) =>
      service.categoria?.id ?? service.category?.id ?? service.idCategoria ?? service.categoryId,

    label: (service) =>
      service.categoria?.nome ||
      service.categoria?.label ||
      service.category?.nome ||
      service.category?.name ||
      "",
  });
}

export function getModalityOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) =>
      serviceValues(service.modalities ?? service.modality ?? service.modalidade),

    label: (service) => {
      const modalidade = SERVICE_MODALITIES.find(
        (item) =>
          String(item.value) ===
          String(serviceValues(service.modalities ?? service.modality ?? service.modalidade)[0]),
      );

      return modalidade?.label || serviceValues(service.modalities ?? service.modality ?? service.modalidade)[0] || "";
    },
  });
}

export function getGenderOptions(data = []) {
  return getUniqueOptions(data, {
    value: (service) => service.usuario?.genero ?? service.genero,

    label: (service) => {
      const generoValue = service.usuario?.genero ?? service.genero;

      const genero = GENDER_OPTIONS.find(
        (item) => String(item.value) === String(generoValue),
      );

      return genero?.label || "";
    },
  });
}

export function getDayWeekOptions(data = []) {
  const days = data.flatMap((service) => {
    if (!service.agendamentos?.length) {
      return [];
    }

    return service.agendamentos.flatMap((agendamento) => serviceValues(agendamento.diaSemana));
  });

  return getUniqueOptions(days, {
    value: (day) => day,

    label: (day) => {
      const dia = DiaSemana.find((item) => String(item.value) === String(day));

      return dia?.label || String(day);
    },
  });
}

export function getShiftOptions(data = []) {
  const shifts = data.flatMap((service) => {
    if (!service.agendamentos?.length) {
      return [];
    }

    return service.agendamentos.flatMap((agendamento) => serviceValues(agendamento.turno));
  });

  return getUniqueOptions(shifts, {
    value: (shift) => shift,

    label: (shift) => {
      const turno = Turno.find((item) => String(item.value) === String(shift));

      return turno?.label || String(shift);
    },
  });
}

export function getScoreOptions() {
  return Nota.map((nota) => ({
    value: nota,
    label: `${nota} estrela${nota !== 1 ? "s" : ""}`,
  }));
}

export function getAge(services = []) {
  const idades = services
    .map((service) =>
      service.usuario?.idade ?? calculateAge(service.usuario?.dataNascimento ?? service.dataNascimento),
    )
    .filter((idade) => idade !== null && idade !== undefined);

  return getUniqueOptions(idades, {
    value: (idade) => idade,
    label: (idade) => `${idade} anos`,
  });
}
export function calculateAge(dataNascimento) {
  if (!dataNascimento) return null;

  const nascimento = new Date(dataNascimento);

  if (Number.isNaN(nascimento.getTime())) {
    return null;
  }

  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getUTCFullYear();

  const mesNascimento = nascimento.getUTCMonth();
  const diaNascimento = nascimento.getUTCDate();

  if (
    hoje.getMonth() < mesNascimento ||
    (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)
  ) {
    idade--;
  }

  return idade;
}
