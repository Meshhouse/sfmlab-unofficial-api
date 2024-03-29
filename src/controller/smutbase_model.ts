import { SmutbaseModel } from '../entity/smutbase_model';
import {
  getProjectsList,
  parseIndexPage
} from './sfmlab';

import type { Connection as ORMConnection, FindManyOptions, FindConditions } from 'typeorm';
import { Like } from 'typeorm';
import logger from '../logger';
import async from 'async';
import { URL } from 'url';
import { createThumbnail } from '../functions/image';

export async function getModels(orm: ORMConnection, params: SFMLabGetModelsQuery): Promise<SFMLabResponse | Error> {
  const page: number = Number(params?.page) || 1;
  const limit: number = Number(params?.limit) || 50;
  const offset = (page - 1) * limit;
  const search: string = params?.search ? params.search.toLowerCase() : '';

  const findParams: FindManyOptions<SmutbaseModel> = {
    select: [ 'id', 'title', 'author', 'thumbnail', 'extension', 'mature_content', 'created_at', 'updated_at'],
    skip: offset,
    take: limit
  };
  let where: FindConditions<SmutbaseModel> | FindConditions<SmutbaseModel>[] = {};

  if (search) {
    where = [
      { title: Like(`%${search}%`) },
      { description: Like(`%${search}%`) },
      { tags: Like(`%${search}%`) }
    ];
  }

  findParams.where = !Array.isArray(where) ? [where] : where;

  try {
    const data = await orm
      .getRepository(SmutbaseModel)
      .findAndCount(findParams);

    const totalPages = Math.ceil(data[1] / limit);

    const models: SFMLabSimpleModel[] = data[0];

    return {
      models,
      pagination: {
        page,
        totalPages,
        totalItems: data[1]
      }
    };
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getSingleModel(orm: ORMConnection, id: number): Promise<SmutbaseModel | Error> {
  try {
    const model = await orm
      .getRepository(SmutbaseModel)
      .findOne({ id });

    if (model) {
      let imagesThumbs = JSON.parse(model.images as string);
      imagesThumbs = imagesThumbs.map((image: string) => {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        return `${process.env.DOMAIN_URL}/thumbnails/smutbase/${model.id}/${filename}.webp`;
      });


      return {
        ...model,
        images: JSON.parse(model.images as string),
        image_thumbs: imagesThumbs,
        links: JSON.parse(model.links as string),
        tags: JSON.parse(model.tags as string),
        commentaries: JSON.parse(model.commentaries as string)
      };
    } else {
      return Promise.reject('not found');
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

async function batchInsertModels(orm: ORMConnection, models: SmutbaseModel[]): Promise<SmutbaseModel[] | Error> {
  try {
    const result = await orm
      .getRepository(SmutbaseModel)
      .save(models);

    return result;
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function runParser(orm: ORMConnection, params?: SFMLabParserQuery): Promise<SmutbaseModel[] | Error> {
  try {
    const indexPage = await getProjectsList(1, 'smutbase');
    const lastPage = Math.ceil(indexPage.count / 24);

    let models: SmutbaseModel[] = [];

    if (params?.full_rescan === true) {
      logger.info('Smutbase parser - parsing full site');

      const pagesArray = Array(lastPage).keys();
      let idx = 0;
      let threadLimit = process.env.THREADS ? Number(process.env.THREADS) : 4;
      threadLimit = Number.isNaN(threadLimit) ? 4 : threadLimit;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await async.eachLimit(pagesArray, threadLimit, async(page) => {
        const searchPage = Number(page) + 1;

        const response = await getProjectsList(searchPage, 'smutbase');
        const insertedModels = await parseIndexPage(response.results, 'smutbase');

        logger.info(`Smutbase parser - parsed page ${searchPage}/${lastPage}`);
        models = models.concat(insertedModels);

        idx++;
        process.title = `Smutbase parser ${idx}/${lastPage}`;
      });
    } else {
      logger.info('Smutbase parser - parsing first page only');
      models = await parseIndexPage(indexPage.results, 'smutbase');
    }

    const response = await batchInsertModels(orm, models);
    logger.info(`Smutbase parser - updated ${(response as SmutbaseModel[]).length} entries`);

    return response;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

export async function createThumbnails(orm: ORMConnection): Promise<void | Error> {
  try {
    const models = await orm
      .getRepository(SmutbaseModel)
      .find();

    for (const model of models) {
      const images = JSON.parse(model.images as string);
      for (const image of images) {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        await createThumbnail('smutbase', model.id, image, `${filename}.webp`);
      }
    }

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getFeed(orm: ORMConnection): Promise<any[] | Error> {
  try {
    const data = await orm
      .getRepository(SmutbaseModel)
      .find();

    const models = data.map((model) => {
      let format = '';
      if (model.extension === '.sfm') {
        format = 'source filmmaker';
      }
      if (model.extension === '.max') {
        format = '3ds max';
      }
      if (model.extension === '.ma') {
        format = 'maya';
      }
      if (model.extension === '.fbx') {
        format = 'fbx';
      }
      if (model.extension === '.c4d') {
        format = 'cinema 4d';
      }
      if (model.extension === '.blend') {
        format = 'blender';
      }
      if (model.extension === '.xps') {
        format = 'xps';
      }


      return {
        id: `SMUTBASE-${model.id}`,
        title: model.title,
        thumbnail: model.thumbnail,
        description: model.description,
        formats: [format],
        tags: typeof model.tags === 'string' ? JSON.parse(model.tags) : model.tags,
        url: `https://smutba.se/projects/${model.id}`,
        provider: 'smutbase',
        mature_content: model.mature_content
      };
    });

    return models;
  } catch (err) {
    return Promise.reject(err);
  }
}
