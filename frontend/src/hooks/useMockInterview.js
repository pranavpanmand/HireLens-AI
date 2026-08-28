import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useStartMockInterview = () => {
  return useMutation({
    mutationFn: async (jobId) => {
      const response = await fetchApi("/ai/mock-interview/start", {
        method: "POST",
        body: JSON.stringify({ jobId })
      });
      return response.data;
    }
  });
};

export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: async ({ sessionId, questionIndex, answer }) => {
      const response = await fetchApi(`/ai/mock-interview/${sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ questionIndex, answer })
      });
      return response.data;
    }
  });
};

export const useMockHistory = () => {
  return useQuery({
    queryKey: ["mock-interview-history"],
    queryFn: async () => {
      const response = await fetchApi("/ai/mock-interview/history");
      return response.data;
    }
  });
};
