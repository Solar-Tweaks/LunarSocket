import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class PacketId52 extends Packet<Id52> {
  public static id = 52;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: Id52): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(PacketId52.id); // Packet ID

    this.buf.writeUUID(data.uuid);
    this.buf.writeBoolean(data.isFlying);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      uuid: this.buf.readUUID(),
      isFlying: this.buf.readBoolean(),
    };
  }
}

interface Id52 {
  uuid: string;
  isFlying: boolean;
}
