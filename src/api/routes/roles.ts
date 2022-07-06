import { Request, Router } from 'express';
import events from '../../utils/events';
import findPlayer from '../../utils/findPlayer';
import auth from '../middleware/auth';

const rolesRouter = Router();

rolesRouter.patch(
  '/',
  auth,
  (request: Request<{}, {}, RolesRequestBody>, response) => {
    request.on('end', async () => {
      if (
        typeof request.body.player !== 'string' ||
        typeof request.body.role !== 'string'
      )
        return response.sendStatus(400);

      const player = findPlayer(request.body.player);
      if (!player) {
        return response.sendStatus(404);
      }

      const oldRole = player.role.name;
      await player.setRole(request.body.role);
      events.push({
        type: 'role-set',
        value: `${player.username},${player.role.name}`,
      });

      if (oldRole === player.role.name) {
        return response.sendStatus(304);
      } else {
        return response.sendStatus(200);
      }
    });
  }
);

export default rolesRouter;

interface RolesRequestBody {
  player: string;
  role: string;
}
