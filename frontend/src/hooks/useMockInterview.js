import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const useStartMockInterview = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const body = typeof payload === "string" 
        ? { jobId: payload } 
        : {
            jobId: payload?.id || payload?.jobId,
            jobTitle: payload?.title || payload?.jobTitle,
            company: payload?.company,
            jobDescription: payload?.description || payload?.jobDescription
          };

      const response = await fetchApi("/ai/mock-interview/start", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return response;
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
      return response;
    }
  });
};

export const useMockHistory = () => {
  return useQuery({
    queryKey: ["mock-interview-history"],
    queryFn: async () => {
      const response = await fetchApi("/ai/mock-interview/history");
      return response;
    }
  });
};
