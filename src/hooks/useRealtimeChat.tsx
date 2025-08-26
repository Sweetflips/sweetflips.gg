import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService, ChatMessage, ChatRoom } from '@/services/chat.service';

interface UseRealtimeChatOptions {
  roomId: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

interface UseRealtimeChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  retry: () => void;
}

export function useRealtimeChat({
  roomId,
  onMessageReceived,
  onError,
}: UseRealtimeChatOptions): UseRealtimeChatReturn {
  const { supabaseClient, supabaseUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Initialize chat service
  useEffect(() => {
    if (supabaseClient) {
      chatServiceRef.current = new ChatService(supabaseClient);
    }
  }, [supabaseClient]);

  // Fetch initial messages
  const fetchInitialMessages = useCallback(async () => {
    if (!chatServiceRef.current || !roomId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedMessages = await chatServiceRef.current.getMessages(roomId);
      
      if (mountedRef.current) {
        setMessages(fetchedMessages);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Failed to fetch messages');
        setError(error);
        setIsLoading(false);
        onError?.(error);
      }
    }
  }, [roomId, onError]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!chatServiceRef.current || !roomId || !content.trim()) return;
    
    try {
      await chatServiceRef.current.sendMessage(roomId, content);
      // Message will be added via realtime subscription
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [roomId, onError]);

  // Setup realtime subscription
  useEffect(() => {
    if (!supabaseClient || !roomId) {
      setConnectionStatus('disconnected');
      return;
    }

    mountedRef.current = true;
    setConnectionStatus('connecting');
    
    // Fetch initial messages
    fetchInitialMessages();

    // Create realtime channel
    const channel = supabaseClient
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
          filter: `chatRoomId=eq.${roomId}`,
        },
        async (payload: { new: any; old?: any; eventType: string }) => {
          console.log('New message received via realtime:', payload);
          
          if (!mountedRef.current) return;
          
          // Fetch the complete message with user data
          try {
            const messageId = payload.new.id;
            
            // Fetch the message with user details via API
            const response = await fetch(`/api/chat/messages/${messageId}`, {
              headers: await chatServiceRef.current?.['getAuthHeaders']() || {},
            });
            
            if (response.ok) {
              const data = await response.json();
              const newMessage = data.message;
              
              if (mountedRef.current) {
                setMessages(prev => {
                  // Check if message already exists to prevent duplicates
                  if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });
                
                onMessageReceived?.(newMessage);
              }
            } else {
              // Fallback: Create message from payload
              const newMessage: ChatMessage = {
                id: payload.new.id,
                content: payload.new.content,
                userId: payload.new.userId,
                chatRoomId: payload.new.chatRoomId,
                createdAt: payload.new.createdAt,
                editedAt: payload.new.editedAt,
                user: {
                  id: payload.new.userId,
                  username: 'User ' + payload.new.userId, // This will be updated when full data loads
                },
              };
              
              if (mountedRef.current) {
                setMessages(prev => {
                  if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });
                
                onMessageReceived?.(newMessage);
              }
            }
          } catch (error) {
            console.error('Error processing realtime message:', error);
          }
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
        (payload: { new: any; old?: any }) => {
          console.log('Message updated via realtime:', payload);
          
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
        (payload: { new: any; old?: any }) => {
          console.log('Message deleted via realtime:', payload);
          
          if (!mountedRef.current) return;
          
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe((status: string) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
          setError(new Error('Realtime connection error'));
          
          // Auto-retry after 5 seconds
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              retry();
            }
          }, 5000);
        } else if (status === 'TIMED_OUT') {
          setConnectionStatus('error');
          setError(new Error('Realtime connection timed out'));
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      mountedRef.current = false;
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabaseClient, roomId, fetchInitialMessages, onMessageReceived]);

  // Retry connection
  const retry = useCallback(() => {
    if (channelRef.current && supabaseClient) {
      // Remove old channel
      supabaseClient.removeChannel(channelRef.current);
      channelRef.current = null;
      
      // Reset state
      setError(null);
      setConnectionStatus('connecting');
      
      // Refetch messages
      fetchInitialMessages();
    }
  }, [supabaseClient, fetchInitialMessages]);

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
    retry,
  };
}