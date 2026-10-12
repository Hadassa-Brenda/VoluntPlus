import { DiaSemana } from '../types/enum/DiaSemana';
import { Turno } from '../types/enum/Turno';
import { serviceValues } from './serviceValues';

function ordered(values, options) {
  return [...values].sort((a, b) => {
    const rank = (value) => {
      const index = options.findIndex((option) => String(option.value) === value);
      return index < 0 ? options.length : index;
    };
    return rank(a) - rank(b) || a.localeCompare(b);
  });
}

function labels(values, options) {
  const list = values.map((value) => options.find((option) => String(option.value) === value)?.label || value);
  return new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(list);
}

// Group only days with identical shifts, preserving distinct availability.
export function formatServiceSchedule(schedules = []) {
  const byDay = new Map();
  schedules.forEach((schedule) => {
    serviceValues(schedule.diaSemana).forEach((day) => {
      if (!byDay.has(day)) byDay.set(day, new Set());
      serviceValues(schedule.turno).forEach((shift) => byDay.get(day).add(shift));
    });
  });
  const groups = new Map();
  ordered(byDay.keys(), DiaSemana).forEach((day) => {
    const shifts = ordered(byDay.get(day), Turno);
    const key = JSON.stringify(shifts);
    if (!groups.has(key)) groups.set(key, { days: [], shifts });
    groups.get(key).days.push(day);
  });
  return [...groups.values()].map(({ days, shifts }) =>
    `${labels(days, DiaSemana)}: ${shifts.length ? labels(shifts, Turno) : 'Turno a combinar'}`
  ).join('\n') || 'Combine diretamente com o responsável';
}
