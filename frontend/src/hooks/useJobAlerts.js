import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

export const useJobAlerts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["job-alerts", user?.id],
    queryFn: async () => {
      const response = await fetchApi("/alerts/status");
      return response.data;
    },
    enabled: !!user,
  });
};

export const useToggleJobAlerts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (isEnabled) => {
      const response = await fetchApi("/alerts/toggle", {
        method: "POST",
        body: JSON.stringify({ isEnabled }),
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["job-alerts", user?.id], data);
      toast.success(data.isEnabled ? "Job alerts enabled!" : "Job alerts disabled.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update job alerts.");
    }
  });
};
