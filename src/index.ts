import { Server as WebSocketServer } from 'ws';
import createServer from './api';
import Packet from './packets/Packet';
import Player, { Handshake } from './player/Player';
import getConfig, { initConfig } from './utils/config';
import logger from './utils/logger';
import ServerString from './utils/ServerString';
import startStats from './utils/stats';

console.log(`  _                               _____            _        _   
 | |                             / ____|          | |      | |  
 | |    _   _ _ __   __ _ _ __  | (___   ___   ___| | _____| |_ 
 | |   | | | | '_ \\ / _\` | '__|  \\___ \\ / _ \\ / __| |/ / _ \\ __|
 | |___| |_| | | | | (_| | |     ____) | (_) | (__|   <  __/ |_ 
 |______\\__,_|_| |_|\\__,_|_|    |_____/ \\___/ \\___|_|\\_\\___|\\__|\n`);

const config = initConfig();
export const httpServer = createServer();

const server = new WebSocketServer({
  server: httpServer,
  path: config.server.websocketPath,
});

server.on('error', (error) => {
  logger.error(error);
});

server.on('listening', () => {
  logger.log(`Server listening on port ${config.server.port}`);
});

server.on('connection', async (socket, request) => {
  const getHeader = (name: string) => request.headers[name.toLowerCase()];

  const handshake = {} as Handshake;

  for (const header of [
    'accountType',
    'arch',
    'Authorization',
    'branch',
    'clothCloak',
    'gitCommit',
    'hatHeightOffset',
    'hwid',
    'launcherVersion',
    'lunarPlusColor',
    'os',
    'playerId',
    'protocolVersion',
    'server',
    'showHatsOverHelmet',
    'showHatsOverSkinLayer',
    'username',
    'version',
  ]) {
    handshake[header] = getHeader(header);
  }

  // Ignoring players with older/newer protocol versions
  if (handshake.protocolVersion !== '6')
    return socket.close(1002, 'Incompatible protocol version, requires 6');

  const config = await getConfig();

  if (config.whitelist.enabled)
    if (!config.whitelist.list.includes(handshake.playerId))
      return socket.close(3000, 'You are not whitelisted');
  if (config.blacklist.list.includes(handshake.playerId))
    return socket.close(3000, 'You have been blacklisted.');

  // Closing the connection if the player is already connected
  if (connectedPlayers.find((p) => p.uuid === handshake.playerId))
    return socket.close(3001, 'Already connected');

  const player = new Player(socket, handshake);

  connectedPlayers.push(player);
});

export function broadcast(data: Buffer | Packet, server?: string): void {
  const playerServer = new ServerString(server);

  connectedPlayers.forEach((p) => {
    if (server) {
      if (ServerString.match(playerServer, p.server)) p.writeToClient(data);
    } else p.writeToClient(data);
  });
}

export function removePlayer(uuid: string): void {
  connectedPlayers = connectedPlayers.filter((p) => p.uuid !== uuid);
}

export let connectedPlayers: Player[] = [];

startStats();

process.on('uncaughtException', (error) => {
  logger.error(error);
});
