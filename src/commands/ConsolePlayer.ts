import { removeColorCodes } from '../utils/processColorCodes';
import CommandHandler from './CommandHandler';

export default class ConsolePlayer {
  public username: string;
  public operator: boolean;
  public role: { data: { permissions: string[] } };
  public handler: CommandHandler;

  public constructor() {
    this.username = 'Console';
    this.operator = true;
    this.role = { data: { permissions: ['*'] } };

    this.handler = new CommandHandler(this);

    process.stdin.on('data', (data) => {
      this.handler.handle(data.toString().replace('\n', ''));
    });
  }

  public sendConsoleMessage(message: string): void {
    console.log(removeColorCodes(message));
  }
}
