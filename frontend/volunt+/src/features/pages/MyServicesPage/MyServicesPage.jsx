import {
  BarChart3,
  Edit3,
  Eye,
  Trash2,
  Plus,
  UserRound,
  LogOut,
  ArrowLeft,
  Power,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";
import { useCurrentUser } from "../../../context/CurrentUserContext";

import { useEffect, useMemo, useState } from "react";

import Button from "../../../components/Button/Button";

import { deleteService, fetchMyServices, updateService } from "../../../api/servicesApi";
import { SERVICE_STATUS } from "../../../types/enum/Status";

import "./MyServicesPage.css";

export default function MyServicesPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useCurrentUser();

  const name = user?.fullName || user?.name || "Usuário";

  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchMyServices().then(setServices).catch((error) => {
      console.error("Erro ao carregar meus serviços:", error);
    });
  }, []);

  const [activeTab, setActiveTab] = useState("todos");

  const myServices = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return services.filter(
      (service) => String(service.ownerId) === String(user.id),
    );
  }, [services, user]);

  const totalServices = myServices.length;

  const activeServices = myServices.filter(
    (service) => service.status === SERVICE_STATUS[0].value,
  ).length;

  const inactiveServices = myServices.filter(
    (service) => service.status === SERVICE_STATUS[1].value,
  ).length;

  const filteredServices = useMemo(() => {
    if (activeTab === "ativos") {
      return myServices.filter(
        (service) => service.status === SERVICE_STATUS[0].value,
      );
    }

    if (activeTab === "inativos") {
      return myServices.filter(
        (service) => service.status === SERVICE_STATUS[1].value,
      );
    }

    return myServices;
  }, [myServices, activeTab]);

  async function handleDelete(serviceId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este serviço?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteService(serviceId);
      setServices((current) => current.filter((service) => String(service.id) !== String(serviceId)));
    } catch (error) {
      alert("Não foi possível excluir o serviço.");
    }
  }

  async function handleToggleStatus(serviceId) {
    const service = services.find((item) => String(item.id) === String(serviceId));
    if (!service) return;
    const status = service.status === SERVICE_STATUS[0].value
      ? SERVICE_STATUS[1].value : SERVICE_STATUS[0].value;
    try {
      const updated = await updateService(serviceId, { status });
      setServices((current) => current.map((item) => String(item.id) === String(serviceId) ? updated : item));
    } catch (error) {
      alert("Não foi possível alterar o status do serviço.");
    }
  }

  async function handleLogout() {
    await signOut({ redirectUrl: "/" });
  }

  function getStatusLabel(status) {
    return (
      SERVICE_STATUS.find((item) => item.value === status)?.label ||
      "Não informado"
    );
  }

  function getStatusClass(status) {
    return `status-${String(status).toLowerCase().replace(/\s+/g, "-")}`;
  }

  return (
    <main className="user-dashboard">
      <aside className="user-sidebar">
        <Button
          className="catalog-back-button"
          variant="ghost"
          size="small"
          onClick={() => navigate("/")}
          icon={<ArrowLeft size={18} />}
        >
          Voltar
        </Button>

        <div className="user-summary">
          <div className="user-avatar">{name.slice(0, 2).toUpperCase()}</div>

          <strong>{name}</strong>

          <Link to="/perfil">Ver perfil</Link>
        </div>

        <nav>
          <Link to="/perfil">
            <UserRound size={20} />
            Meu perfil
          </Link>

          <Link className="active" to="/meus-servicos">
            <BarChart3 size={20} />
            Meus serviços
          </Link>

          <Link to="/cadastrar-servico">
            <Plus size={20} />
            Criar serviço
          </Link>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Sair da conta
          </button>
        </nav>
      </aside>

      <section className="user-dashboard-main">
        <Button
          className="dashboard-mobile-back"
          variant="ghost"
          size="small"
          onClick={() => navigate("/")}
          icon={<ArrowLeft size={18} />}
        >
          Voltar
        </Button>

        <header className="dashboard-header">
          <div>
            <h1>Meus serviços</h1>

            <p>Gerencie os serviços que você cadastrou.</p>
          </div>

          <Link className="new-service-button" to="/cadastrar-servico">
            <Plus size={18} />
            Novo serviço
          </Link>
        </header>

        <div className="services-summary">
          <div className="summary-card">
            <strong>{totalServices}</strong>

            <span>Total</span>
          </div>

          <div className="summary-card">
            <strong>{activeServices}</strong>

            <span>Ativos</span>
          </div>

          <div className="summary-card">
            <strong>{inactiveServices}</strong>

            <span>Inativos</span>
          </div>
        </div>

        <div className="service-tabs">
          <button
            type="button"
            className={activeTab === "todos" ? "active" : ""}
            onClick={() => setActiveTab("todos")}
          >
            Todos
            <span>{totalServices}</span>
          </button>

          <button
            type="button"
            className={activeTab === "ativos" ? "active" : ""}
            onClick={() => setActiveTab("ativos")}
          >
            Ativos
            <span>{activeServices}</span>
          </button>

          <button
            type="button"
            className={activeTab === "inativos" ? "active" : ""}
            onClick={() => setActiveTab("inativos")}
          >
            Inativos
            <span>{inactiveServices}</span>
          </button>
        </div>

        <section className="management-list">
          {filteredServices.length === 0 ? (
            <div className="management-empty">
              <BarChart3 size={40} />

              <h2>
                {activeTab === "todos"
                  ? "Nenhum serviço cadastrado"
                  : activeTab === "ativos"
                    ? "Nenhum serviço ativo"
                    : "Nenhum serviço inativo"}
              </h2>

              <p>
                {activeTab === "todos"
                  ? "Você ainda não publicou nenhum serviço."
                  : "Não existem serviços nesta categoria."}
              </p>

              {activeTab === "todos" && (
                <Link to="/cadastrar-servico">
                  <Plus size={17} />
                  Criar meu primeiro serviço
                </Link>
              )}
            </div>
          ) : (
            filteredServices.map((service) => (
              <article className="management-card" key={service.id}>
                <div className="management-image">
                  {service.providerImage ? (
                    <img src={service.providerImage} alt={service.name} />
                  ) : (
                    <UserRound size={30} />
                  )}
                </div>

                <div className="management-info">
                  <h2>{service.name}</h2>

                  <p>
                    Publicado em{" "}
                    {service.publicationDate
                      ? new Date(service.publicationDate).toLocaleDateString(
                          "pt-BR",
                        )
                      : "Não informado"}
                  </p>
                </div>

                <span className={getStatusClass(service.status)}>
                  {getStatusLabel(service.status)}
                </span>

                <div className="management-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/detalhes-servico/${service.id}`)}
                  >
                    <Eye size={17} />
                    Ver
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/editar-servico/${service.id}`)}
                  >
                    <Edit3 size={17} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(service.id)}
                  >
                    <Power size={17} />
                    {service.status === SERVICE_STATUS[0].value
                      ? "Desativar"
                      : "Ativar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 size={17} />
                    Excluir
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
