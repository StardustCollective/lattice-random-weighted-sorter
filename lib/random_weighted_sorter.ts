import { SeededRandomNumberGenerator } from './random_numbers.js';
import { IItem } from './items.js';

class SeededRandomWeightedSorter {
  private _generator: SeededRandomNumberGenerator;
  private _participants: IItem[];
  private _participantsWeight: number;
  private _participantsPositions = new Map<number, IItem>();
  private _participantsAssigned = new Set<string>();

  constructor(seedEncoded: string, state: number, participants: IItem[]) {
    this._generator = new SeededRandomNumberGenerator(seedEncoded, state);
    this._participants = [...participants]
      .filter((item) => item.weight > 0)
      .sort((itemA, itemB) => String(itemA.id).localeCompare(String(itemB.id)));
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

  assignNextPosition() {
    const nextPosition = this._participantsAssigned.size;

    console.log(`Assigning position ${nextPosition}`);

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
          console.log(
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
          )} => pos#${nextPosition}`
        );

        this._participantsPositions.set(nextPosition, participant);
        this._participantsAssigned.add(participant.id);
      }
    }
  }

  assignAllPositions() {
    while (this._participantsAssigned.size > this._participants.length) {
      this.assignNextPosition();
    }
  }
}

export { SeededRandomWeightedSorter };
