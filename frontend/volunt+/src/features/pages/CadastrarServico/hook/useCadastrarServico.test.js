import { act, renderHook } from '@testing-library/react';
import { useCadastrarServico } from './useCadastrarServico';
import { createService } from '../../../../api/servicesApi';
jest.mock('../../../../api/servicesApi', () => ({ createService: jest.fn() }));
jest.mock('../../../../context/CurrentUserContext', () => ({ useCurrentUser: () => ({ user: { id: 1 }, loading: false }) }));

test('reaching review does not save, and submission requires explicit confirmation', async () => {
 window.scrollTo = jest.fn();
 createService.mockResolvedValue({ id: 9 });
 const { result } = renderHook(() => useCadastrarServico());
 act(() => result.current.setFormData({ name: 'Aula', descricao: 'Uma aula gratuita para toda a comunidade.', categorias: ['1'], modalities: 'ONLINE', diaSemana: ['TERCA', 'QUINTA'], turno: ['MANHA'], site: 'https://example.com' }));
 act(() => result.current.nextStep());
 act(() => result.current.nextStep());
 act(() => result.current.nextStep());
 expect(result.current.currentStep).toBe(4);
 expect(createService).not.toHaveBeenCalled();
 await act(async () => result.current.handleSubmit({ preventDefault() {} }));
 expect(createService).not.toHaveBeenCalled();
 act(() => result.current.handleChange({ target: { name: 'reviewConfirmed', type: 'checkbox', checked: true } }));
 await act(async () => result.current.handleSubmit({ preventDefault() {} }));
 expect(createService).toHaveBeenCalledTimes(1);
 expect(result.current.submitted).toBe(true);
});
