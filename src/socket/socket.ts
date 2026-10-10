import { Server } from 'socket.io';
import { messageService } from '../app/modules/messages/message.service';

const socket = async (io: Server) => {
  io.on('connection', async (socket) => {
    const currentUserId: any =
      socket.handshake.query?.id ||
      socket.handshake.auth?.userId ||
      socket.handshake.auth?.id;

    if (currentUserId) {
      socket.join(currentUserId.toString());
      console.log('👤 A user connected', currentUserId);
    }

    await messageService.sendMessage(currentUserId, socket, io);

    socket.on('join', (userId: string) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`👤 User ${userId} joined room`);
      }
    });

    //disconnect user
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

export default socket;
