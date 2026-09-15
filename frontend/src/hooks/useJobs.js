import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { jobsApi } from "@/services/jobsApi";
import { savedJobsApi } from "@/services/savedJobsApi";

const mapJob = (job) => ({
  ...job,
  id: job._id
});

/**
 * Main hook for fetching jobs with full advanced filters.
 * Accepts a filters object instead of positional args for clarity.
 */
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const response = await jobsApi.search(filters);
      return {
        jobs: response.jobs.map(mapJob),
        pagination: response.pagination
      };
    },
    keepPreviousData: true, // smooth pagination transitions
  });
};

export const useRecruiterJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recruiter-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const jobs = await jobsApi.getMyPostings();
      return jobs.map(mapJob);
    },
    enabled: !!user
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (job) => {
      if (!user) throw new Error("Not authenticated");
      const created = await jobsApi.createPosting(job);
      return mapJob(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-stats"] });
      toast.success("Job posted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to post job: " + error.message);
    }
  });
};

export const useRecruiterStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recruiter-stats", user?.id],
    queryFn: () => jobsApi.getRecruiterStats(),
    enabled: !!user,
    staleTime: 30_000,
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = await jobsApi.updatePosting(id, data);
      return mapJob(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-stats"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error("Update failed: " + error.message);
    }
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await jobsApi.deletePosting(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-stats"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error) => {
      toast.error("Delete failed: " + error.message);
    }
  });
};
