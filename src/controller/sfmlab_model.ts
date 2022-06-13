import { SFMLabModel } from '../entity/sfmlab_model';
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
  const matureContent: 'included' | 'excluded' | 'only' = params?.adult_content || 'included';
  const page: number = Number(params?.page) || 1;
  const limit: number = Number(params?.limit) || 50;
  const offset = (page - 1) * limit;
  const search: string = params?.search ? params.search.toLowerCase() : '';

  const findParams: FindManyOptions<SFMLabModel> = {
    select: [ 'id', 'title', 'author', 'thumbnail', 'extension', 'mature_content', 'created_at', 'updated_at'],
    skip: offset,
    take: limit
  };
  let where: FindConditions<SFMLabModel> | FindConditions<SFMLabModel>[] = {};
  let showMatureContent = false;

  if (matureContent === 'excluded' || matureContent === 'only') {
    const param = matureContent === 'only';
    showMatureContent = param;
    where.mature_content = param;
  }

  if (search) {
    where = [
      { title: Like(`%${search}%`) },
      { description: Like(`%${search}%`) },
      { tags: Like(`%${search}%`) }
    ];
    if ((matureContent === 'excluded' || matureContent === 'only')) {
      where = where.map((query) => {
        return {
          ... query,
          mature_content: showMatureContent
        };
      });
    }
  }

  findParams.where = !Array.isArray(where) ? [where] : where;

  try {
    const data = await orm
      .getRepository(SFMLabModel)
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

export async function getSingleModel(orm: ORMConnection, id: number): Promise<SFMLabModel | Error> {
  try {
    const model = await orm
      .getRepository(SFMLabModel)
      .findOne({ id });

    if (model) {
      let imagesThumbs = JSON.parse(model.images as string);
      imagesThumbs = imagesThumbs.map((image: string) => {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        return `${process.env.DOMAIN_URL}/thumbnails/sfmlab/${model.id}/${filename}.webp`;
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

async function batchInsertModels(orm: ORMConnection, models: SFMLabModel[]): Promise<SFMLabModel[] | Error> {
  try {
    const result = await orm
      .getRepository(SFMLabModel)
      .save(models);

    return result;
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function runParser(orm: ORMConnection, params?: SFMLabParserQuery): Promise<SFMLabModel[] | Error> {
  try {
    const indexPage = await getProjectsList(1, 'sfmlab');
    const lastPage = Math.ceil(indexPage.count / 24);

    let models: SFMLabModel[] = [];

    if (params?.full_rescan === true) {
      logger.info('SFMLab parser - parsing full site');

      const pagesArray = Array(lastPage).keys();
      let idx = 0;
      let threadLimit = process.env.THREADS ? Number(process.env.THREADS) : 4;
      threadLimit = Number.isNaN(threadLimit) ? 4 : threadLimit;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await async.eachLimit(pagesArray, threadLimit, async(page) => {
        const searchPage = Number(page) + 1;

        const response = await getProjectsList(searchPage, 'sfmlab');
        const insertedModels = await parseIndexPage(response.results, 'sfmlab');

        logger.info(`SFMLab parser - parsed page ${searchPage}/${lastPage}`);
        models = models.concat(insertedModels);

        idx++;
        process.title = `SFMLab parser ${idx}/${lastPage}`;
      });
    } else {
      logger.info('SFMLab parser - parsing first page only');
      models = await parseIndexPage(indexPage.results, 'sfmlab');
    }

    const response = await batchInsertModels(orm, models);
    logger.info(`SFMLab parser - updated ${(response as SFMLabModel[]).length} entries`);

    return response;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

export async function createThumbnails(orm: ORMConnection): Promise<void | Error> {
  try {
    const models = await orm
      .getRepository(SFMLabModel)
      .find();

    for (const model of models) {
      const images = JSON.parse(model.images as string);
      for (const image of images) {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        await createThumbnail('sfmlab', model.id, image, `${filename}.webp`);
      }
    }

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
