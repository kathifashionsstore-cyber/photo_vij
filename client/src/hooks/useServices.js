import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SERVICES, sortServicesByOrder } from "../data/services";
import { watchServices } from "../utils/servicesStore";

export const useServices = ({ activeOnly = false } = {}) => {
  const [services, setServices] = useState(() => sortServicesByOrder(DEFAULT_SERVICES));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchServices(
      (nextServices) => {
        setServices(nextServices);
        setLoading(false);
      },
      (err) => {
        console.warn("Services listener failed:", err);
        setServices(sortServicesByOrder(DEFAULT_SERVICES));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const visibleServices = useMemo(
    () => (activeOnly ? services.filter((service) => service.active !== false) : services),
    [activeOnly, services],
  );

  return { services: visibleServices, loading };
};

export default useServices;
