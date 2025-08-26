import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
  _count?: {
    members: number;
    messages: number;
  };
}

export function useSupabaseRealtimeRooms() {
  const { supabaseClient } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  // Fetch rooms via API endpoint
  const fetchRooms = useCallback(async () => {
    if (!supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build headers - add Supabase auth if available
      const headers: HeadersInit = {};
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Fetch rooms from API endpoint
      const response = await fetch('/api/chat/rooms', { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setRooms(data.rooms || []);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
        setIsLoading(false);
      }
    }
  }, [supabaseClient]);

  // Create a room via API
  const createRoom = useCallback(async (name: string, isPrivate = false) => {
    if (!supabaseClient) throw new Error('Not authenticated');

    try {
      // Build headers - add Supabase auth if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Create room via API
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: name.trim(), isPrivate })
      });

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.statusText}`);
      }

      const data = await response.json();

      // Refetch rooms to update the list
      await fetchRooms();

      return data.room;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  }, [supabaseClient, fetchRooms]);

  // Join a room (simplified - rooms are auto-joined when selected)
  const joinRoom = useCallback(async (roomId: string) => {
    // This is now handled automatically by the backend when selecting a room
    // Keeping the function for backwards compatibility
    return;
  }, []);

  // Setup realtime subscription for room changes
  useEffect(() => {
    if (!supabaseClient) return;

    mountedRef.current = true;

    // Initial fetch
    fetchRooms();

    // Subscribe to room changes
    const channel = supabaseClient
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ChatRoom',
        },
        (payload: any) => {
          console.log('Room change:', payload);
          
          if (!mountedRef.current) return;

          if (payload.eventType === 'INSERT') {
            // Refetch to get full room details
            fetchRooms();
          } else if (payload.eventType === 'UPDATE') {
            setRooms(prev =>
              prev.map(room =>
                room.id === payload.new.id
                  ? { ...room, ...payload.new }
                  : room
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRooms(prev => prev.filter(room => room.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ChatRoomMember',
        },
        () => {
          // Refetch when membership changes
          console.log('Membership changed, refetching rooms');
          fetchRooms();
        }
      )
      .subscribe((status: string) => {
        console.log('Rooms subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      mountedRef.current = false;
      
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabaseClient, fetchRooms]);

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    joinRoom,
    refetch: fetchRooms,
  };
}