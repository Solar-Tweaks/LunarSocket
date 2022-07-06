import { connectedPlayers } from '..';
import Player from '../player/Player';

export default function findPlayer(uuidOrUsername: string): Player {
  return connectedPlayers.find(
    (p) => p.uuid === uuidOrUsername || p.username === uuidOrUsername
  );
}
