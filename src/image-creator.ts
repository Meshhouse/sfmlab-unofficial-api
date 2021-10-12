import fastify from 'fastify';
import fastifyTypeORM from 'fastify-typeorm-plugin';
import dotenv from 'dotenv';

import * as Tasks from './tasks';

dotenv.config();

export const server = fastify({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

void (async(): Promise<void> => {
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
    await Tasks.createThumbnails();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
})();

