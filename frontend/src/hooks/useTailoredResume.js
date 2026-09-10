import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useTailoredResume = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await fetchApi("/ai/resume/generate-tailored", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return response;
    }
  });
};
