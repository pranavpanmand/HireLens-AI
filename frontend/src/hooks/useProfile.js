import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/services/profileApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useProfile = () => {
  const { user, hasRole } = useAuth();
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response || null;
    },
    enabled: !!user && hasRole("student")
  });
};

export const useUpdateBasicInfo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => profileApi.updateBasicInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      // Also invalidate user to get updated fullName if it was changed
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update profile")
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => profileApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Preferences updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update preferences")
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (education) => profileApi.updateEducation(education),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Education updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update education")
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (experience) => profileApi.updateExperience(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Experience updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update experience")
  });
};

export const useUpdateProjects = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (projects) => profileApi.updateProjects(projects),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Projects updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update projects")
  });
};

export const useUpdateSkills = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (skills) => profileApi.updateSkills(skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Skills updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update skills")
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (file) => profileApi.uploadPhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile photo updated");
    },
    onError: (error) => toast.error(error.message || "Failed to upload photo")
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => profileApi.deletePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile photo removed");
    },
    onError: (error) => toast.error(error.message || "Failed to remove photo")
  });
};
