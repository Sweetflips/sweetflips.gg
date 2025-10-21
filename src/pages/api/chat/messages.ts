import { getUserFromRequest } from '@/lib/getUserFromRequest';
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req, res);

  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;

      if (!roomId || typeof roomId !== 'string') {
        return res.status(400).json({ error: 'Room ID is required' });
      }

      // Check if room exists and determine access
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: user ? {
          members: {
            where: { userId: user.id }
          }
        } : undefined
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // If room is private, check if user is authenticated and is a member
      if (room.isPrivate) {
        if (!user) {
          return res.status(401).json({ error: 'Authentication required for private rooms' });
        }
        // Check if user is a member of the private room
        const isMember = await prisma.chatRoomMember.findFirst({
          where: {
            chatRoomId: roomId,
            userId: user.id
          }
        });
        if (!isMember) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Fetch messages with user details
      const messages = await prisma.chatMessage.findMany({
        where: {
          chatRoomId: roomId,
          userId: { not: undefined } // Filter out messages with undefined userId
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: {
                select: {
                  base64Image: true,
                  avatarId: true,
                  gender: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 100
      });

      // Format messages to match expected structure
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        chatRoomId: msg.chatRoomId,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        user: msg.user ? {
          id: msg.user.id,
          username: msg.user.username,
          avatar: msg.user.avatar || null
        } : null
      }));

      return res.status(200).json({ messages: formattedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // POST requests require authentication
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to send messages' });
    }

    try {
      const { roomId, content } = req.body;

      if (!roomId || typeof roomId !== 'string') {
        return res.status(400).json({ error: 'Room ID is required' });
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Check if user has access to this room
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          members: {
            where: { userId: user.id }
          }
        }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // If room is private, check if user is a member
      if (room.isPrivate && room.members.length === 0) {
        // Auto-join public rooms or deny access to private rooms
        if (!room.isPrivate) {
          await prisma.chatRoomMember.create({
            data: {
              userId: user.id,
              chatRoomId: roomId
            }
          });
        } else {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Create the message
      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          userId: user.id,
          chatRoomId: roomId
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: {
                select: {
                  base64Image: true,
                  avatarId: true,
                  gender: true
                }
              }
            }
          }
        }
      });

      // Format message to match expected structure
      const formattedMessage = {
        id: message.id,
        content: message.content,
        userId: message.userId,
        chatRoomId: message.chatRoomId,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        user: message.user ? {
          id: message.user.id,
          username: message.user.username,
          avatar: message.user.avatar || null
        } : null
      };

      return res.status(201).json({ message: formattedMessage });
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
