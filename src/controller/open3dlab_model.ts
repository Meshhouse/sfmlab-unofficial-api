import { Open3DLabModel } from '../entity/open3dlab_model';
import {
  sfmlabCookieJar,
  open3dlabGotInstance,
  parseIndexPage,
  calculateTotalPages
} from './sfmlab';
import cheerio from 'cheerio';
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

  const findParams: FindManyOptions<Open3DLabModel> = {
    select: [ 'id', 'title', 'author', 'thumbnail', 'extension', 'mature_content', 'created_at', 'updated_at'],
    skip: offset,
    take: limit
  };
  let where: FindConditions<Open3DLabModel> | FindConditions<Open3DLabModel>[] = {};

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
      .getRepository(Open3DLabModel)
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

export async function getSingleModel(orm: ORMConnection, id: number): Promise<Open3DLabModel | Error> {
  try {
    const model = await orm
      .getRepository(Open3DLabModel)
      .findOne({ id });

    if (model) {
      let imagesThumbs = JSON.parse(model.images as string);
      imagesThumbs = imagesThumbs.map((image: string) => {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        return `${process.env.DOMAIN_URL}/thumbnails/open3dlab/${model.id}/${filename}.webp`;
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

async function batchInsertModels(orm: ORMConnection, models: Open3DLabModel[]): Promise<Open3DLabModel[] | Error> {
  try {
    const result = await orm
      .getRepository(Open3DLabModel)
      .save(models);

    return result;
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function runParser(orm: ORMConnection, params?: SFMLabParserQuery): Promise<Open3DLabModel[] | Error> {
  try {
    const root = await open3dlabGotInstance('', {
      searchParams: {
        order_by: '-created'
      },
      cookieJar: sfmlabCookieJar
    });
    const parser = cheerio.load(root.body);
    const paginator = parser('.content-container .pagination');

    const lastPage = calculateTotalPages(paginator);

    let models: Open3DLabModel[] = [];

    if (params?.full_rescan === true) {
      logger.info('Open3DLab parser - parsing full site');

      const pagesArray = Array(lastPage).keys();
      let idx = 0;
      let threadLimit = process.env.THREADS ? Number(process.env.THREADS) : 4;
      threadLimit = Number.isNaN(threadLimit) ? 4 : threadLimit;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await async.eachLimit(pagesArray, threadLimit, async(page) => {
        const searchPage = Number(page) + 1;

        const response = await open3dlabGotInstance('', {
          searchParams: {
            order_by: '-created',
            page: searchPage
          },
          cookieJar: sfmlabCookieJar
        });

        const parser = cheerio.load(response.body);
        const insertedModels = await parseIndexPage(parser, 'open3dlab');
        logger.info(`Open3DLab parser - parsed page ${searchPage}/${lastPage}`);
        models = models.concat(insertedModels);

        idx++;
        process.title = `Open3DLab parser ${idx}/${lastPage}`;
      });
    } else {
      logger.info('Open3DLab parser - parsing first page only');
      models = await parseIndexPage(parser, 'open3dlab');
    }

    const response = await batchInsertModels(orm, models);
    logger.info(`Open3DLab parser - updated ${(response as Open3DLabModel[]).length} entries`);

    return response;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

export async function createThumbnails(orm: ORMConnection): Promise<void | Error> {
  try {
    const models = await orm
      .getRepository(Open3DLabModel)
      .find();

    for (const model of models) {
      const images = JSON.parse(model.images as string);
      for (const image of images) {
        const original = new URL(image).pathname;
        const file = original.substring(original.lastIndexOf('/') + 1);
        const filename = file.substring(0, file.lastIndexOf('.'));

        await createThumbnail('open3dlab', model.id, image, `${filename}.webp`);
      }
    }

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
