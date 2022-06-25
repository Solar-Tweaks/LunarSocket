import checkUUID from '../utils/checkUUID';
import getConfig, { editConfig } from '../utils/config';
import Command from './Command';

const command = new Command('whitelist', 'Manage the whitelist');

command.help = `usage: whitelist <action> §o[value]
  actions:
    §lstatus§r    Get whitelist status (enabled/disabled)
    §lon§r        Enable whitelist
    §loff§r       Disable whitelist
    §llist§r      List whitelisted players (uuids)
    §ladd§r       Add a player to the whitelist, the value is the uuid
    §lremove§r    Remove a player from the whitelist, the value is the uuid
`;

command.setHandler(async (player, command, args) => {
  const actions = ['status', 'on', 'off', 'list', 'add', 'remove'];

  if (!actions.includes(args[0]))
    return player.sendConsoleMessage(
      `§cYou must specify an action! Valid actions: ${actions.join(', ')}`
    );

  function invalidValue(): void {
    player.sendConsoleMessage(
      `§cYou must specify a value for action ${args[0]}!`
    );
  }

  const config = await getConfig();

  switch (args[0]) {
    case 'status':
      player.sendConsoleMessage(
        `Whitelist is currently ${
          config.whitelist.enabled ? '§aenabled' : '§cdisabled'
        }`
      );
      break;

    case 'on':
      await editConfig({
        ...config,
        whitelist: { ...config.whitelist, enabled: true },
      });
      player.sendConsoleMessage('Whitelist has been §aenabled');
      break;

    case 'off':
      await editConfig({
        ...config,
        whitelist: { ...config.whitelist, enabled: false },
      });
      player.sendConsoleMessage('Whitelist has been §cdisabled');
      break;

    case 'list':
      player.sendConsoleMessage(
        `Players whitelisted: §o${config.whitelist.list.join(', ')}`
      );
      break;

    case 'add':
      if (!args[1]) return invalidValue();

      if (!checkUUID(args[1]))
        return player.sendConsoleMessage(
          "§cThe UUID you provided isn't valid."
        );

      await editConfig({
        ...config,
        whitelist: {
          ...config.whitelist,
          list: [...config.whitelist.list, args[1]],
        },
      });
      player.sendConsoleMessage(`${args[1]} has been added to the whitelist`);
      break;

    case 'remove':
      if (!args[1]) return invalidValue();

      if (!checkUUID(args[1]))
        return player.sendConsoleMessage(
          "§cThe UUID you provided isn't valid."
        );

      await editConfig({
        ...config,
        whitelist: {
          ...config.whitelist,
          list: config.whitelist.list.filter((uuid) => uuid !== args[1]),
        },
      });
      player.sendConsoleMessage(
        `${args[1]} has been removed from the whitelist`
      );
      break;
    default:
      break;
  }
});

export default command;
