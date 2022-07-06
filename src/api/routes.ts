import { Express } from 'express';
import actionRouter from './routes/action';
import broadcastRouter from './routes/broadcast';
import chatMessageRouter from './routes/chatMessage';
import dashboard from './routes/dashboard';
import keyRouter from './routes/key';
import playersRouter from './routes/players';
import rolesRouter from './routes/roles';
import statsRouter from './routes/stats';

export default function registerRoutes(app: Express): void {
  app.use('/api/stats', statsRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/key', keyRouter);
  app.use('/api/action', actionRouter);
  app.use('/api/broadcast', broadcastRouter);
  app.use('/api/chatMessage', chatMessageRouter);
  app.use('/api/players', playersRouter);

  app.use('/dashboard', dashboard);

  app.get('/', (request, response) => response.sendStatus(200));
}
