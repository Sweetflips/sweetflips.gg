import { useAuth } from "@/contexts/AuthContext";

export const useAuthHeaders = () => {
  const { supabaseClient } = useAuth();

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = {};

    if (supabaseClient) {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error('Error getting auth session:', error);
      }
    }

    return headers;
  };

  const getAuthHeadersWithContentType = async (): Promise<HeadersInit> => {
    const headers = await getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    return headers;
  };

  return { getAuthHeaders, getAuthHeadersWithContentType };
};