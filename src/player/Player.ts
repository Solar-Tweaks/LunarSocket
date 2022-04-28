import { readdir } from 'fs/promises';
import { join } from 'path';
import { WebSocket } from 'ws';
import { broadcast, removePlayer } from '..';
import CommandHandler from '../commands/CommandHandler';
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
import getConfig from '../utils/config';
import instanceStorage from '../utils/instanceStorage';
import logger from '../utils/logger';

export default class Player {
  public version: string;
  public username: string;
  public uuid: string;
  public server: string;
  public color: RealFake<number>;
  public premium: RealFake<boolean>;
  public clothCloak: RealFake<boolean>;
  public plusColor: RealFake<number>;
  public operator: boolean;

  public emotes: {
    owned: OwnedFake<number[]>;
    equipped: OwnedFake<number[]>;
  };
  public cosmetics: OwnedFake<{ id: number; equipped: boolean }[]>;

  public lastFriendList: FriendListPacket;

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
    this.server = '';
    this.premium = { real: false, fake: true };
    this.clothCloak = { real: false, fake: true };

    this.emotes = {
      owned: { owned: [], fake: [] },
      equipped: { owned: [], fake: [] },
    };
    this.cosmetics = {
      owned: [],
      fake: [],
    };

    this.disconnected = false;
    this.socket = socket;
    this.fakeSocket = new WebSocket(
      'wss://assetserver.lunarclientprod.com/connect',
      {
        headers: { ...handshake },
      }
    );
    this.outgoingPacketHandler = new OutgoingPacketHandler(this);
    this.incomingPacketHandler = new IncomingPacketHandler(this);
    this.commandHandler = new CommandHandler(this);

    logger.log(this.username, 'connected!');

    // Yes, we are giving emotes out of nowhere
    for (let i = 0; i < 150; i++) this.emotes.owned.fake.push(i);

    // Yes, wea re giving cosmetics out of nowhere again
    for (let i = 1; i < 2361; i++)
      this.cosmetics.fake.push({ id: i, equipped: false });

    this.restoreFromInstanceStorage(); // Restoring data if it exists
    this.updateInstanceStorage(); // Saving data to instanceStorage

    // Forwarding data
    this.socket.on('message', (data) => {
      // Trying to handle packet
      try {
        this.incomingPacketHandler.handle(data as Buffer);
      } catch (error) {
        logger.error(error);
        this.writeToServer(data);
      }
    });

    this.fakeSocket.on('message', (data) => {
      // Trying to handle packet
      try {
        this.outgoingPacketHandler.handle(data as Buffer);
      } catch (error) {
        logger.error(error);
        this.writeToClient(data);
      }
    });

    // Handling disconnection and errors
    this.socket.on('close', () => {
      this.removePlayer();
    });
    this.fakeSocket.on('close', () => {
      this.removePlayer();
    });
    this.socket.on('error', (error) => {
      logger.error(error);
      this.removePlayer();
    });
    this.fakeSocket.on('error', (error) => {
      logger.error(error);
      this.removePlayer();
    });

    (async () => {
      var config = await getConfig();
      this.operator = config.operators.includes(this.uuid);

      this.color = { real: 0, fake: this.operator ? config.operatorIconColor : config.iconColor }
      this.plusColor = { real: 0, fake: this.operator ? config.operatorPlusColor : config.plusColor };

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
    })();

    // After every listeners are registered sending a hi notification
    setTimeout(async () => {
      const notification = new NotificationPacket();
      notification.write({
        title: '',
        message: (await getConfig()).welcomeMessage,
      });
      this.writeToClient(notification);
    }, 1000);
  }

  public getPlayerInfo() {
    return {
      cosmetics: [...this.cosmetics.fake, ...this.cosmetics.owned].filter(
        (c) => c.equipped
      ),
      premium: this.premium.fake,
      color: this.color.fake,
      clothCloak: this.clothCloak.fake,
      plusColor: this.plusColor.fake,
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

  public playEmote(id: number) {
    const packet = new PlayEmotePacket();
    packet.write({ uuid: this.uuid, id });
    broadcast(packet, this.server); // Sending only to people who are on the same server
  }

  public sendConsoleMessage(message: string): void {
    const packet = new ConsoleMessagePacket();
    packet.write({ message });
    this.writeToClient(packet);
  }

  public sendNotification(title: string, message: string): void {
    const packet = new NotificationPacket();
    packet.write({ title, message });
    this.writeToClient(packet);
  }

  public setOperatorState(newState: boolean): void {
    this.operator = newState;

    const message = this.operator
      ? '§l§aYou are now an operator!'
      : '§l§cYou are no longer an operator!';
    this.sendNotification('', message);

    const friendListPacket = new FriendListPacket();
    friendListPacket.write({
      ...this.lastFriendList.data,
      consoleAccess: this.operator,
    });

    this.updateInstanceStorage();
  }

  public writeToClient(data: any | Packet): void {
    try {
      if (data instanceof Packet) {
        this.socket.send(data.buf.buffer);
      } else this.socket.send(data);
    } catch (error) {
      logger.error('Error writing to client:', error.message);
    }
  }

  public writeToServer(data: any | Packet): void {
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
    try {
      this.socket.close(1000);
    } catch (error) {}
    try {
      this.fakeSocket.close(1000);
    } catch (error) {}
    removePlayer(this.uuid);
  }

  public updateInstanceStorage(): void {
    instanceStorage.set(this.uuid, {
      emotes: this.emotes,
      cosmetics: this.cosmetics,
      color: this.color,
      clothCloak: this.clothCloak,
      plusColor: this.plusColor,
      premium: this.premium,
    });
  }

  private restoreFromInstanceStorage(): void {
    const data = instanceStorage.get(this.uuid);
    if (!data) return;
    this.emotes = data.emotes;
    this.cosmetics = data.cosmetics;
    this.color = data.color;
    this.clothCloak = data.clothCloak;
    this.plusColor = data.plusColor;
    this.premium = data.premium;
  }
}

interface Handshake {
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
  showHatsOverHelmet: string;
  showHatsOverSkinlayer: string;
  username: string;
  version: string;
}

type RealFake<T> = { real: T; fake: T };
type OwnedFake<T> = { owned: T; fake: T };
