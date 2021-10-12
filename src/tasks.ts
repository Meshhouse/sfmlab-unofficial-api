import * as SFMLabModelController from './controller/sfmlab_model';
import * as SmutbaseModelController from './controller/smutbase_model';
import * as Open3DLabModelController from './controller/open3dlab_model';
import logger from './logger';

import { createConnection } from 'typeorm';
import { performance } from 'perf_hooks';
import { intervalToDuration, formatDuration } from 'date-fns';

export async function runSFMLabParser(): Promise<void | Error> {
  const connection = await createConnection({
    type: 'sqlite',
    database: './database/sfmlab.sql',
    synchronize: true,
    logging: false,
    entities: [
      'dist/entity/**/*.js'
    ],
    migrations: [
      'dist/migration/**/*.js'
    ],
    subscribers: [
      'dist/subscriber/**/*.js'
    ]
  });

  try {
    const rescan = process.env.RESCAN ?? 'first_page';
    process.title = 'SFMLab parser';
    const start = performance.now();
    await SFMLabModelController.runParser(connection, { full_rescan: rescan === 'full' });
    const end = performance.now();

    const duration = intervalToDuration({
      start,
      end
    });
    logger.info('SFMLab parser task completed');
    logger.info(`Parsing takes ${formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] })}`);
    return Promise.resolve();
  } catch (err) {
    logger.error('SFMLab parser task failed');
    logger.error(err as string);
    return Promise.reject(err);
  }
}

export async function runSmutbaseParser(): Promise<void | Error> {
  const connection = await createConnection({
    type: 'sqlite',
    database: './database/sfmlab.sql',
    synchronize: true,
    logging: false,
    entities: [
      'dist/entity/**/*.js'
    ],
    migrations: [
      'dist/migration/**/*.js'
    ],
    subscribers: [
      'dist/subscriber/**/*.js'
    ]
  });

  try {
    const rescan = process.env.RESCAN ?? 'first_page';
    process.title = 'Smutbase parser';
    const start = performance.now();
    await SmutbaseModelController.runParser(connection, { full_rescan: rescan === 'full' });
    const end = performance.now();

    const duration = intervalToDuration({
      start,
      end
    });
    logger.info('Smutbase parser task completed');
    logger.info(`Parsing takes ${formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] })}`);
    return Promise.resolve();
  } catch (err) {
    logger.error('Smutbase parser task failed');
    logger.error(err as string);
    return Promise.reject(err);
  }
}

export async function runOpen3DLabParser(): Promise<void | Error> {
  const connection = await createConnection({
    type: 'sqlite',
    database: './database/sfmlab.sql',
    synchronize: true,
    logging: false,
    entities: [
      'dist/entity/**/*.js'
    ],
    migrations: [
      'dist/migration/**/*.js'
    ],
    subscribers: [
      'dist/subscriber/**/*.js'
    ]
  });

  try {
    const rescan = process.env.RESCAN ?? 'first_page';
    process.title = 'Open3DLab parser';
    const start = performance.now();
    await Open3DLabModelController.runParser(connection, { full_rescan: rescan === 'full' });
    const end = performance.now();

    const duration = intervalToDuration({
      start,
      end
    });
    logger.info('Open3DLab parser task completed');
    logger.info(`Parsing takes ${formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] })}`);
    return Promise.resolve();
  } catch (err) {
    logger.error('Open3DLab parser task failed');
    logger.error(err as string);
    return Promise.reject(err);
  }
}

export async function createThumbnails(): Promise<void | Error> {
  const connection = await createConnection({
    type: 'sqlite',
    database: './database/sfmlab.sql',
    synchronize: true,
    logging: false,
    entities: [
      'dist/entity/**/*.js'
    ],
    migrations: [
      'dist/migration/**/*.js'
    ],
    subscribers: [
      'dist/subscriber/**/*.js'
    ]
  });

  try {
    process.title = 'Thumbnail creation';

    const start = performance.now();
    await SFMLabModelController.createThumbnails(connection);
    await SmutbaseModelController.createThumbnails(connection);
    await Open3DLabModelController.createThumbnails(connection);
    const end = performance.now();

    const duration = intervalToDuration({
      start,
      end
    });
    logger.info('Thumbnail creation task completed');
    logger.info(`Task takes ${formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] })}`);
    return Promise.resolve();
  } catch (err) {
    logger.error('Thumbnail creation task failed');
    logger.error(err as string);
    return Promise.reject(err);
  }
}
