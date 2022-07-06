import { Request, Router } from 'express';
import { consolePlayer } from '../../commands/CommandHandler';
import auth from '../middleware/auth';

const broadcastRouter = Router();

broadcastRouter.post(
  '/',
  auth,
  (request: Request<{}, {}, BroadcastRequestBody>, response) => {
    if (typeof request.body.message !== 'string')
      return response.sendStatus(400);

    consolePlayer.handler.handle(`broadcast ${request.body.message}`);

    response.sendStatus(200);
  }
);

export default broadcastRouter;

interface BroadcastRequestBody {
  message: string;
}
