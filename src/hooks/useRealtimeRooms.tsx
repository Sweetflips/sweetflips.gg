import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService, ChatRoom } from '@/services/chat.service';

interface UseRealtimeRoomsReturn {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: Error | null;
  createRoom: (name: string, isPrivate?: boolean) => Promise<ChatRoom>;
  refetch: () => void;
}

export function useRealtimeRooms(): UseRealtimeRoomsReturn {
  const { supabaseClient, user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const mountedRef = useRef(true);

  // Initialize chat service
  useEffect(() => {
    if (supabaseClient) {
      chatServiceRef.current = new ChatService(supabaseClient);
    }
  }, [supabaseClient]);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    if (!chatServiceRef.current || !user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedRooms = await chatServiceRef.current.getRooms(user.id);
      
      if (mountedRef.current) {
        setRooms(fetchedRooms);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Failed to fetch rooms');
        setError(error);
        setIsLoading(false);
      }
    }
  }, [user]);

  // Create a room
  const createRoom = useCallback(async (name: string, isPrivate = false): Promise<ChatRoom> => {
    if (!chatServiceRef.current) {
      throw new Error('Chat service not initialized');
    }
    
    try {
      const newRoom = await chatServiceRef.current.createRoom(name, isPrivate);
      
      // Add to local state immediately
      if (mountedRef.current) {
        setRooms(prev => [...prev, newRoom]);
      }
      
      return newRoom;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create room');
      setError(error);
      throw error;
    }
  }, []);

  // Setup realtime subscription for room changes
  useEffect(() => {
    if (!supabaseClient || !user) {
      return;
    }

    mountedRef.current = true;
    
    // Initial fetch
    fetchRooms();

    // Subscribe to room changes
    const channel = supabaseClient
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'ChatRoom',
        },
        (payload: any) => {
          console.log('Room change detected:', payload);
          
          if (!mountedRef.current) return;
          
          switch (payload.eventType) {
            case 'INSERT':
              // Fetch the new room to get full details
              fetchRooms();
              break;
            case 'UPDATE':
              setRooms(prev =>
                prev.map(room =>
                  room.id === payload.new.id
                    ? { ...room, ...payload.new }
                    : room
                )
              );
              break;
            case 'DELETE':
              setRooms(prev => prev.filter(room => room.id !== payload.old.id));
              break;
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
          // Refetch rooms when membership changes
          console.log('Room membership changed, refetching rooms');
          fetchRooms();
        }
      )
      .subscribe((status) => {
        console.log('Rooms realtime subscription status:', status);
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
  }, [supabaseClient, user, fetchRooms]);

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    refetch: fetchRooms,
  };
}