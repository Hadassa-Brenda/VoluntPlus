import { mapServices } from '../mappers/serviceMapper';
import { mapBackendUserToFrontend } from '../api/userProfileStorage';
import { filterServices } from './filterServices';
import { getDayWeekOptions, getLocationOptions, getGenderOptions, getAge } from './optionsUtils';

const map = (services) => mapServices({ services, usuarios: [], categorias: [], localizacoes: [], contatos: [], avaliacoes: [], agendamentos: [] });
const active = { id: 1, status: 'ATIVO', bairro: 'Centro', cidade: 'Recife', estado: 'PE', tipoLocalizacao: '2', diaDaSemana: '[SEGUNDA, TERCA, QUARTA, QUINTA]', turno: '[MANHA, TARDE]', usuario: mapBackendUserToFrontend({ id: 7, personType: 'INDIVIDUAL', currentRole: 'OFFERER', gender: 'FEMALE', idade: 31 }) };

test('legacy schedules become separate days and survive individual day filters', () => {
 const services = map([active]);
 expect(getDayWeekOptions(services).map(option => option.value)).toEqual(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA']);
 expect(filterServices(services, { diaDaSemana: ['QUARTA'] })).toHaveLength(1);
 expect(filterServices(services, { diaDaSemana: ['SEXTA'] })).toHaveLength(0);
});

test('location without a database id, gender, age and location type filter the catalog', () => {
 const services = map([active, { ...active, id: 2, cidade: 'Olinda', tipoLocalizacao: '1', usuario: mapBackendUserToFrontend({ gender: 'MALE', idade: 40 }) }]);
 const location = getLocationOptions(services)[0].value;
 expect(getLocationOptions(services)).toHaveLength(2);
 expect(getGenderOptions(services).map(option => option.value)).toEqual(['F', 'M']);
 expect(getAge(services).map(option => option.value)).toEqual([31, 40]);
 expect(filterServices(services, { locations: [location], genero: ['F'], dataNascimento: [31], typeLocalization: ['2'] }).map(service => service.id)).toEqual([1]);
 expect(filterServices(services, { genero: ['M'], dataNascimento: [31] })).toHaveLength(0);
});

test('inactive services stay out of public results', () => {
 expect(filterServices(map([{ ...active, status: 'INATIVO' }]))).toEqual([]);
});

test('new JSON arrays also produce separate schedule options', () => {
 expect(getDayWeekOptions(map([{ ...active, diaDaSemana: '["TERCA","QUINTA"]' }])).map(option => option.value)).toEqual(['TERCA', 'QUINTA']);
});

test('catalog preserves review aggregates returned by the backend', () => {
 const [service] = map([{ ...active, avaliacaoMedia: 4, quantidadeAvaliacoes: 1 }]);

 expect(service.avaliacaoMedia).toBe(4);
 expect(service.quantidadeAvaliacoes).toBe(1);
});
