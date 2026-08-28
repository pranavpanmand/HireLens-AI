import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedJobs = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["saved-jobs", user?.id],
    queryFn: async () => {
      const response = await fetchApi("/saved-jobs");
      return response.data;
    },
    enabled: !!user,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId) => {
      return fetchApi("/saved-jobs", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
    },
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["saved-jobs", user?.id] });
      const previousSavedJobs = queryClient.getQueryData(["saved-jobs", user?.id]);
      
      // Optimistically update
      if (previousSavedJobs) {
        queryClient.setQueryData(["saved-jobs", user?.id], (old) => {
          // Find the job from somewhere? Actually the backend just returns full job objects.
          // For optimistic updates, we might just append a mock object or wait for invalidate.
          // In this case, since we don't have the full job object here, we can just invalidate later.
          // But wait, the hook could be used by JobCard just to check if it's saved.
          return old;
        });
      }
      return { previousSavedJobs };
    },
    onSuccess: () => {
      toast.success("Job saved!");
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
    },
    onError: (err, newTodo, context) => {
      if (context?.previousSavedJobs) {
        queryClient.setQueryData(["saved-jobs", user?.id], context.previousSavedJobs);
      }
      toast.error(err.message || "Failed to save job");
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId) => {
      return fetchApi(`/saved-jobs/${jobId}`, {
        method: "DELETE",
      });
    },
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: ["saved-jobs", user?.id] });
      const previousSavedJobs = queryClient.getQueryData(["saved-jobs", user?.id]);
      
      if (previousSavedJobs) {
        queryClient.setQueryData(["saved-jobs", user?.id], (old) => {
          return old?.filter(job => job._id !== jobId) || [];
        });
      }
      return { previousSavedJobs };
    },
    onSuccess: () => {
      toast.success("Job removed from saved list");
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
    },
    onError: (err, newTodo, context) => {
      if (context?.previousSavedJobs) {
        queryClient.setQueryData(["saved-jobs", user?.id], context.previousSavedJobs);
      }
      toast.error(err.message || "Failed to unsave job");
    },
  });
};

export const useToggleSaveJob = () => {
  const { data: savedJobs } = useSavedJobs();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  return async (jobId) => {
    if (!savedJobs) return;
    
    const isSaved = savedJobs.some(job => job._id === jobId);
    if (isSaved) {
      await unsaveJob.mutateAsync(jobId);
    } else {
      await saveJob.mutateAsync(jobId);
    }
  };
};
