import BufWrapper from '@minecraft-js/bufwrapper';
import { EventEmitter } from 'node:events';
import TypedEventEmitter from 'typed-emitter';
import { isProduction } from '..';
import Player from '../player/Player';
import logger from '../utils/logger';
import ApplyCosmeticsPacket from './ApplyCosmeticsPacket';
import ChatMessagePacket from './ChatMessagePacket';
import ClientBanPacket from './ClientBanPacket';
import ConsoleMessagePacket from './ConsoleMessagePacket';
import DoEmotePacket from './DoEmotePacket';
import EquipEmotesPacket from './EquipEmotesPacket';
import ForceCrashPacket from './ForceCrashPacket';
import FriendListPacket from './FriendListPacket';
import FriendMessagePacket from './FriendMessagePacket';
import FriendRequestPacket from './FriendRequestPacket';
import FriendResponsePacket from './FriendResponsePacket';
import FriendUpdatePacket from './FriendUpdatePacket';
import GiveEmotesPacket from './GiveEmotesPacket';
import HostListPacket from './HostListPacket';
import HostListRequestPacket from './HostListRequest';
import JoinServerPacket from './JoinServerPacket';
import KeepAlivePacket from './KeepAlivePacket';
import NotificationPacket from './NotificationPacket';
import PacketId71 from './PacketId71';
import PacketId73 from './PacketId73';
import PendingRequestsPacket from './PendingRequestsPacket';
import PlayEmotePacket from './PlayEmotePacket';
import PlayerInfoPacket from './PlayerInfoPacket';
import PlayerInfoRequestPacket from './PlayerInfoRequestPacket';
import ReceiveFriendRequestPacket from './ReceiveFriendRequest';
import RemoveFriendPacket from './RemoveFriendPacket';
import TaskListPacket from './TaskListPacket';
import TaskListRequestPacket from './TaskListRequestPacket';
import ToggleFriendRequestsPacket from './ToggleFriendRequestsPacket';
import UpdateVisiblePlayersPacket from './UpdateVisiblePlayersPacket';

const OutgoingPackets = {
  giveEmotes: GiveEmotesPacket,
  playEmote: PlayEmotePacket,
  notification: NotificationPacket,
  playerInfo: PlayerInfoPacket,
  friendList: FriendListPacket,
  friendMessage: FriendMessagePacket,
  pendingRequestsPacket: PendingRequestsPacket,
  friendRequest: FriendRequestPacket,
  friendResponse: FriendResponsePacket,
  forceCrash: ForceCrashPacket,
  taskListRequest: TaskListRequestPacket,
  hostListRequest: HostListRequestPacket,
  clientBan: ClientBanPacket,
  friendUpdate: FriendUpdatePacket,
  joinServer: JoinServerPacket,
  receiveFriendRequest: ReceiveFriendRequestPacket,
  chatMessage: ChatMessagePacket,
};

// Outgoing is when a packet is sent by the server to the client
export class OutgoingPacketHandler extends (EventEmitter as new () => TypedEventEmitter<OutgoingPacketHandlerEvents>) {
  public static packets = Object.values(OutgoingPackets);

  private player: Player;

  public constructor(player: Player) {
    super();
    this.player = player;
  }

  public handle(data: Buffer): void {
    const buf = new BufWrapper(data);

    const id = buf.readVarInt();
    const Packet = OutgoingPacketHandler.packets.find((p) => p.id === id);

    if (!Packet) {
      if (!isProduction)
        logger.warn('Unknown packet id (outgoing):', id, data.toString('hex'));
      return this.player.writeToClient(data);
    } else if (!isProduction)
      logger.debug(`Received packet id ${id} (${Packet.name}) from server`);

    const packet = new Packet(buf);
    packet.read();

    const event = Object.keys(OutgoingPackets).find(
      (key) => OutgoingPackets[key] === Packet
    );
    // @ts-ignore - event is type of string and not keyof OutgoingPacketHandlerEvents but it works anyway
    if (this.listenerCount(event) > 0) this.emit(event, packet);
    else this.player.writeToClient(data);
  }
}

type OutgoingPacketHandlerEvents = {
  [key in keyof typeof OutgoingPackets]: (
    packet: InstanceType<typeof OutgoingPackets[key]>
  ) => void;
};

const IncomingPackets = {
  doEmote: DoEmotePacket,
  consoleMessage: ConsoleMessagePacket,
  joinServer: JoinServerPacket,
  equipEmotes: EquipEmotesPacket,
  applyCosmetics: ApplyCosmeticsPacket,
  playerInfoRequest: PlayerInfoRequestPacket,
  friendMessage: FriendMessagePacket,
  friendRequest: FriendRequestPacket,
  friendResponse: FriendResponsePacket,
  keepAlive: KeepAlivePacket,
  taskList: TaskListPacket,
  hostList: HostListPacket,
  removeFriend: RemoveFriendPacket,
  toggleFriendRequests: ToggleFriendRequestsPacket,
  updateVisiblePlayers: UpdateVisiblePlayersPacket,
  id71: PacketId71,
  id73: PacketId73,
};

// Incoming is when a packet is sent by the client to the server
export class IncomingPacketHandler extends (EventEmitter as new () => TypedEventEmitter<IncomingPacketHandlerEvents>) {
  public static packets = Object.values(IncomingPackets);

  private player: Player;

  public constructor(player: Player) {
    super();
    this.player = player;
  }

  public handle(data: Buffer): void {
    const buf = new BufWrapper(data);

    const id = buf.readVarInt();
    const Packet = IncomingPacketHandler.packets.find((p) => p.id === id);

    if (!Packet) {
      if (!isProduction) logger.warn('Unknown packet id (incoming):', id, data);
      return this.player.writeToServer(data);
    } else if (!isProduction)
      logger.debug(`Received packet id ${id} (${Packet.name}) from the client`);

    const packet = new Packet(buf);
    packet.read();

    const event = Object.keys(IncomingPackets).find(
      (key) => IncomingPackets[key] === Packet
    );
    // @ts-ignore - event is type of string and not keyof IncomingPacketHandlerEvents but it works anyway
    if (this.listenerCount(event) > 0) this.emit(event, packet);
    else this.player.writeToServer(data);
  }
}

type IncomingPacketHandlerEvents = {
  [key in keyof typeof IncomingPackets]: (
    packet: InstanceType<typeof IncomingPackets[key]>
  ) => void;
};
