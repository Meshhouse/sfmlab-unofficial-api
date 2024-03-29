import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyCaching from 'fastify-caching';
import fastifySensible from 'fastify-sensible';
import fastifyStatic from 'fastify-static';
import fastifyTypeORM from 'fastify-typeorm-plugin';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import child_process from 'child_process';

import * as routes from './routes';

dotenv.config();

const port = process.env.PORT || 8000;
const host = process.env.HOST || '0.0.0.0';

export const server = fastify({
  logger: {
    level: 'error',
    prettyPrint: true
  }
});

void ((): void => {

  void server.register(fastifySensible);
  void server.register(fastifyCors, {
    methods: ['GET']
  });
  void server.register(fastifyCaching, {
    privacy: 'private'
  });
  void server.register(fastifyStatic, {
    root: path.normalize(`${__dirname}/../thumbnails/`),
    prefix: '/thumbnails/'
  });
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

  server.route(routes.SFMLabGetModels);
  server.route(routes.SFMLabGetSingleModel);
  server.route(routes.SFMLabExportFeed);
  server.route(routes.SmutbaseGetModels);
  server.route(routes.SmutbaseGetSingleModel);
  server.route(routes.SmutbaseExportFeed);
  server.route(routes.Open3DLabGetModels);
  server.route(routes.Open3DLabGetSingleModel);
  server.route(routes.Open3DLabExportFeed);

  cron.schedule('59 23 * * *', () => {
    void child_process.exec('npm run rescan:sfmlab', ((err, std) => {
      console.error(err);
      console.log(std);
    }));
    void child_process.exec('npm run rescan:smutbase', ((err, std) => {
      console.error(err);
      console.log(std);
    }));
    void child_process.exec('npm run rescan:open3dlab', ((err, std) => {
      console.error(err);
      console.log(std);
    }));
  });

  cron.schedule('* 3 * * *', () => {
    void child_process.exec('npm run thumbnail-create', ((err, std) => {
      console.error(err);
      console.log(std);
    }));
  });

  server.listen(port, host, (err, address) => {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
})();

