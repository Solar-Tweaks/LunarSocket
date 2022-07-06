import BufWrapper from '@minecraft-js/bufwrapper';

import Packet from './Packet';

export default class ConstantChangedPacket extends Packet<ConstantChanged> {
  public static id = 24;

  public constructor(buf?: BufWrapper) {
    super(buf);
  }

  public write(data: ConstantChanged): void {
    this.data = data;

    this.buf = new BufWrapper(null, { oneConcat: true });
    this.buf.writeVarInt(ConstantChangedPacket.id); // Packet ID

    this.buf.writeInt(data.id);
    this.buf.writeString(data.value);

    this.buf.finish();
  }

  public read(): void {
    this.data = {
      id: this.buf.readInt(),
      value: this.buf.readString(),
    };
  }
}

interface ConstantChanged {
  id: number;
  value: string;
}
