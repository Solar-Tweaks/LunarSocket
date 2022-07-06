import PlayerInfoPacket from '../../../packets/PlayerInfoPacket';
import findPlayer from '../../../utils/findPlayer';
import Player from '../../Player';

export default function (player: Player, packet: PlayerInfoPacket): void {
  if (packet.data.uuid === player.uuid) {
    // Player info for player player
    player.cosmetics.owned = packet.data.cosmetics;
    // Removing the owned cosmetics from the fake list
    player.cosmetics.fake = player.cosmetics.fake.filter(
      (c) => !player.cosmetics.owned.find((o) => o.id === c.id)
    );
    player.premium.real = packet.data.premium;
    player.color = packet.data.color;
    player.clothCloak.real = packet.data.clothCloak;
    player.plusColor = packet.data.plusColor;
    player.adjustableHeightCosmetics = {
      ...packet.data.adjustableHeightCosmetics,
      ...player.adjustableHeightCosmetics,
    };

    player.updateDatabase();

    // Sending the owned and fake cosmetics to the client
    const newPacket = new PlayerInfoPacket();
    newPacket.write({
      ...packet.data,
      cosmetics: [...player.cosmetics.fake, ...player.cosmetics.owned],
      premium: player.premium.fake,
      color: player.role.data.iconColor,
      clothCloak: player.clothCloak.fake,
      plusColor: player.role.data.plusColor,
    });

    player.lastPlayerInfo = newPacket;

    return player.writeToClient(newPacket);
  }

  const connectedPlayer = findPlayer(packet.data.uuid);
  // If the player is not on the player websocket, sending back the original packet
  if (!connectedPlayer) return player.writeToClient(packet);

  const newPacket = new PlayerInfoPacket();
  newPacket.write({
    ...packet.data,
    ...connectedPlayer.getPlayerInfo(),
  });
  player.writeToClient(newPacket);
}
