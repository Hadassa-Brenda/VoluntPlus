import { useEffect, useState } from "react";
import { getServices } from "service/serviceService";

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);

        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return {
    services,
    loading,
    error,
  };
}
