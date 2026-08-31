import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export const useRecommendations = (limit = 10) => {
  const { user, hasRole } = useAuth();
  
  return useQuery({
    queryKey: ["recommendations", user?.id, limit],
    queryFn: async () => {
      return await fetchApi(`/recommendations?limit=${limit}`);
    },
    enabled: !!user && hasRole("student")
  });
};
