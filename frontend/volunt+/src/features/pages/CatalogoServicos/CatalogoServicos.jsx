import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Header } from "../../../components";
import Button from "../../../components/Button/Button";
import { BasicPagination } from "../../../components/Pagination/BasicPagination";
import { ServiceCard } from "../../../components/ServiceCard/ServiceCard";
import Footer from "../../../layouts/Footer/Footer";
import { filterServices } from "../../../utils/filterServices";
import { useServices } from "../../../hook/useServices";

import {
  getCategoryOptions,
  getModalityOptions,
  getDayWeekOptions,
  getShiftOptions,
  getScoreOptions,
  getLocationOptions,
  getAge,
  getGenderOptions,
  getStateOptions,
  getLocationTypeOptions,
} from "../../../utils/optionsUtils";
import MultiSelect from "../../../components/MultiSelect/MultiSelect";
import { initialFilters } from "./constants/initialFilters";

import "./CatalogoServicos.css";

const ITEMS_PER_PAGE = 9;
export default function CatalogoServicos() {
  const navigate = useNavigate();

  const { services = [], loading, error } = useServices();

  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState(initialFilters);

  const [sortOrder, setSortOrder] = useState("alphabetical");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const filteredServices = useMemo(() => {
    const filtersToApply = {
      ...filters,
      search: searchTerm,
    };

    const result = filterServices(services, filtersToApply);

    return [...result].sort((a, b) => {
      if (sortOrder === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOrder === "reverseAlphabetical") {
        return (b.name || "").localeCompare(a.name || "");
      }

      if (sortOrder === "rating") {
        return Number(b.avaliacaoMedia || 0) - Number(a.avaliacaoMedia || 0);
      }
      return 0;
    });
  }, [services, filters, searchTerm, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, sortOrder]);

  const start = (page - 1) * ITEMS_PER_PAGE;

  const visibleServices = filteredServices.slice(start, start + ITEMS_PER_PAGE);

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm("");
    setSortOrder("alphabetical");
    setPage(1);
  };

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  if (loading) {
    return (
      <main className="catalog-page">
        <Header />

        <section className="catalog-container">
          <p>Carregando serviços...</p>
        </section>

        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="catalog-page">
        <Header />

        <section className="catalog-container">
          <p>Não foi possível carregar os serviços.</p>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="catalog-page">
      <Header />

      <section className="catalog-container">
        <Button
          className="catalog-back-button"
          variant="ghost"
          size="small"
          onClick={() => navigate("/")}
          icon={<ArrowLeft size={18} />}
        >
          Voltar
        </Button>

        <header className="catalog-heading">
          <div>
            <h1>Explorar serviços</h1>

            <p>Encontre iniciativas voluntárias perto de você.</p>
          </div>
        </header>

        <form
          className="catalog-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={21} aria-hidden="true" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por serviço, categoria ou localização..."
            aria-label="Buscar serviços"
          />

          <button type="submit" aria-label="Pesquisar">
            <Search size={20} />
          </button>
        </form>

        <button
          className="mobile-filter-button"
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={19} />
          Filtros
        </button>

        <div className="catalog-layout">
          <aside
            className={`catalog-filters ${
              mobileFiltersOpen ? "catalog-filters--open" : ""
            }`}
            aria-label="Filtros do catálogo"
          >
            {/* HEADER MOBILE */}

            <div className="filters-mobile-header">
              <h2>Filtros</h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Fechar filtros"
              >
                <X size={22} />
              </button>
            </div>

            <div className="filters-header">
              <h2>Filtros</h2>

              <button type="button" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>

            <MultiSelect
              label="Categoria"
              name="category"
              width="100%"
              value={filters.category}
              onChange={handleFilterChange}
              options={getCategoryOptions(services)}
            />

            <MultiSelect
              label="Modalidade"
              name="modality"
              width="100%"
              value={filters.modality}
              onChange={handleFilterChange}
              options={getModalityOptions(services)}
            />

            <MultiSelect
              label="Localização"
              name="locations"
              width="100%"
              value={filters.locations}
              onChange={handleFilterChange}
              options={getLocationOptions(services)}
            />

            <MultiSelect
              label="Estado"
              name="state"
              width="100%"
              value={filters.state}
              onChange={handleFilterChange}
              options={getStateOptions(services)}
            />

            <MultiSelect
              label="Tipo de localização"
              name="typeLocalization"
              width="100%"
              value={filters.typeLocalization}
              onChange={handleFilterChange}
              options={getLocationTypeOptions(services)}
            />
            <MultiSelect
              label="Gênero"
              name="genero"
              width="100%"
              value={filters.genero}
              onChange={handleFilterChange}
              options={getGenderOptions(services)}
            />
            <MultiSelect
              label="Dia da semana"
              name="diaDaSemana"
              width="100%"
              value={filters.diaDaSemana}
              onChange={handleFilterChange}
              options={getDayWeekOptions(services)}
            />

            <MultiSelect
              label="Turno"
              name="turno"
              width="100%"
              value={filters.turno}
              onChange={handleFilterChange}
              options={getShiftOptions(services)}
            />

            <MultiSelect
              label="Avaliação"
              name="avaliacao"
              width="100%"
              value={filters.avaliacao}
              onChange={handleFilterChange}
              options={getScoreOptions()}
            />

            <MultiSelect
              label="Idade do Ofertante"
              name="dataNascimento"
              width="100%"
              value={filters.dataNascimento}
              onChange={handleFilterChange}
              options={getAge(services)}
            />

            <button
              className="apply-filters-button"
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Ver {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "serviço" : "serviços"}
            </button>
          </aside>

          {mobileFiltersOpen && (
            <button
              className="filters-overlay"
              type="button"
              aria-label="Fechar filtros"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          <section className="services-results" aria-live="polite">
            <div className="results-header">
              <p>
                <strong>{filteredServices.length}</strong>{" "}
                {filteredServices.length === 1
                  ? "serviço encontrado"
                  : "serviços encontrados"}
              </p>

              <label className="sort-select">
                <span>Ordenar:</span>

                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  <option value="alphabetical">A–Z</option>

                  <option value="reverseAlphabetical">Z–A</option>

                  <option value="rating">Melhor avaliação</option>
                </select>

                <ChevronDown size={16} />
              </label>
            </div>

            {visibleServices.length ? (
              <>
                <div className="services-grid">
                  {visibleServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>

                <div className="catalog-pagination-wrapper">
                  <BasicPagination
                    page={page}
                    onPageChange={setPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredServices.length}
                  />
                </div>
              </>
            ) : (
              <div className="empty-results">
                <Search size={36} />

                <h2>Nenhum serviço encontrado</h2>

                <p>Tente alterar os filtros ou usar outra busca.</p>

                <button type="button" onClick={clearFilters}>
                  Limpar busca e filtros
                </button>
              </div>
            )}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
