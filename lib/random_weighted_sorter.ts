import DebugFn from 'debug';

import { SeededRandomNumberGenerator } from './random_numbers.js';
import { IItem } from './items.js';

const debug = DebugFn('lattice:weighted-sorter');

class SeededRandomWeightedSorter {
  private _generator: SeededRandomNumberGenerator;
  private _participants: IItem[];
  private _participantsWeight: number;
  private _participantsTickets = new Map<number, IItem>();
  private _participantsPositions = new Map<number, IItem>();
  private _participantsAssigned = new Set<string>();
  private _winningNumbers: number[] = [];

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

  get winningNumbers() {
    return this._winningNumbers.map((number, index) => ({ index, number }));
  }

  assignTickets() {
    let lastTicketNumber = 0;
    for (const participant of this._participants) {
      for (
        let offsetTicket = 0;
        offsetTicket < participant.weight;
        offsetTicket++
      ) {
        const nextTicketNumber = lastTicketNumber + offsetTicket;
        this._participantsTickets.set(nextTicketNumber, participant);
        participant.tickets.push(nextTicketNumber);
      }
      lastTicketNumber += participant.weight;
    }

    // Tickets Check

    const ticketsSet = new Set(this._participantsTickets.keys());

    if (ticketsSet.size !== this._participantsWeight) {
      throw new Error(
        `Inconsistency Error: Ticket generation check fail (${ticketsSet.size}, ${this._participantsWeight})`
      );
    }
  }

  assignNextPosition() {
    const nextPosition = this._participantsAssigned.size;

    debug(`Assigning position ${nextPosition}`);

    while (nextPosition === this._participantsAssigned.size) {
      const nextPositionWinner = this._generator.generateRandomIntInRange(
        this._participantsWeight
      );

      this._winningNumbers.push(nextPositionWinner);

      const nextPositionWinnerParticipant =
        this._participantsTickets.get(nextPositionWinner);

      if (!nextPositionWinnerParticipant) {
        throw new Error(
          `Inconsistency Error: Winner participant not found by ticket No. ${nextPositionWinner}`
        );
      }

      if (this._participantsAssigned.has(nextPositionWinnerParticipant.id)) {
        debug(
          `Participant ${nextPositionWinnerParticipant.id.slice(
            0,
            20
          )} already has a position, skipping round`
        );
        continue;
      }

      console.log(
        `Assigning participant ${nextPositionWinnerParticipant.id.slice(
          0,
          20
        )} => pos#${nextPosition} => weight#${
          nextPositionWinnerParticipant.weight
        } `
      );

      this._participantsPositions.set(
        nextPosition,
        nextPositionWinnerParticipant
      );
      this._participantsAssigned.add(nextPositionWinnerParticipant.id);
      nextPositionWinnerParticipant.winningNumber = nextPositionWinner;
    }
  }

  assignAllPositions() {
    while (this._participantsAssigned.size < this._participants.length) {
      this.assignNextPosition();
    }
    console.log(`Total weight: ${this.participantsWeight}`);
    console.log(`Total winning numbers: ${this._winningNumbers.length}`);
  }
}

export { SeededRandomWeightedSorter };
