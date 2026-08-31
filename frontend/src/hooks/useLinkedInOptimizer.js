import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../services/api';

export function useLinkedInOptimizer() {
  return useMutation({
    mutationFn: async (data) => {
      return fetchApi('/ai/linkedin-optimize', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
}
