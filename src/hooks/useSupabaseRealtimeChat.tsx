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
  const [currentUserInfo, setCurrentUserInfo] = useState<{ id: number; username: string; avatar: any } | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  // Fetch initial messages via API
  const fetchMessages = useCallback(async () => {
    if (!supabaseClient || !roomId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build headers - add Supabase auth if available
      const headers: HeadersInit = {};
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Fetch messages from API endpoint
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setMessages(data.messages || []);
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

  // Fetch and cache current user info
  const fetchCurrentUserInfo = useCallback(async (userId: number) => {
    if (currentUserInfo && currentUserInfo.id === userId) return; // Already cached
    
    try {
      const response = await fetch(`/api/chat/user-info?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentUserInfo({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar || null
        });
      }
    } catch (error) {
      console.log('Could not fetch current user info');
    }
  }, [currentUserInfo]);

  // Send a message via API with optimistic update
  const sendMessage = useCallback(async (content: string, userId: number) => {
    if (!supabaseClient || !roomId || !content.trim()) return;

    // Ensure we have current user info
    if (!currentUserInfo || currentUserInfo.id !== userId) {
      await fetchCurrentUserInfo(userId);
    }

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: content.trim(),
      userId,
      chatRoomId: roomId,
      createdAt: new Date().toISOString(),
      editedAt: null,
      user: currentUserInfo || undefined
    };

    // Add message optimistically
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Build headers - add Supabase auth if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Send message via API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          roomId,
          content: content.trim()
        })
      });

      if (!response.ok) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();

      // Replace optimistic message with real one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== optimisticMessage.id);
        // Check if message already exists (from realtime)
        if (!filtered.some(m => m.id === data.message.id)) {
          return [...filtered, data.message];
        }
        return filtered;
      });

      return data.message;
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      throw err;
    }
  }, [supabaseClient, roomId, currentUserInfo, fetchCurrentUserInfo]);

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

          // Fetch user details via API
          let userData = null;
          try {
            const response = await fetch(`/api/chat/user-info?userId=${newMessage.userId}`);
            if (response.ok) {
              const data = await response.json();
              userData = data.user;
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }

          // Add the new message with user data
          const messageWithUser: Message = {
            ...newMessage,
            user: userData ? {
              id: userData.id,
              username: userData.username,
              avatar: userData.avatar || null
            } : {
              id: newMessage.userId,
              username: `User ${newMessage.userId}`,
              avatar: null
            }
          };

          setMessages(prev => {
            // Remove any temporary messages with same content and user
            const filtered = prev.filter(m => {
              // Remove temp message if it matches this real message
              if (m.id.startsWith('temp-') && 
                  m.userId === messageWithUser.userId && 
                  m.content === messageWithUser.content) {
                return false;
              }
              // Keep all other messages
              return m.id !== messageWithUser.id;
            });
            
            // Add the new message
            return [...filtered, messageWithUser];
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