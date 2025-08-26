import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  content: string;
  userId: number;
  chatRoomId: string;
  createdAt: string;
  editedAt?: string | null;
  user?: {
    id: number;
    username: string;
    avatar?: {
      base64Image?: string | null;
      avatarId?: string;
      gender?: string;
    } | null;
  };
}

interface UseSupabaseRealtimeChatProps {
  roomId: string;
}

export function useSupabaseRealtimeChat({ roomId }: UseSupabaseRealtimeChatProps) {
  const { supabaseClient } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  // Fetch initial messages directly from Supabase
  const fetchMessages = useCallback(async () => {
    if (!supabaseClient || !roomId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Direct Supabase query - no API endpoint needed
      const { data: messages, error } = await supabaseClient
        .from('ChatMessage')
        .select(`
          id,
          content,
          userId,
          chatRoomId,
          createdAt,
          editedAt,
          user:User!userId (
            id,
            username,
            avatar:Avatar (
              base64Image,
              avatarId,
              gender
            )
          )
        `)
        .eq('chatRoomId', roomId)
        .order('createdAt', { ascending: true })
        .limit(100);

      if (error) throw error;

      if (mountedRef.current) {
        // Transform the data to match our interface
        const formattedMessages = messages?.map((msg: any) => ({
          ...msg,
          user: msg.user ? {
            id: msg.user.id,
            username: msg.user.username,
            avatar: msg.user.avatar?.[0] || null
          } : undefined
        })) || [];

        setMessages(formattedMessages);
        setIsLoading(false);
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        setIsLoading(false);
        setConnectionStatus('error');
      }
    }
  }, [supabaseClient, roomId]);

  // Send a message directly through Supabase
  const sendMessage = useCallback(async (content: string, userId: number) => {
    if (!supabaseClient || !roomId || !content.trim()) return;

    try {
      // Insert directly into Supabase
      const { data, error } = await supabaseClient
        .from('ChatMessage')
        .insert({
          content: content.trim(),
          userId,
          chatRoomId: roomId,
        })
        .select()
        .single();

      if (error) throw error;

      // The realtime subscription will handle adding it to the UI
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [supabaseClient, roomId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!supabaseClient || !roomId) {
      setConnectionStatus('disconnected');
      return;
    }

    mountedRef.current = true;
    setConnectionStatus('connecting');

    // Initial fetch
    fetchMessages();

    // Create realtime channel for this specific room
    const channel = supabaseClient
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
          filter: `chatRoomId=eq.${roomId}`,
        },
        async (payload: any) => {
          console.log('New message via realtime:', payload.new);
          
          if (!mountedRef.current) return;

          const newMessage = payload.new as any;

          // Fetch user details for the new message
          const { data: userData } = await supabaseClient
            .from('User')
            .select(`
              id,
              username,
              avatar:Avatar (
                base64Image,
                avatarId,
                gender
              )
            `)
            .eq('id', newMessage.userId)
            .single();

          // Add the new message with user data
          const messageWithUser: Message = {
            ...newMessage,
            user: userData ? {
              id: userData.id,
              username: userData.username,
              avatar: userData.avatar?.[0] || null
            } : {
              id: newMessage.userId,
              username: `User ${newMessage.userId}`,
              avatar: null
            }
          };

          setMessages(prev => {
            // Check for duplicates
            if (prev.some(m => m.id === messageWithUser.id)) {
              return prev;
            }
            return [...prev, messageWithUser];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ChatMessage',
          filter: `chatRoomId=eq.${roomId}`,
        },
        (payload: any) => {
          console.log('Message updated:', payload.new);
          
          if (!mountedRef.current) return;

          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id
                ? { ...msg, ...payload.new }
                : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ChatMessage',
          filter: `chatRoomId=eq.${roomId}`,
        },
        (payload: any) => {
          console.log('Message deleted:', payload.old);
          
          if (!mountedRef.current) return;

          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe((status: string) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
          setError(new Error('Realtime connection error'));
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log('Cleaning up realtime subscription');
      mountedRef.current = false;
      
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabaseClient, roomId, fetchMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    connectionStatus,
    refetch: fetchMessages,
  };
}