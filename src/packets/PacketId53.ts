import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId53 extends Packet<Id53> {
  public static id = 53;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id53): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId53.id); // Packet ID

    this.buf.finish();
  }

  public read(): void {
    this.data = {};
  }
}

interface Id53 {}
