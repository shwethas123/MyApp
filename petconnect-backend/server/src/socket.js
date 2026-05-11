import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { Message, Conversation, User } = db;

// Store io instance so other parts of the app can use it
// e.g. notification.controller.js can emit to a specific user
let io;

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware — verify JWT on every socket connection
  // This runs before any socket event, so socket.user is always available
  io.use(async (socket, next) => {
    try {
      // ✅ Try auth.token and query.token first (legacy),
      // then fall back to accessToken cookie (current cookie-based auth)
      const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token ||
        socket.handshake.headers.cookie
          ?.split(';')
          .find((c) => c.trim().startsWith('accessToken='))
          ?.split('=')[1]
          ?.trim();

      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const user = await User.findByPk(decoded.id, {
  attributes: ['id', 'first_name', 'last_name', 'email'],
  include: [{ model: db.Role, as: 'roleDetails', attributes: ['name'] }],
});
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id}`);

    // Each user joins their own personal room on connect
    // This is how we send notifications directly to a specific user
    // e.g. io.to('user_5').emit('notification', {...}) sends only to user 5
    socket.join(`user_${socket.user.id}`);

    // ── Join conversation room ─────────────────────────────────────────
    // Called when user opens a chat — joins that conversation's room
    // so they receive messages in real time
    socket.on('join_conversation', async (data) => { //Handles both socket.emit('join_conversation', 42) and socket.emit('join_conversation', { conversation_id: 42 }) —
    //  defensive coding.

      const conversationId = typeof data === 'object' ? data.conversation_id : parseInt(data);
      console.log(`JOIN REQUEST: user ${socket.user.id} wants to join conv ${conversationId}`);

      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        console.log('REJECTED: conversation not found');
        return;
      }

      const isAdopter = conversation.adopter_id === socket.user.id;
    const isShelterMember = socket.user.roleDetails?.name === 'shelter';

      if (!isAdopter && !isShelterMember) {
        console.log('REJECTED: not authorized');
        return;
      }

      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.id} joined conversation ${conversationId}`);

      // Mark messages as read when user joins the conversation
      await Message.update(
        { is_read: true },
        {
          where: {
            conversation_id: conversationId,
            is_read: false,
            sender_id: { [db.Sequelize.Op.ne]: socket.user.id },
          },
        }
      );

      // Reset unread count for this user
      const isAdopterUser = conversation.adopter_id === socket.user.id;
      await conversation.update(
        isAdopterUser ? { adopter_unread: 0 } : { shelter_unread: 0 }
      );
    });

    // ── Send message ───────────────────────────────────────────────────
    // Saves message to DB, updates conversation, emits to room
    socket.on('send_message', async (data) => {
      console.log('send_message received:', data);
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const { conversation_id, content, file_url, file_type } = parsed;

        const conversation = await Conversation.findByPk(conversation_id);
        if (!conversation) return;

        // Save message to DB
        const message = await Message.create({
          conversation_id,
          sender_id: socket.user.id,
          content,
          file_url: file_url || null,
          file_type: file_type || null,
          is_read: false,
        });

        // Update conversation last_message_at and unread count
        const isAdopter = conversation.adopter_id === socket.user.id;
        await conversation.update({
          last_message_at: new Date(),
          // If adopter sent → increment shelter unread, keep adopter unread same
          // If shelter sent → increment adopter unread, keep shelter unread same
          shelter_unread: isAdopter
            ? conversation.shelter_unread + 1
            : conversation.shelter_unread,
          adopter_unread: !isAdopter
            ? conversation.adopter_unread + 1
            : conversation.adopter_unread,
        });

        // Build message payload to send to room
        const senderInfo = {
          id: socket.user.id,
          name: `${socket.user.first_name} ${socket.user.last_name}`,
         role: socket.user.roleDetails?.name,
        };

        const payload = {
          id: message.id,
          conversation_id,
          sender_id: socket.user.id,
          content,
          file_url: file_url || null,
          file_type: file_type || null,
          sender: senderInfo,
          is_read: false,
          createdAt: message.createdAt,
        };

        // Emit to everyone in the conversation room
        io.to(`conversation_${conversation_id}`).emit('new_message', payload);

        // ── Notification for new message ─────────────────────────────
        try {
          const { createNotification } = await import('./controllers/notification.controller.js');
          const { Shelter } = db;

          let receiverId;

          if (isAdopter) {
            // Sender is adopter → notify shelter owner
            const shelter = await Shelter.findByPk(conversation.shelter_id, {
              attributes: ['owner_id'],
            });
            receiverId = shelter?.owner_id;
          } else {
            // Sender is shelter → notify adopter
            receiverId = conversation.adopter_id;
          }

          if (receiverId) {
            const notifMsg = `💬 New message from ${socket.user.first_name}`;

            // Save to DB so receiver sees it even if offline
            await createNotification({
              user_id: receiverId,
              message: notifMsg,
              reference_type: 'message',
              reference_id: conversation.pet_id,
            });

            // Emit real-time if receiver is online
            io.to(`user_${receiverId}`).emit('new_notification', {
              message: notifMsg,
              reference_type: 'message',
              reference_id: conversation.pet_id,
              created_at: new Date(),
              is_read: false,
            });
          }
        } catch (err) {
          console.error('Message notification failed:', err.message);
        }

      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Typing indicator ───────────────────────────────────────────────
    // Sends typing status to others in the conversation room
    // Does NOT save to DB — just a real-time signal
    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversation_id}`).emit('user_typing', {
        user_id: socket.user.id,
        is_typing: data.is_typing,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

  return io;
};