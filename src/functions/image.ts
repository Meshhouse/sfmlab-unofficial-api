import path from 'path';
import fs from 'fs/promises';
import { constants } from 'fs';
import got from 'got';
import sharp from 'sharp';
import logger from '../logger';
import { URL } from 'url';

export async function createThumbnail(database: string, id: string | number, url: string, output: string): Promise<void | Error> {
  const dir = path.normalize(`${__dirname}/../../thumbnails/${database}/${id}/`);
  const filePath = path.normalize(`${dir}/${output}`);

  // Check for folder exists
  try {
    await fs.access(dir, constants.F_OK);
  } catch (error) {
    if (process.env.VERBOSE === 'true') {
      logger.info(`Folder ${dir} not exists, creating`);
    }
    await fs.mkdir(dir, { recursive: true });
  }

  // Check for file exists
  try {
    await fs.access(filePath, constants.F_OK);
    if (process.env.VERBOSE === 'true') {
      logger.info(`Thumbnail ${output} (${database}:${id}) already exists`);
    }
    return Promise.resolve();
  } catch (error) {
    if (process.env.VERBOSE === 'true') {
      logger.info(`Thumbnail ${output} (${database}:${id}) not exists, creating`);
    }
  }

  try {
    let imageURL = url;
    const urlParse = new URL(imageURL);

    if (urlParse.hostname.includes('files.sfmlab.com')) {
      imageURL = `${urlParse.origin}${urlParse.pathname}`;
    }

    const file = await got(imageURL, {
      responseType: 'buffer',
      resolveBodyOnly: true
    });

    await sharp(file)
      .resize(256)
      .webp({
        quality: 90,
        smartSubsample: true,
        reductionEffort: 4,
        force: true
      })
      .toFile(filePath);
    logger.info(`Thumbnail ${output} (${database}:${id}) created`);
  } catch (error) {
    logger.error(error as string);
    logger.info(`Original URL: ${url}`);
    logger.info(`Skipping thumbnail ${output} (${database}:${id}) creating`);
    return Promise.resolve();
  }
}
