import { SupabaseClient } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  content: string;
  userId: number;
  chatRoomId: string;
  createdAt: string;
  editedAt?: string | null;
  user: {
    id: number;
    username: string;
    avatar?: {
      base64Image?: string | null;
      avatarId?: string;
      gender?: string;
    } | null;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

export class ChatService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch all available chat rooms
   */
  async getRooms(): Promise<ChatRoom[]> {
    try {
      const response = await fetch('/api/chat/rooms', {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch rooms');
      
      const data = await response.json();
      return data.rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  /**
   * Create a new chat room
   */
  async createRoom(name: string, isPrivate = false): Promise<ChatRoom> {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({ name, isPrivate }),
      });
      
      if (!response.ok) throw new Error('Failed to create room');
      
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Fetch messages for a specific room
   */
  async getMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages?limit=${limit}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message to a room
   */
  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Join a chat room
   */
  async joinRoom(roomId: string, userId: number): Promise<void> {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok && response.status !== 409) { // 409 means already joined
        throw new Error('Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Get auth headers from Supabase session
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    
    return {};
  }
}