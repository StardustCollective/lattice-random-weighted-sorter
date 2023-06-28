import fs from 'fs';

type IItem = {
  id: string;
  weight: number;
  source: any;
  tickets: number[];
  winningNumber: number | null;
};

const isItem = (value: any): value is IItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'string' &&
  typeof value.weight === 'number' &&
  'source' in value;

const readAndParseItemsJSON = (
  dataEncoded: string,
  keys: { idk: string; weightk: string }
) => {
  try {
    const items: IItem[] = [];
    const dataDecoded = JSON.parse(dataEncoded);

    for (const entry of dataDecoded) {
      const item: IItem = {
        id: entry[keys.idk],
        weight: entry[keys.weightk],
        source: entry,
        tickets: [],
        winningNumber: null
      };

      if (!isItem(item)) {
        throw new Error(
          `Bad items, does not follow IItem schema =>\n${JSON.stringify(
            entry,
            null,
            2
          )}`
        );
      }

      items.push(item);
    }

    return items;
  } catch (e) {
    throw new Error(`Error reading items JSON, ${String(e)}`);
  }
};

const readAndParseItemsFile = async (
  filePath: string,
  keys: { idk: string; weightk: string }
) => {
  const fileContent = await fs.promises.readFile(filePath, {
    encoding: 'utf-8'
  });

  return readAndParseItemsJSON(fileContent, keys);
};

export { IItem, isItem, readAndParseItemsJSON, readAndParseItemsFile };
