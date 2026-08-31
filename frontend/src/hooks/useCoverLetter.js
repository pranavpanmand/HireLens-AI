import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useCoverLetter = () => {
  return useMutation({
    mutationFn: async (jobId) => {
      const response = await fetchApi("/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify({ jobId })
      });
      return response;
    }
  });
};
