import { server } from './server';
import {
  FastifyReply,
  FastifyRequest,
  RouteOptions,
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault
} from 'fastify';

import * as SFMLabModelController from './controller/sfmlab_model';
import * as SmutbaseModelController from './controller/smutbase_model';
import * as Open3DLabModelController from './controller/open3dlab_model';

/**
 * /sfmlab/models
 */
export const SFMLabGetModels: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Querystring: SFMLabGetModelsQuery},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/sfmlab/models',
  handler: async(request, reply): Promise<void> => {
    try {
      const fetch = await SFMLabModelController.getModels(server.orm, request.query);

      void reply.send(fetch);
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
/**
 * /sfmlab/models/:id
 */
export const SFMLabGetSingleModel: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Params: SFMLabGetSingleModelParams},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/sfmlab/models/:id',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.params;
      const id: number = Number(params.id) ?? 0;

      const fetch = await SFMLabModelController.getSingleModel(server.orm, id);

      void reply.send(fetch);
    } catch (err) {
      if (err === 'not found') {
        void reply.send(server.httpErrors.notFound('model not found'));
      } else {
        void reply.send(server.httpErrors.badRequest(err));
      }
    }
  }
};
/**
 * /sfmlab/feed
 */
export const SFMLabExportFeed: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Body: SFMLabFeedParams},
  ContextConfigDefault
> = {
  method: 'POST',
  url: '/sfmlab/feed',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.body;

      const user = process.env.FEED_USER;
      const password = process.env.FEED_PASSWORD;

      if (params?.user !== user || params?.password !== password) {
        void reply.send(server.httpErrors.unauthorized('Invalid credentials'));
      } else {
        const fetch = await SFMLabModelController.getFeed(server.orm);

        void reply.send(fetch);
      }
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
/**
 * /smutbase/models
 */
export const SmutbaseGetModels: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Querystring: SFMLabGetModelsQuery},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/smutbase/models',
  handler: async(request, reply): Promise<void> => {
    try {
      const fetch = await SmutbaseModelController.getModels(server.orm, request.query);

      void reply.send(fetch);
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
/**
 * /smutbase/models/:id
 */
export const SmutbaseGetSingleModel: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Params: SFMLabGetSingleModelParams},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/smutbase/models/:id',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.params;
      const id: number = Number(params.id) ?? 0;

      const fetch = await SmutbaseModelController.getSingleModel(server.orm, id);

      void reply.send(fetch);
    } catch (err) {
      if (err === 'not found') {
        void reply.send(server.httpErrors.notFound('model not found'));
      } else {
        void reply.send(server.httpErrors.badRequest(err));
      }
    }
  }
};
/**
 * /smutbase/feed
 */
export const SmutbaseExportFeed: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Body: SFMLabFeedParams},
  ContextConfigDefault
> = {
  method: 'POST',
  url: '/smutbase/feed',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.body;

      const user = process.env.FEED_USER;
      const password = process.env.FEED_PASSWORD;

      if (params?.user !== user || params?.password !== password) {
        void reply.send(server.httpErrors.unauthorized('Invalid credentials'));
      } else {
        const fetch = await SmutbaseModelController.getFeed(server.orm);

        void reply.send(fetch);
      }
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
/**
 * /smutbase/models
 */
export const Open3DLabGetModels: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Querystring: SFMLabGetModelsQuery},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/open3dlab/models',
  handler: async(request, reply): Promise<void> => {
    try {
      const fetch = await Open3DLabModelController.getModels(server.orm, request.query);

      void reply.send(fetch);
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
/**
 * /smutbase/models/:id
 */
export const Open3DLabGetSingleModel: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Params: SFMLabGetSingleModelParams},
  ContextConfigDefault
> = {
  method: 'GET',
  url: '/open3dlab/models/:id',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.params;
      const id: number = Number(params.id) ?? 0;

      const fetch = await Open3DLabModelController.getSingleModel(server.orm, id);

      void reply.send(fetch);
    } catch (err) {
      if (err === 'not found') {
        void reply.send(server.httpErrors.notFound('model not found'));
      } else {
        void reply.send(server.httpErrors.badRequest(err));
      }
    }
  }
};
/**
 * /open3dlab/feed
 */
export const Open3DLabExportFeed: RouteOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {Body: SFMLabFeedParams},
  ContextConfigDefault
> = {
  method: 'POST',
  url: '/open3dlab/feed',
  handler: async(request, reply): Promise<void> => {
    try {
      const params = request.body;

      const user = process.env.FEED_USER;
      const password = process.env.FEED_PASSWORD;

      if (params?.user !== user || params?.password !== password) {
        void reply.send(server.httpErrors.unauthorized('Invalid credentials'));
      } else {
        const fetch = await Open3DLabModelController.getFeed(server.orm);

        void reply.send(fetch);
      }
    } catch (err) {
      void reply.send(server.httpErrors.badRequest(err));
    }
  }
};
