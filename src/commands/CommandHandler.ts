import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import Player from '../player/Player';
import Command from './Command';
import ConsolePlayer from './ConsolePlayer';

export default class CommandHandler {
  public readonly player: Player | ConsolePlayer;

  public static commands: Command[] = [];

  public constructor(player: Player | ConsolePlayer) {
    this.player = player;
  }

  handle(raw: string): void {
    const command = CommandHandler.commands.find((c) =>
      raw.startsWith(c.command)
    );

    if (!command) {
      return this.player.sendConsoleMessage('§cCommand not found');
    }

    if (
      !(
        this.player.role.data.permissions.includes('*') ||
        this.player.role.data.permissions.includes(
          `command.${command.command}`
        ) ||
        this.player.operator
      )
    ) {
      return this.player.sendConsoleMessage(
        "§cYou're not allowed to use this command!"
      );
    }

    if (raw.split(' ').includes('-h') || raw.split(' ').includes('--help')) {
      if (command.help) {
        const messages = command.help.split('\n'); // Console doesn't support \n
        messages.forEach((m) => this.player.sendConsoleMessage(m));
      } else
        this.player.sendConsoleMessage(
          "§cThis command doesn't have a help message"
        );
      return;
    }

    command.trigger(this.player, raw);
  }
}

const excludedFiles = ['CommandHandler.js', 'Command.js', 'ConsolePlayer.js'];

const basePath = join(process.cwd(), 'dist', 'commands');
readdirSync(basePath).forEach(async (file) => {
  if (file.endsWith('.js') && !excludedFiles.includes(file)) {
    const command = await import(join(basePath, file));
    CommandHandler.commands.push(command.default);
  }
});

export const consolePlayer = new ConsolePlayer();
