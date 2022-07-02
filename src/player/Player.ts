import { readdir } from 'fs/promises';
import { join } from 'path';
import { WebSocket } from 'ws';
import { broadcast, removePlayer } from '..';
import CommandHandler from '../commands/CommandHandler';
import DatabaseManager from '../databases/Manager';
import ConsoleMessagePacket from '../packets/ConsoleMessagePacket';
import FriendListPacket from '../packets/FriendListPacket';
import GiveEmotesPacket from '../packets/GiveEmotesPacket';
import NotificationPacket from '../packets/NotificationPacket';
import Packet from '../packets/Packet';
import {
  IncomingPacketHandler,
  OutgoingPacketHandler,
} from '../packets/PacketHandlers';
import PlayEmotePacket from '../packets/PlayEmotePacket';
import PlayerInfoPacket from '../packets/PlayerInfoPacket';
import CallQueue from '../utils/CallQueue';
import getConfig from '../utils/config';
import events from '../utils/events';
import logger from '../utils/logger';
import { getRole, Role } from '../utils/roles';

export default class Player {
  public version: string;
  public username: string;
  public uuid: string;
  public server: string;
  public color: number;
  public premium: RealFake<boolean>;
  public clothCloak: RealFake<boolean>;
  public plusColor: number;
  public operator: boolean;
  public role: { name: string; data: Role };
  public emotes: {
    owned: OwnedFake<number[]>;
    equipped: OwnedFake<number[]>;
  };
  public adjustableHeightCosmetics: { [key: string]: number };
  public cosmetics: OwnedFake<{ id: number; equipped: boolean }[]>;
  public lastFriendList: FriendListPacket;
  public lastPlayerInfo: PlayerInfoPacket;
  public commandHandler: CommandHandler;

  private disconnected: boolean;
  private socket: WebSocket;
  private fakeSocket: WebSocket;
  private outgoingPacketHandler: OutgoingPacketHandler;
  private incomingPacketHandler: IncomingPacketHandler;

  public constructor(socket: WebSocket, handshake: Handshake) {
    this.version = handshake.version;
    this.username = handshake.username;
    this.uuid = handshake.playerId;
    this.server = handshake.server;
    this.premium = { real: false, fake: true };
    this.clothCloak = { real: false, fake: true };
    this.role = {
      name: 'default',
      data: { iconColor: 0, plusColor: 0, console: false, permissions: [] },
    };
    this.emotes = {
      owned: { owned: [], fake: [] },
      equipped: { owned: [], fake: [] },
    };
    this.cosmetics = {
      owned: [],
      fake: [],
    };
    this.adjustableHeightCosmetics = {};

    this.disconnected = false;
    this.socket = socket;
    this.outgoingPacketHandler = new OutgoingPacketHandler(this);
    this.incomingPacketHandler = new IncomingPacketHandler(this);
    // Yes, we are giving emotes out of nowhere
    for (let i = 0; i < 180; i++) this.emotes.owned.fake.push(i);

    // Yes, we're giving cosmetics out of nowhere again
    for (let i = 1; i < 2582; i++)
      this.cosmetics.fake.push({ id: i, equipped: false });

    const handleIncomingMessage = async (data: Buffer) => {
      // Trying to handle packet
      try {
        this.incomingPacketHandler.handle(data);
      } catch (error) {
        logger.error(error);
        this.writeToServer(data);
      }
    };

    // Queuing incoming messages in case the client
    // is sending a packet while the fake socket
    // isn't ready yet
    const incomingMessageQueue = new CallQueue<
      Buffer,
      (data: Buffer) => Promise<void>
    >(handleIncomingMessage);

    // Forwarding data
    this.socket.on('message', (data: Buffer) => {
      if (this.fakeSocket instanceof WebSocket) {
        handleIncomingMessage(data);
      } else incomingMessageQueue.push([data]);
    });

    // Handling disconnection and errors
    this.socket.on('close', () => {
      this.removePlayer();
    });

    this.socket.on('error', (error) => {
      logger.error(error);
      this.removePlayer();
    });

    (async () => {
      await this.restoreFromDatabase(); // Restoring data if it exists
      await this.updateDatabase(); // Saving data to database

      const config = await getConfig();
      this.operator = config.operators.includes(this.uuid);

      await this.setRole(this.role.name, false);

      const outgoingEvents = await readdir(
        join(process.cwd(), 'dist', 'player', 'events', 'outgoing')
      );
      for (const event of outgoingEvents) {
        if (!event.endsWith('.js')) continue;
        this.outgoingPacketHandler.on(
          // @ts-ignore - Perfectly fine
          event.replace('.js', ''),
          async (packet) => {
            const handler = await import(
              join(process.cwd(), 'dist', 'player', 'events', 'outgoing', event)
            );
            handler.default(this, packet);
          }
        );
      }

      const incomingEvents = await readdir(
        join(process.cwd(), 'dist', 'player', 'events', 'incoming')
      );
      for (const event of incomingEvents) {
        if (!event.endsWith('.js')) continue;
        this.incomingPacketHandler.on(
          // @ts-ignore - Perfectly fine
          event.replace('.js', ''),
          async (packet) => {
            const handler = await import(
              join(process.cwd(), 'dist', 'player', 'events', 'incoming', event)
            );
            handler.default(this, packet);
          }
        );
      }

      this.fakeSocket = new WebSocket(
        'wss://assetserver.lunarclientprod.com/connect',
        {
          headers: { ...handshake },
        }
      );
      this.commandHandler = new CommandHandler(this);
      logger.log(this.username, 'connected!');
      events.push({ type: 'login', value: this.username });

      this.fakeSocket.once(
        'message',
        async () => await incomingMessageQueue.emptyQueue()
      );

      this.fakeSocket.on('message', (data) => {
        // Trying to handle packet
        try {
          this.outgoingPacketHandler.handle(data as Buffer);
        } catch (error) {
          logger.error(error);
          this.writeToClient(data);
        }
      });
      this.fakeSocket.on('close', () => {
        this.removePlayer();
      });
      this.fakeSocket.on('error', (error) => {
        logger.error(error);
        this.removePlayer();
      });

      // After every listeners are registered sending a hi notification
      setTimeout(async () => {
        const notification = new NotificationPacket();
        notification.write({
          title: '',
          message: (await getConfig()).welcomeMessage,
        });
        this.writeToClient(notification);
      }, 1000);
    })();
  }

  public getPlayerInfo() {
    return {
      cosmetics: [...this.cosmetics.fake, ...this.cosmetics.owned].filter(
        (c) => c.equipped
      ),
      premium: this.premium.fake,
      color: this.role.data.iconColor,
      clothCloak: this.clothCloak.fake,
      plusColor: this.role.data.plusColor,
    };
  }

  public setCosmeticState(id: number, state: boolean): void {
    const owned = this.cosmetics.owned.find((c) => c.id === id);
    if (owned) {
      owned.equipped = state;
      return;
    }
    const fake = this.cosmetics.fake.find((c) => c.id === id);
    if (fake) {
      fake.equipped = state;
      return;
    }
  }

  public sendEmotes(): void {
    const packet = new GiveEmotesPacket();
    const data = {
      owned: [...this.emotes.owned.owned, ...this.emotes.owned.fake],
      equipped: [...this.emotes.equipped.owned, ...this.emotes.equipped.fake],
    };
    packet.write(data);
    this.writeToClient(packet);
  }

  public playEmote(id: number, metadata = 0) {
    const packet = new PlayEmotePacket();
    packet.write({ uuid: this.uuid, id, metadata });
    this.writeToClient(packet);
    broadcast(packet, this.server, this);
  }

  public sendConsoleMessage(message: string): void {
    for (const line of message.split('\n')) {
      const packet = new ConsoleMessagePacket();
      packet.write({ message: line });
      this.writeToClient(packet);
    }
  }

  public sendNotification(title: string, message: string): void {
    const packet = new NotificationPacket();
    packet.write({ title, message });
    this.writeToClient(packet);
  }

  public updateConsoleAccess(newState: boolean): void {
    const friendListPacket = new FriendListPacket();
    friendListPacket.write({
      ...this.lastFriendList.data,
      consoleAccess: newState || this.operator || this.role.data.console,
    });

    this.updateDatabase();
  }

  public async setRole(rank: string, updateClient = true) {
    const { default: isDefault, role } = await getRole(rank);
    this.role.name = isDefault ? 'default' : rank;
    this.role.data = role;

    if (!updateClient) return;
    const packet = new PlayerInfoPacket();
    packet.write({
      ...this.lastPlayerInfo.data,
      color: this.role.data.iconColor,
      plusColor: this.role.data.plusColor,
    });
    this.writeToClient(packet);
    this.updateConsoleAccess(this.operator || this.role.data.console);
  }

  public writeToClient(data: any | Packet): void {
    if (this.disconnected) return;

    try {
      if (data instanceof Packet) {
        this.socket.send(data.buf.buffer);
      } else this.socket.send(data);
    } catch (error) {
      logger.error('Error writing to client:', error.message);
    }
  }

  public writeToServer(data: any | Packet): void {
    if (this.disconnected) return;

    try {
      if (data instanceof Packet) {
        this.fakeSocket.send(data.buf.buffer);
      } else this.fakeSocket.send(data);
    } catch (error) {
      logger.error('Error writing to server:', error.message);
    }
  }

  public removePlayer(): void {
    if (this.disconnected) return;
    this.disconnected = true;
    logger.log(this.username, 'disconnected!');
    events.push({ type: 'logout', value: this.username });
    try {
      this.socket.close(1000);
    } catch (error) {}
    try {
      this.fakeSocket.close(1000);
    } catch (error) {}
    removePlayer(this.uuid);
  }

  public getLatency(lunar?: boolean): Promise<number> {
    const socket = lunar ? this.fakeSocket : this.socket;
    return new Promise((resolve) => {
      const start = Date.now();

      const execute = (data: Buffer): void => {
        if (data.toString() !== start.toString()) return;

        resolve((Date.now() - start) / 2);
        socket.off('pong', execute);
      };
      socket.on('pong', execute);

      socket.ping(start.toString());
    });
  }

  public getDatabasePlayer(): DatabasePlayer {
    return {
      emotes: {
        owned: this.emotes.equipped.owned,
        fake: this.emotes.equipped.fake,
      },
      clothCloak: this.clothCloak,
      role: this.role.name,
      cosmetics: {
        owned: this.cosmetics.owned.filter((c) => c.equipped).map((c) => c.id),
        fake: this.cosmetics.fake.filter((c) => c.equipped).map((c) => c.id),
      },
      adjustableHeightCosmetics: this.adjustableHeightCosmetics,
    };
  }

  public async updateDatabase(): Promise<void> {
    await DatabaseManager.database.setPlayer(this);
  }

  private async restoreFromDatabase(): Promise<void> {
    const data = await DatabaseManager.database.getPlayer(this.uuid);
    if (!data) return;

    // Considered as old database structure, ignoring
    // it and the socket will override the data
    if (Object.prototype.hasOwnProperty.call(data, 'color')) return;

    this.clothCloak = data.clothCloak ?? { real: false, fake: false };
    this.role.name = data.role ?? 'default';
    this.emotes.equipped = data.emotes ?? { owned: [], fake: [] };
    for (const ownedCosmetic of data.cosmetics.owned) {
      const cosmetic = this.cosmetics.owned.find((c) => c.id === ownedCosmetic);
      if (!cosmetic) continue;
      cosmetic.equipped = true;
    }
    for (const fakeCosmetic of data.cosmetics.fake) {
      const cosmetic = this.cosmetics.fake.find((c) => c.id === fakeCosmetic);
      if (!cosmetic) continue;
      cosmetic.equipped = true;
    }
    this.adjustableHeightCosmetics = data.adjustableHeightCosmetics ?? {};
  }
}

export interface DatabasePlayer {
  emotes: OwnedFake<number[]>;
  cosmetics: OwnedFake<number[]>;
  clothCloak: typeof Player.prototype.clothCloak;
  role: string;
  adjustableHeightCosmetics: { [key: string]: number };
}

export interface Handshake {
  accountType: string;
  arch: string;
  Authorization: string;
  branch: string;
  clothCloak: string;
  gitCommit: string;
  hatHeightOffset: string;
  hwid: string;
  launcherVersion: string;
  lunarPlusColor: string;
  os: string;
  playerId: string;
  protocolVersion: string;
  server: string;
  showHatsOverHelmet: string;
  showHatsOverSkinlayer: string;
  username: string;
  version: string;
}

type RealFake<T> = { real: T; fake: T };
type OwnedFake<T> = { owned: T; fake: T };
