import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resumeApi } from "@/services/resumeApi";


// Maintain backwards compatibility with UI expecting Supabase snake_case style











const mapResume = (resume) => ({
  ...resume,
  id: resume._id,
  file_name: resume.fileName,
  file_path: resume.filePath,
  parsed_text: resume.parsedText,
  skills_extracted: resume.skillsExtracted,
  is_primary: resume.isPrimary,
  created_at: resume.createdAt,
  updated_at: resume.updatedAt
});

export const useResumes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const resumes = await resumeApi.getMyResumes();
      return resumes.map(mapResume);
    },
    enabled: !!user
  });
};

export const usePrimaryResume = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["primary-resume", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const resumes = await resumeApi.getMyResumes();
      const primary = resumes.find((r) => r.isPrimary);
      return primary ? mapResume(primary) : null;
    },
    enabled: !!user
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file) => {
      if (!user) throw new Error("Not authenticated");
      const created = await resumeApi.upload(file);
      return mapResume(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["primary-resume"] });
      toast.success("Resume uploaded successfully!");
    },
    onError: (error) => {
      toast.error("Failed to upload resume: " + error.message);
    }
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (resume) => {
      if (!user) throw new Error("Not authenticated");
      await resumeApi.delete(resume.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["primary-resume"] });
      toast.success("Resume deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete resume: " + error.message);
    }
  });
};