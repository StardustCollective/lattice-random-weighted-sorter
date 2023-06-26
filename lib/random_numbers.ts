import crypto from 'crypto';

import { SEED_SIZE_IN_BITS } from '@/consts/seed.js';

const assertValidSeed = (encodedSeed: string) => {
  // Check if the string starts with '0x'
  if (!encodedSeed.startsWith('0x')) {
    throw new Error('Bad seed: must start with "0x"');
  }

  // Remove '0x' prefix and whitespace
  encodedSeed = encodedSeed.slice(2).trim();

  // Validate the remaining characters are valid hexadecimal digits
  if (!/^[0-9a-fA-F]+$/.test(encodedSeed)) {
    throw new Error('Bad seed: contains non-hex characters');
  }

  // Check if the number of bytes matches the length of the hex string
  if (encodedSeed.length / 2 !== SEED_SIZE_IN_BITS / 8) {
    throw new Error(`Bad seed: expected ${SEED_SIZE_IN_BITS} bits`);
  }
};

const isValidBigIntProspectForRange = (prospect: bigint, range: number) => {
  const maxValidProspect = BigInt(2) ** BigInt(SEED_SIZE_IN_BITS) - BigInt(1);
  return prospect <= maxValidProspect - (maxValidProspect % BigInt(range));
};

class SeededRandomNumberGenerator {
  private _seed: bigint;
  private _state: bigint;

  constructor(seedEncoded: string, state: number) {
    assertValidSeed(seedEncoded);

    this._seed = BigInt(seedEncoded);
    this._state = BigInt(state);
  }

  get seed() {
    return '0x' + this._seed.toString(16);
  }

  get state() {
    return Number(this._state);
  }

  nextStateProspect() {
    this._state++;
    const hasher = crypto.createHash('sha512');
    hasher.update(Buffer.from((this._seed ^ this._state).toString(16), 'hex'));
    const result = '0x' + hasher.digest('hex');
    assertValidSeed(result);
    return BigInt(result);
  }

  generateRandomIntInRange(rangeMaxExclusive: number, rangeMinInclusive = 0) {
    if (rangeMinInclusive > rangeMaxExclusive) {
      throw new Error('Bad range: min > max');
    }

    if (rangeMaxExclusive < 0) {
      throw new Error('Bad range: min and max must be positive');
    }

    const range = rangeMaxExclusive - rangeMinInclusive;

    if (range === 0) {
      throw new Error(
        'Bad range: min and max must define a range greater than 0'
      );
    }

    if (range > Number.MAX_SAFE_INTEGER) {
      throw new Error(
        'Bad range: min and max must define a range lower than Number.MAX_SAFE_INTEGER'
      );
    }

    let prospect: bigint;
    do {
      prospect = this.nextStateProspect();
    } while (!isValidBigIntProspectForRange(prospect, range));

    return Number(BigInt(rangeMinInclusive) + (prospect % BigInt(range)));
  }
}

export { SeededRandomNumberGenerator };
