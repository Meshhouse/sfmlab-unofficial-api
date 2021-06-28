import { SmutbaseModel } from '../entity/smutbase_model';
import {
  sfmlabCookieJar,
  smutbaseGotInstance,
  parseIndexPage,
  calculateTotalPages
} from './sfmlab';
import cheerio from 'cheerio';
import type { Connection as ORMConnection, FindManyOptions, FindConditions } from 'typeorm';
import { Like } from 'typeorm';
import logger from '../logger';
import async from 'async';

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
      return {
        ...model,
        images: JSON.parse(model.images as string),
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
    const root = await smutbaseGotInstance('', {
      searchParams: {
        order_by: '-created'
      },
      cookieJar: sfmlabCookieJar
    });
    const parser = cheerio.load(root.body);
    const paginator = parser('.content-container .pagination');

    const lastPage = calculateTotalPages(paginator);

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

        const response = await smutbaseGotInstance('', {
          searchParams: {
            order_by: '-created',
            page: searchPage
          },
          cookieJar: sfmlabCookieJar
        });

        const parser = cheerio.load(response.body);
        const insertedModels = await parseIndexPage(parser, 'smutbase');
        logger.info(`Smutbase parser - parsed page ${searchPage}/${lastPage}`);
        models = models.concat(insertedModels);

        idx++;
        process.title = `Smutbase parser ${idx}/${lastPage}`;
      });
    } else {
      logger.info('Smutbase parser - parsing first page only');
      models = await parseIndexPage(parser, 'smutbase');
    }

    const response = await batchInsertModels(orm, models);
    logger.info(`Smutbase parser - updated ${(response as SmutbaseModel[]).length} entries`);

    return response;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}