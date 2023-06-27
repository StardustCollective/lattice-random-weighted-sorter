import DebugFn from 'debug';

import { SeededRandomNumberGenerator } from './random_numbers.js';
import { IItem } from './items.js';

const debug = DebugFn('lattice:random-sorter');

class SeededRandomSorter {
  private _generator: SeededRandomNumberGenerator;
  private _participants: IItem[];
  private _participantsPositions = new Map<number, IItem>();
  private _participantsAssigned = new Set<string>();

  constructor(seedEncoded: string, state: number, participants: IItem[]) {
    this._generator = new SeededRandomNumberGenerator(seedEncoded, state);
    this._participants = [...participants].sort((itemA, itemB) =>
      String(itemA.id).localeCompare(String(itemB.id))
    );
  }

  get seed() {
    return this._generator.seed;
  }

  get state() {
    return this._generator.state;
  }

  get participants() {
    return [...this._participants];
  }

  get positions() {
    return new Map(this._participantsPositions);
  }

  assignNextPosition() {
    const nextPosition = this._participantsAssigned.size;

    debug(`Assigning position ${nextPosition}`);

    while (nextPosition === this._participantsAssigned.size) {
      const nextPositionWinnerIndex = this._generator.generateRandomIntInRange(
        this._participants.length
      );

      const participant = this._participants[nextPositionWinnerIndex];

      if (!participant) {
        throw new Error('Inconsistency error: out of bounds');
      }

      if (this._participantsAssigned.has(participant.id)) {
        debug(
          `Participant ${participant.id.slice(
            0,
            20
          )} already has a position, skipping round`
        );
        continue;
      }

      console.log(
        `Assigning participant ${participant.id.slice(
          0,
          20
        )} => pos#${nextPosition}`
      );

      this._participantsPositions.set(nextPosition, participant);
      this._participantsAssigned.add(participant.id);
    }
  }

  assignAllPositions() {
    while (this._participantsAssigned.size < this._participants.length) {
      this.assignNextPosition();
    }
  }
}

export { SeededRandomSorter };
