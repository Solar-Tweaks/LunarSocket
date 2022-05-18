import { readFileSync } from 'node:fs';
import { createServer, Server } from 'node:https';
import { Server as WebSocketServer } from 'ws';
import Packet from './packets/Packet';
import Player from './player/Player';
import getConfig, { getConfigSync } from './utils/config';
import logger from './utils/logger';

console.log(`  _                               _____            _        _   
 | |                             / ____|          | |      | |  
 | |    _   _ _ __   __ _ _ __  | (___   ___   ___| | _____| |_ 
 | |   | | | | '_ \\ / _\` | '__|  \\___ \\ / _ \\ / __| |/ / _ \\ __|
 | |___| |_| | | | | (_| | |     ____) | (_) | (__|   <  __/ |_ 
 |______\\__,_|_| |_|\\__,_|_|    |_____/ \\___/ \\___|_|\\_\\___|\\__|\n`);

let httpsServer: Server;

const config = getConfigSync();

if (config.secure) {
  httpsServer = createServer({
    cert: readFileSync(config.certificates.cert),
    key: readFileSync(config.certificates.key),
  });

  httpsServer.listen(config.port);
}

const server = new WebSocketServer({
  server: config.secure ? httpsServer : undefined,
  port: config.secure ? undefined : config.port,
  path: '/connect',
});

server.on('error', (error) => {
  logger.error(error);
});

server.on('listening', () => {
  logger.log(`Server listening on port ${config.port}`);
});

server.on('connection', async (socket, request) => {
  const handshake = {
    accountType: request.headers['accounttype'] as string,
    arch: request.headers['arch'] as string,
    Authorization: request.headers['authorization'] as string,
    branch: request.headers['branch'] as string,
    clothCloak: request.headers['clothcloak'] as string,
    gitCommit: request.headers['gitcommit'] as string,
    hatHeightOffset: request.headers['hatheightoffset'] as string,
    hwid: request.headers['hwid'] as string,
    launcherVersion: request.headers['launcherversion'] as string,
    lunarPlusColor: request.headers['lunarpluscolor'] as string,
    os: request.headers['os'] as string,
    playerId: request.headers['playerid'] as string,
    protocolVersion: request.headers['protocolversion'] as string,
    showHatsOverHelmet: request.headers['showhatsoverhelmet'] as string,
    showHatsOverSkinlayer: request.headers['showhatsoverskinlayer'] as string,
    username: request.headers['username'] as string,
    version: request.headers['version'] as string,
  };

  // Ignoring players with older/newer protocol versions
  if (handshake.protocolVersion !== '5')
    return socket.close(1002, 'Incompatible protocol version, requires 5');

  const config = await getConfig();

  if (config.enableWhitelist)
    if (!config.whitelist.includes(handshake.playerId))
      return socket.close(3000, 'You are not whitelisted');

  // Closing the connection if the player is already connected
  if (connectedPlayers.find((p) => p.uuid === handshake.playerId))
    return socket.close(3001, 'Already connected');

  const player = new Player(socket, handshake);

  connectedPlayers.push(player);
});

export function broadcast(data: Buffer | Packet, server?: string): void {
  connectedPlayers.forEach((p) => {
    if (server) {
      if (server === p.server) p.writeToClient(data);
    } else p.writeToClient(data);
  });
}

export function removePlayer(uuid: string): void {
  connectedPlayers = connectedPlayers.filter((p) => p.uuid !== uuid);
}

export let connectedPlayers: Player[] = [];
