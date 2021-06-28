import fastify from 'fastify';
import fastifyTypeORM from 'fastify-typeorm-plugin';
import dotenv from 'dotenv';

import * as Tasks from './tasks';
import { SFMLabAuthenticate } from './controller/sfmlab';

dotenv.config();

const args = process.argv;

const site = args.find((arg) => arg.startsWith('--'));

if (!site) {
  process.exit(1);
}

export const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

void (async(): Promise<void> => {
  if (site === '--sfmlab') {
    await SFMLabAuthenticate();
  }
  void server.register(fastifyTypeORM, {
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
    if (site === '--sfmlab') {
      await Tasks.runSFMLabParser();
    }
    if (site === '--smutbase') {
      await Tasks.runSmutbaseParser();
    }
    if (site === '--open3dlab') {
      await Tasks.runOpen3DLabParser();
    }
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
})();

