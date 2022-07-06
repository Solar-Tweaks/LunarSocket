import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId72 extends Packet<Id72> {
  public static id = 72;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id72): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId72.id); // Packet ID

    this.buf.finish();
  }

  public read(): void {
    this.data = {};
  }
}

interface Id72 {}
