import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useResumeAnalyzer = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetchApi("/ai/resume/analyze", { method: "POST" });
      return response;
    }
  });
};
