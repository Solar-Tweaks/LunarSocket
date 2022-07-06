import events from '../utils/events';
import findPlayer from '../utils/findPlayer';
import Command from './Command';

const command = new Command('role', 'Manage roles');

command.help = `usage: role <action> <...arguments> §o[...options]
  actions:
    §lset§r    Set the given role to the given user
              Arguments: <username or uuid> <role>
              Example: role set Cy0ze admin
`;

command.setHandler(async (player, command, args) => {
  const actions = ['set'];
  const action = args[0];

  if (!actions.includes(action))
    return player.sendConsoleMessage(
      `§cYou must specify an action! Valid actions: ${actions.join(', ')}`
    );

  switch (action) {
    case 'set':
      const target = args[1];
      const role = args[2];

      if (!target)
        return player.sendConsoleMessage(`§cYou must specify an user!`);
      if (!role) return player.sendConsoleMessage(`§cYou must specify a role!`);

      const foundTarget = findPlayer(target);
      if (!foundTarget)
        return player.sendConsoleMessage(
          `§c${target} is not connected at the moment!`
        );

      await foundTarget.setRole(role);
      player.sendConsoleMessage(
        `§a${target} has been given the role ${foundTarget.role.name}`
      );
      events.push({
        type: 'role-set',
        value: `${foundTarget.username},${foundTarget.role.name}`,
      });
      break;

    default:
      break;
  }
});

export default command;
