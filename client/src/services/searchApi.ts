import api from './api';

export interface SearchResult {
  id: string;
  type: 'User' | 'Team' | 'Task' | 'Report';
  title: string;
  subtitle?: string;
  url: string;
}

export const searchApi = {
  globalSearch: async (query: string): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) return [];
    
    const response = await api.get('/search', { params: { q: query } });
    return response.data.data.results;
  }
};
