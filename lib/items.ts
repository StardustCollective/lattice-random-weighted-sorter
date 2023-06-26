import fs from 'fs';

import { isArrayOf } from '@/utils/arrays.js';

type IItem = {
  id: string;
  weight: number;
};

const isItem = (value: any): value is IItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'string' &&
  typeof value.weight === 'number';

const readAndParseItemsJSON = (dataEncoded: string) => {
  try {
    const dataDecoded = JSON.parse(dataEncoded);

    if (!isArrayOf(dataDecoded, isItem)) {
      throw new Error('Bad items, does not follow IItem schema');
    }

    return dataDecoded;
  } catch (e) {
    throw new Error(`Error reading items JSON, ${String(e)}`);
  }
};

const readAndParseItemsFile = async (filePath: string) => {
  const fileContent = await fs.promises.readFile(filePath, {
    encoding: 'utf-8'
  });

  return readAndParseItemsJSON(fileContent);
};

export { IItem, isItem, readAndParseItemsJSON, readAndParseItemsFile };
