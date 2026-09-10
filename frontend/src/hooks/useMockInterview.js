import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";

export const mockInterviewKeys = {
  history: (page, status) => ["mock-interview-history", page ?? 1, status ?? "all"],
  report: (sessionId) => ["mock-interview-report", sessionId],
};

/**
 * Start a new mock interview.
 * Accepts either a job object (from the Job Board) or an explicit setup payload.
 */
export const useStartMockInterview = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const body =
        typeof payload === "string"
          ? { jobId: payload }
          : {
              jobId: payload?.id || payload?.jobId,
              jobTitle: payload?.title || payload?.jobTitle,
              company: payload?.company,
              jobDescription: payload?.description || payload?.jobDescription,
              interviewType: payload?.interviewType,
              difficulty: payload?.difficulty,
              // Previously dropped on the floor here, so the backend always
              // generated 5 general questions no matter what the user picked.
              numberOfQuestions: payload?.numberOfQuestions,
              source: payload?.source,
            };

      return fetchApi("/ai/mock-interview/start", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  });
};

export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: async ({ sessionId, questionIndex, answer, timeTaken }) =>
      fetchApi(`/ai/mock-interview/${sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ questionIndex, answer, timeTaken }),
      }),
  });
};

/** Close out an interview and generate the final report. */
export const useFinishInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId) =>
      fetchApi(`/ai/mock-interview/${sessionId}/finish`, { method: "POST" }),
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(mockInterviewKeys.report(sessionId), data);
      queryClient.invalidateQueries({ queryKey: ["mock-interview-history"] });
    },
  });
};

/** Full transcript + report for one session. */
export const useInterviewReport = (sessionId, options = {}) => {
  return useQuery({
    queryKey: mockInterviewKeys.report(sessionId),
    queryFn: async () => fetchApi(`/ai/mock-interview/${sessionId}`),
    enabled: Boolean(sessionId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/** Paginated interview history. Returns { sessions, meta }. */
export const useMockHistory = ({ page = 1, limit = 20, status } = {}) => {
  return useQuery({
    queryKey: mockInterviewKeys.history(page, status),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set("status", status);
      return fetchApi(`/ai/mock-interview/history?${params.toString()}`);
    },
    placeholderData: (previous) => previous,
  });
};

export const useSaveInterviewFeedback = () => {
  return useMutation({
    mutationFn: async (payload) =>
      fetchApi("/ai/mock-interview/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
};

/**
 * Overall score is stored out of 100. Sessions created before that change stored
 * it out of 10, so normalise on read rather than migrating the collection.
 */
export const normalizeOverallScore = (score) => {
  if (score === null || score === undefined) return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  return n <= 10 ? Math.round(n * 10) : Math.round(n);
};
