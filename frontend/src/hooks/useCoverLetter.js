import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useCoverLetter = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const body = typeof payload === "string" ? { jobId: payload } : payload;
      const response = await fetchApi("/ai/cover-letter", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return response;
    }
  });
};
