import fs from 'fs';

import * as csv from 'csv';

import { Awaitable } from './awaitable.js';

type ExportFormat = 'json' | 'csv';

type ExportDataStreamFn = (writeFS: fs.WriteStream) => ExportDataStream;

type ExportDataStream = {
  write: (nextDataChunk: Record<any, any>) => Promise<void>;
  end: () => Promise<void>;
};

const ExportDataStreams: Record<ExportFormat, ExportDataStreamFn> = {
  json: (writeFS) => {
    const data: Record<any, any>[] = [];

    return {
      write: async (nextDataChunk) => {
        data.push(nextDataChunk);
      },
      end: async () => {
        writeFS.write(JSON.stringify(data));
        writeFS.end();
      }
    };
  },
  csv: (writeFS) => {
    let stringifier: csv.stringifier.Stringifier | null = null;

    return {
      write: async (nextDataChunk) => {
        if (!stringifier) {
          stringifier = csv.stringify({
            columns: Object.keys(nextDataChunk),
            header: true,
            quoted: true
          });
          stringifier.pipe(writeFS);
        }
        stringifier.write(nextDataChunk);
      },
      end: async () => {
        if (!stringifier) {
          writeFS.end();
          return;
        }

        stringifier.end();
      }
    };
  }
};

const createExportDataStream = (
  basefilename: string,
  formats: ExportFormat[]
): ExportDataStream => {
  const exportDataProcesses: {
    format: ExportFormat;
    writeFS: fs.WriteStream;
    writeFSEnd: Awaitable<void>;
    writeDS: ExportDataStream;
  }[] = [];

  for (const format of formats) {
    const writeFS = fs.createWriteStream(`${basefilename}.${format}`);

    const writeFSEnd = new Awaitable<void>();
    writeFS.on('finish', () => {
      writeFSEnd.resolve();
    });

    exportDataProcesses.push({
      format,
      writeFS,
      writeFSEnd,
      writeDS: ExportDataStreams[format](writeFS)
    });
  }

  return {
    write: async (nextDataChunk: Record<any, any>) => {
      for (const exportDataProcess of exportDataProcesses) {
        if (exportDataProcess.writeFSEnd.status === 'resolved') {
          throw new Error(
            'Export data process for format ' +
              exportDataProcess.format +
              ' has ended already'
          );
        }
        await exportDataProcess.writeDS.write(nextDataChunk);
      }
    },
    end: async () => {
      for (const exportDataProcess of exportDataProcesses) {
        if (exportDataProcess.writeFSEnd.status === 'resolved') {
          throw new Error(
            'Export data process for format ' +
              exportDataProcess.format +
              ' has ended already'
          );
        }
        await exportDataProcess.writeDS.end();
      }

      // Wait for all file handles to close/finish
      await Promise.all(exportDataProcesses.map((edp) => edp.writeFSEnd));
    }
  };
};

const exportData = async (
  data: any[],
  basefilename: string,
  formats: ExportFormat[]
) => {
  const exportDataStream = createExportDataStream(basefilename, formats);

  for (const record of data) {
    await exportDataStream.write(record);
  }

  await exportDataStream.end();
};

export { ExportFormat, ExportDataStream, createExportDataStream, exportData };
