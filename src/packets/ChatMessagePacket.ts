import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class ChatMessagePacket extends Packet<ChatMessage> {
  public static id = 65;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: ChatMessage): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(ChatMessagePacket.id); // Packet ID

    this.buf.writeString(this.data.message);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      message: this.buf.readString(),
    };
  }
}

interface ChatMessage {
  message: string;
}
