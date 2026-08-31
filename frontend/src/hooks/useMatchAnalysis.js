import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { matchApi } from "@/services/matchApi";


// Maintain backwards compatibility















const mapMatch = (match) => ({
  ...match,
  id: match._id,
  user_id: match.userId,
  resume_id: match.resumeId,
  job_id: match.jobId,
  match_score: match.matchScore,
  matched_skills: match.matchedSkills,
  missing_skills: match.missingSkills,
  learning_path: match.learningPath,
  created_at: match.createdAt
});

export const useMatchAnalyses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match-analyses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const matches = await matchApi.getMyMatches();
      return matches.map((m) => ({
        ...mapMatch(m),
        // Emulate Supabase join structure for UI
        job_postings: m.jobId
      }));
    },
    enabled: !!user
  });
};

export const useGetMatchAnalysis = (resumeId, jobId) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match-analysis", resumeId, jobId],
    queryFn: async () => {
      if (!user) return null;
      // In the new API, we fetch match by jobId for the current user's primary resume.
      // We ignore resumeId from the frontend call since the backend handles finding the primary resume.
      const match = await matchApi.getMatchForJob(jobId);
      return match ? mapMatch(match) : null;
    },
    enabled: !!user && !!jobId
  });
};

export const useAnalyzeMatch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params) => {
      if (!user) throw new Error("Not authenticated");
      const jobId = typeof params === "string" ? params : params?.jobId;
      if (!jobId) throw new Error("Job ID is required");
      const match = await matchApi.generateMatch(jobId);
      return mapMatch(match);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-analyses"] });
      // Invalidate specific match query so useGetMatchAnalysis refetches
      queryClient.invalidateQueries({ queryKey: ["match-analysis"] });
      toast.success("Analysis complete!");
    },
    onError: (error) => {
      toast.error("Analysis failed: " + error.message);
    }
  });
};