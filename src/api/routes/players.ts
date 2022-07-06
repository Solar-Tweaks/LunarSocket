import { Router } from 'express';
import { connectedPlayers } from '../..';
import auth from '../middleware/auth';

const playersRouter = Router();

playersRouter.get('/', auth, (request, response) => {
  const players = connectedPlayers.map((p) => ({
    uuid: p.uuid,
    username: p.username,
    role: p.role.name,
  }));

  response.status(200).send(players);
});

export default playersRouter;
