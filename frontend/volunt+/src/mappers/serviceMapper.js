import { serviceValues } from "../utils/serviceValues";
function expandSchedules(schedules = []) {
  return schedules.flatMap((schedule) => {
    const days = serviceValues(schedule.diaSemana);
    const shifts = serviceValues(schedule.turno);

    return days.flatMap((day) =>
      shifts.map((shift) => ({
        ...schedule,
        diaSemana: day,
        turno: shift,
      })),
    );
  });
}

export function mapServices({
  services,
  usuarios,
  categorias,
  localizacoes,
  contatos,
  avaliacoes,
  agendamentos,
}) {
  return services.map((service) => {
    const hasEmbeddedReviews =
      Array.isArray(service.avaliacoes) || Array.isArray(service.reviews);
    const serviceReviews = Array.isArray(service.avaliacoes)
      ? service.avaliacoes
      : Array.isArray(service.reviews)
        ? service.reviews
        : avaliacoes.filter(
            (avaliacao) => String(avaliacao.idServico) === String(service.id),
          );

    const ratingSum = serviceReviews.reduce(
      (sum, avaliacao) => sum + Number(avaliacao.nota || 0),
      0,
    );

    const reviewsCountFromApi =
      service.quantidadeAvaliacoes ?? service.reviewCount;
    const averageRatingFromApi = service.avaliacaoMedia ?? service.averageRating;
    const reviewsCount = hasEmbeddedReviews
      ? serviceReviews.length
      : Number.isFinite(Number(reviewsCountFromApi))
        ? Number(reviewsCountFromApi)
        : serviceReviews.length;
    const calculatedRatingAverage = serviceReviews.length
      ? Number((ratingSum / serviceReviews.length).toFixed(1))
      : 0;
    const ratingAverage = hasEmbeddedReviews
      ? calculatedRatingAverage
      : Number.isFinite(Number(averageRatingFromApi))
        ? Number(Number(averageRatingFromApi).toFixed(1))
        : calculatedRatingAverage;

    const mappedLocation =
      service.localizacao ||
      (service.cidade || service.estado || service.bairro
        ? {
            cep: service.cep,
            id: service.idLocalizacao,
            cidade: service.cidade,
            estado: service.estado,
            bairro: service.bairro,
            tipoLocalizacao:
              service.tipoLocalizacao || service.typeLocalization,
          }
        : undefined);

    const mappedContact =
      service.contato ||
      (service.whatsapp || service.telefone || service.instagram || service.site
        ? {
            telefone: service.whatsapp || service.telefone,
            instagram: service.instagram,
            site: service.site,
          }
        : undefined);

    const mappedSchedules = Array.isArray(service.agendamentos)
      ? service.agendamentos
      : agendamentos.filter(
          (agendamento) => String(agendamento.idServico) === String(service.id),
        );

    const fallbackSchedules =
      service.diaDaSemana || service.turno
        ? [{ diaSemana: service.diaDaSemana, turno: service.turno }]
        : [];

    const serviceSchedules = expandSchedules(
      mappedSchedules.length ? mappedSchedules : fallbackSchedules,
    );

    return {
      ...service,

      usuario:
        service.usuario ||
        usuarios.find(
          (usuario) => String(usuario.id) === String(service.idUsuario),
        ),

      categoria:
        service.categoria ||
        categorias.find(
          (categoria) => String(categoria.id) === String(service.idCategoria),
        ),

      localizacao:
        mappedLocation ||
        service.localizacao ||
        localizacoes.find(
          (localizacao) =>
            String(localizacao.id) === String(service.idLocalizacao),
        ),

      contato:
        mappedContact ||
        contatos.find(
          (contato) => String(contato.idServico) === String(service.id),
        ),

      avaliacoes: serviceReviews,

      avaliacaoMedia: ratingAverage,

      quantidadeAvaliacoes: reviewsCount,

      agendamentos: serviceSchedules,
    };
  });
}
