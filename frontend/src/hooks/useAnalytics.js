import { useQuery } from '@tanstack/react-query';

export const useSkillGapAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'skill-gap'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/skill-gap', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch skill gap analytics');
      }
      return response.json();
    }
  });
};
