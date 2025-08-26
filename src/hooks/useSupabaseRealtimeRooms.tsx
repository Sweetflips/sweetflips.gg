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

  // Fetch rooms directly from Supabase
  const fetchRooms = useCallback(async () => {
    if (!supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user ID from our database
      const { data: dbUser } = await supabaseClient
        .from('User')
        .select('id')
        .eq('authId', user.id)
        .single();

      if (!dbUser) throw new Error('User not found in database');

      // Fetch all public rooms and rooms where user is a member
      const { data: publicRooms, error: publicError } = await supabaseClient
        .from('ChatRoom')
        .select(`
          id,
          name,
          isPrivate,
          createdAt,
          updatedAt,
          messages:ChatMessage(
            content,
            createdAt
          ),
          members:ChatRoomMember(
            userId
          )
        `)
        .eq('isPrivate', false)
        .order('createdAt', { ascending: false });

      if (publicError) throw publicError;

      // Fetch private rooms where user is a member
      const { data: memberRooms, error: memberError } = await supabaseClient
        .from('ChatRoomMember')
        .select(`
          chatRoom:ChatRoom(
            id,
            name,
            isPrivate,
            createdAt,
            updatedAt,
            messages:ChatMessage(
              content,
              createdAt
            ),
            members:ChatRoomMember(
              userId
            )
          )
        `)
        .eq('userId', dbUser.id);

      if (memberError) throw memberError;

      // Combine and deduplicate rooms
      const allRooms = new Map<string, Room>();

      // Add public rooms
      publicRooms?.forEach((room: any) => {
        const lastMessage = room.messages
          ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        allRooms.set(room.id, {
          id: room.id,
          name: room.name,
          isPrivate: room.isPrivate,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          memberCount: room.members?.length || 0,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null,
          _count: {
            members: room.members?.length || 0,
            messages: room.messages?.length || 0
          }
        });
      });

      // Add member rooms
      memberRooms?.forEach(({ chatRoom }: any) => {
        if (chatRoom && !allRooms.has(chatRoom.id)) {
          const lastMessage = chatRoom.messages
            ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          allRooms.set(chatRoom.id, {
            id: chatRoom.id,
            name: chatRoom.name,
            isPrivate: chatRoom.isPrivate,
            createdAt: chatRoom.createdAt,
            updatedAt: chatRoom.updatedAt,
            memberCount: chatRoom.members?.length || 0,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt
            } : null,
            _count: {
              members: chatRoom.members?.length || 0,
              messages: chatRoom.messages?.length || 0
            }
          });
        }
      });

      const roomsList = Array.from(allRooms.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (mountedRef.current) {
        setRooms(roomsList);
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

  // Create a room directly in Supabase
  const createRoom = useCallback(async (name: string, isPrivate = false) => {
    if (!supabaseClient) throw new Error('Not authenticated');

    try {
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user ID from our database
      const { data: dbUser } = await supabaseClient
        .from('User')
        .select('id')
        .eq('authId', user.id)
        .single();

      if (!dbUser) throw new Error('User not found in database');

      // Create the room
      const { data: room, error: roomError } = await supabaseClient
        .from('ChatRoom')
        .insert({
          name: name.trim(),
          isPrivate,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as member
      const { error: memberError } = await supabaseClient
        .from('ChatRoomMember')
        .insert({
          userId: dbUser.id,
          chatRoomId: room.id,
        });

      if (memberError) throw memberError;

      // Add to local state
      const newRoom: Room = {
        id: room.id,
        name: room.name,
        isPrivate: room.isPrivate,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        memberCount: 1,
        lastMessage: null,
        _count: {
          members: 1,
          messages: 0
        }
      };

      setRooms(prev => [newRoom, ...prev]);

      return newRoom;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  }, [supabaseClient]);

  // Join a room
  const joinRoom = useCallback(async (roomId: string) => {
    if (!supabaseClient) return;

    try {
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user ID from our database
      const { data: dbUser } = await supabaseClient
        .from('User')
        .select('id')
        .eq('authId', user.id)
        .single();

      if (!dbUser) throw new Error('User not found in database');

      // Check if already a member
      const { data: existing } = await supabaseClient
        .from('ChatRoomMember')
        .select('id')
        .eq('userId', dbUser.id)
        .eq('chatRoomId', roomId)
        .single();

      if (existing) return; // Already a member

      // Join the room
      const { error } = await supabaseClient
        .from('ChatRoomMember')
        .insert({
          userId: dbUser.id,
          chatRoomId: roomId,
        });

      if (error) throw error;

      // Update local state
      setRooms(prev =>
        prev.map(room =>
          room.id === roomId
            ? { ...room, memberCount: (room.memberCount || 0) + 1 }
            : room
        )
      );
    } catch (err) {
      console.error('Error joining room:', err);
      throw err;
    }
  }, [supabaseClient]);

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