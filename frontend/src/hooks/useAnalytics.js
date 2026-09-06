import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/services/api';

export const useSkillGapAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'skill-gap'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/analytics/skill-gap`, {
        credentials: 'include',
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
