/**
 * Usage:
 * npm run script:{STAGE} ./scripts/launchpad/project-wallet-tracker.ts
 *
 * Options:
 * -d, --dry-run                 Dry Run
 * -p, --project <project-slug>  Project Slug
 * -h, --help                    display help for command
 */

import crypto from 'crypto';

import { Command } from 'commander';
import boxen from 'boxen';

import { SEED_SIZE_IN_BITS } from '@/consts/index.js';

const generateRandomBitString = async (): Promise<void> => {
  console.log(
    boxen(`Generating ${SEED_SIZE_IN_BITS} Bit String`, {
      padding: 1,
      borderStyle: 'double'
    })
  );

  const result = crypto.randomBytes(SEED_SIZE_IN_BITS / 8);

  console.log(`Random ${SEED_SIZE_IN_BITS} Bit String =>`);
  console.log('0x' + result.toString('hex'));
};

const program = new Command();
program.action(generateRandomBitString);

program.parseAsync();
