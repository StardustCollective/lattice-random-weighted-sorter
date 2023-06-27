/**
 * Usage:
 * npm run script:{STAGE} ./scripts/launchpad/project-wallet-tracker.ts
 *
 * Options:
 * -d, --dry-run                 Dry Run
 * -p, --project <project-slug>  Project Slug
 * -h, --help                    display help for command
 */
import fs from 'fs';

import { Command } from 'commander';
import boxen from 'boxen';

import {
  SeededRandomSorter,
  SeededRandomWeightedSorter,
  readAndParseItemsFile
} from '@/lib/index.js';

const executeWeightedRandomSelection = async (options: {
  dryRun: boolean;
  seed: string;
  itemsFile: string;
  idKey: string;
  weightKey: string;
  positionKey: string;
}): Promise<void> => {
  console.log(
    boxen(
      options.dryRun
        ? 'DryRun: Executing Weighted Random Selection'
        : 'Executing Weighted Random Selection',
      {
        padding: 1,
        borderStyle: 'double'
      }
    )
  );

  const items = await readAndParseItemsFile(options.itemsFile, {
    idk: options.idKey,
    weightk: options.weightKey
  });

  console.log('Assigning non-zero weight participants');
  const randomWeightedSorter = new SeededRandomWeightedSorter(
    options.seed,
    0,
    items.filter((item) => item.weight > 0)
  );
  randomWeightedSorter.assignAllPositions();

  console.log('Assigning zero weight participants');
  const randomSorter = new SeededRandomSorter(
    options.seed,
    0,
    items.filter((item) => item.weight === 0)
  );
  randomSorter.assignAllPositions();

  if (options.dryRun) {
    console.log('DryRun: Skipping saving results');
    return;
  }

  console.log('Saving results');

  const data: Record<string, any>[] = [];

  for (const [position, item] of randomWeightedSorter.positions) {
    data.push(Object.assign(item.source, { [options.positionKey]: position }));
  }

  for (const [position, item] of randomSorter.positions) {
    data.push(
      Object.assign(item.source, {
        [options.positionKey]: randomWeightedSorter.positions.size + position
      })
    );
  }

  await fs.promises.writeFile(options.itemsFile, JSON.stringify(data, null, 2));
};

const program = new Command();
program.option('-d, --dry-run', 'Dry run');
program.requiredOption('-s, --seed <seed>', '512 Bit Seed (HEX)');
program.requiredOption('-i, --items-file <items-file>', 'Items file (JSON)');
program.requiredOption(
  '-idk, --id-key <id-key>',
  'Items file => id key to search'
);
program.requiredOption(
  '-weightk, --weight-key <weight-key>',
  'Items file => weight key to search'
);
program.requiredOption(
  '-posk, --position-key <position-key>',
  'Items file => position key to write'
);
program.action(executeWeightedRandomSelection);

program.parseAsync();
