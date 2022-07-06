import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId70 extends Packet<Id70> {
  public static id = 70;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id70): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId70.id); // Packet ID

    this.buf.writeString(this.data.id);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      id: this.buf.readString(),
    };
  }
}

interface Id70 {
  id: string;
}
