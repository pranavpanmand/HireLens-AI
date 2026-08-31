import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../services/api';

export function useNetworkingGenerator() {
  return useMutation({
    mutationFn: async (data) => {
      return fetchApi('/ai/networking-message', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
}
