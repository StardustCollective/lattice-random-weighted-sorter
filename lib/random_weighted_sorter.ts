import DebugFn from 'debug';

import { SeededRandomNumberGenerator } from './random_numbers.js';
import { IItem } from './items.js';

const debug = DebugFn('lattice:weighted-sorter');

class SeededRandomWeightedSorter {
  private _generator: SeededRandomNumberGenerator;
  private _participants: IItem[];
  private _participantsWeight: number;
  private _participantsPositions = new Map<number, IItem>();
  private _participantsAssigned = new Set<string>();

  constructor(seedEncoded: string, state: number, participants: IItem[]) {
    if (!participants.every((item) => item.weight > 0)) {
      throw new Error(
        'SeededRandomWeightedSorter: All participants must have non-zero weights'
      );
    }
    this._generator = new SeededRandomNumberGenerator(seedEncoded, state);
    this._participants = [...participants].sort((itemA, itemB) =>
      String(itemA.id).localeCompare(String(itemB.id))
    );
    this._participantsWeight = this._participants.reduce(
      (sum, participant) => sum + participant.weight,
      0
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

  get participantsWeight() {
    return this._participantsWeight;
  }

  get positions() {
    return new Map(this._participantsPositions);
  }

  assignNextPosition() {
    const nextPosition = this._participantsAssigned.size;

    debug(`Assigning position ${nextPosition}`);

    while (nextPosition === this._participantsAssigned.size) {
      const nextPositionWinner = this._generator.generateRandomIntInRange(
        this._participantsWeight
      );
      let currentAccumulatedWeight = 0;

      for (const participant of this._participants) {
        currentAccumulatedWeight += participant.weight;

        if (nextPositionWinner > currentAccumulatedWeight) {
          continue;
        }

        if (this._participantsAssigned.has(participant.id)) {
          debug(
            `Participant ${participant.id.slice(
              0,
              20
            )} already has a position, skipping round`
          );
          break;
        }

        console.log(
          `Assigning participant ${participant.id.slice(
            0,
            20
          )} => pos#${nextPosition} => weight#${participant.weight} `
        );

        this._participantsPositions.set(nextPosition, participant);
        this._participantsAssigned.add(participant.id);

        break;
      }
    }
  }

  assignAllPositions() {
    while (this._participantsAssigned.size < this._participants.length) {
      this.assignNextPosition();
    }
  }
}

export { SeededRandomWeightedSorter };
