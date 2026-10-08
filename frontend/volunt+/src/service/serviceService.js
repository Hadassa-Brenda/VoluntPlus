import { fetchServices, fetchServiceById, fetchReviews } from "../api/servicesApi";
import { mapServices } from "../mappers/serviceMapper";
import { CategoriaDTO } from "../types/DTOs/categoriaDTO";
import { mapBackendUserToFrontend } from "../api/userProfileStorage";

function mapRemoteServices(services) {
  return mapServices({
    services: services.map((service) => ({ ...service, idUsuario: service.ownerId ?? service.idUsuario, usuario: service.usuario ? mapBackendUserToFrontend(service.usuario) : undefined })),
    usuarios: [],
    categorias: CategoriaDTO,
    localizacoes: [],
    contatos: [],
    avaliacoes: [],
    agendamentos: [],
  });
}

export async function getServices() {
  return mapRemoteServices((await fetchServices()).filter((service) => service.status === "ATIVO"));
}

export async function getServiceById(id) {
  const [service, reviews] = await Promise.all([
    fetchServiceById(id),
    fetchReviews(id),
  ]);

  return mapRemoteServices([{
    ...service,
    avaliacoes: reviews.map((review) => ({
      ...review,
      idServico: review.serviceId,
      idUsuario: review.authorId,
      dataAvaliacao: review.dataCriacao,
    })),
  }])[0];
}
