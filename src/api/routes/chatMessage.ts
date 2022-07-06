import { Request, Router } from 'express';
import ChatMessagePacket from '../../packets/ChatMessagePacket';
import findPlayer from '../../utils/findPlayer';
import auth from '../middleware/auth';

const chatMessageRouter = Router();

chatMessageRouter.post(
  '/',
  auth,
  (request: Request<{}, {}, ChatMessageRequestBody>, response) => {
    if (
      typeof request.body.player !== 'string' ||
      typeof request.body.message !== 'string'
    )
      return response.sendStatus(400);

    const player = findPlayer(request.body.player);
    if (!player) return response.sendStatus(404);

    const chatMessage = new ChatMessagePacket();
    chatMessage.write({
      message: request.body.message,
    });
    player.writeToClient(chatMessage);
  }
);

export default chatMessageRouter;

interface ChatMessageRequestBody {
  player: string;
  message: string;
}
