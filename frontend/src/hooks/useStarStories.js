import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../services/api';

export function useStarStories() {
  return useMutation({
    mutationFn: async (data) => {
      return fetchApi('/ai/star-stories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
}
