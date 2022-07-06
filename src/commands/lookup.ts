import findPlayer from '../utils/findPlayer';
import Command from './Command';

const command = new Command('lookup', 'Look up for a player');

command.help = `usage: lookup <player name or player uuid>`;

command.setHandler((player, command, args) => {
  const playerName = args[0];
  if (!playerName)
    return player.sendConsoleMessage(`§cYou must specify a player!`);

  const p = findPlayer(playerName);
  if (!p) return player.sendConsoleMessage(`§cPlayer not found!`);

  const message = `§lLookup: ${p.username}
  Version: ${p.version}
  UUID: ${p.uuid}
  Server: ${p.server.length === 0 ? 'Not connected' : p.server}
  Color (Real): #${p.color.toString(16)}
  Color (Fake): #${p.role.data.iconColor.toString(16)}
  Plus Color (Real): #${p.plusColor.toString(16)}
  Plus Color (Fake): #${p.role.data.plusColor.toString(16)}
  Premium (Real): ${p.premium.real}
  Premium (Fake): ${p.premium.fake}
  Cloth Cloak (Real): ${p.clothCloak.real}
  Cloth Cloak (False): ${p.clothCloak.fake}
  Operator: ${p.operator}
  Role: ${p.role.name}
  Role (plain): ${JSON.stringify(p.role.data)}
  Emotes Owned (Real): ${p.emotes.owned.owned.length}
  Emotes Equipped (Real): ${p.emotes.equipped.owned.length}
  Emotes Equipped (Fake): ${p.emotes.equipped.fake.length}
  Cosmetics Owned (Real): ${p.cosmetics.owned.length}
  Cosmetics Equipped (Real & Fake): ${
    [...p.cosmetics.owned, ...p.cosmetics.fake].filter((c) => c.equipped).length
  }
`;

  player.sendConsoleMessage(message);
});

export default command;
