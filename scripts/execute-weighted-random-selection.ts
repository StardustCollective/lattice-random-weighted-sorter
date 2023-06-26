/**
 * Usage:
 * npm run script:{STAGE} ./scripts/launchpad/project-wallet-tracker.ts
 *
 * Options:
 * -d, --dry-run                 Dry Run
 * -p, --project <project-slug>  Project Slug
 * -h, --help                    display help for command
 */

import { Command } from 'commander';
import boxen from 'boxen';

import {
  SeededRandomWeightedSorter,
  readAndParseItemsFile
} from '@/lib/index.js';

const executeWeightedRandomSelection = async (options: {
  seed: string;
  itemsFile: string;
}): Promise<void> => {
  console.log(
    boxen('Executing Weighted Random Selection', {
      padding: 1,
      borderStyle: 'double'
    })
  );

  const items = await readAndParseItemsFile(options.itemsFile);

  const sorter = new SeededRandomWeightedSorter(options.seed, 0, items);

  sorter.assignNextPosition();
  sorter.assignNextPosition();
  sorter.assignNextPosition();
  sorter.assignNextPosition();
};

const program = new Command();
program.requiredOption('-s, --seed <seed>', '512 Bit Seed (HEX)');
program.requiredOption('-i, --items-file <items-file>', 'Items file (JSON)');
program.action(executeWeightedRandomSelection);

program.parseAsync();
