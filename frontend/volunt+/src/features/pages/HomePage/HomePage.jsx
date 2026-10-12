import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../../../layouts/Footer/Footer";
import Header from "../../../layouts/Header/Header";
import Hero from "../../../components/Hero/Hero";
import SearchPanel from "../../../components/SearchPanel/SearchPanel";
import ServicesSection from "../../../components/ServicesSection/ServicesSection";

import { filterServices } from "../../../utils/filterServices";
import { useServices } from "../../../hook/useServices";
import { initialFilters } from "../CatalogoServicos/constants/initialFilters";

import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  const { services = [], error } = useServices();
  const [filters, setFilters] = useState(initialFilters);

  const filteredServices = useMemo(() => {
    return filterServices(services, filters);
  }, [services, filters]);

  function handleFilterChange(field, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function handleApplyFilters(newFilters) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...newFilters,
    }));
  }

  return (
    <main className="app-shell">
      <Header
        onCreateUser={() => navigate("/cadastro")}
        onOpenLogin={() => navigate("/login")}
      />

      <Hero />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SearchPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          data={services}
        />
      </div>

      <section className="app-content-grid">
        {error ? <p role="alert">Não foi possível carregar os serviços. Tente novamente mais tarde.</p>
          : <ServicesSection services={filteredServices} />}
      </section>

      <Footer />
    </main>
  );
}
