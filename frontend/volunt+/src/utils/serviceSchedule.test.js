import { formatServiceSchedule } from './serviceSchedule';

test('groups repeated combinations chronologically without duplicate shifts', () => {
 const schedules = ['QUARTA', 'TERCA', 'SEGUNDA'].flatMap(day => ['NOITE', 'TARDE', 'MANHA'].map(shift => ({ diaSemana: day, turno: shift })));
 expect(formatServiceSchedule([...schedules, schedules[0]])).toBe('Segunda-feira, Terça-feira e Quarta-feira: Manhã, Tarde e Noite');
});

test('keeps different availability separate instead of promising unavailable shifts', () => {
 expect(formatServiceSchedule([{ diaSemana: 'TERCA', turno: 'NOITE' }, { diaSemana: 'SEGUNDA', turno: 'MANHA' }, { diaSemana: 'QUARTA', turno: 'MANHA' }])).toBe('Segunda-feira e Quarta-feira: Manhã\nTerça-feira: Noite');
});

test('handles legacy array strings and empty schedules', () => {
 expect(formatServiceSchedule([{ diaSemana: '[TERCA, QUINTA]', turno: '[MANHA, TARDE]' }])).toBe('Terça-feira e Quinta-feira: Manhã e Tarde');
 expect(formatServiceSchedule()).toBe('Combine diretamente com o responsável');
});
