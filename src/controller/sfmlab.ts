import got, { Options } from 'got';
import cheerio from 'cheerio';
import tough from 'tough-cookie';
import FormData from 'form-data';
import { format, getUnixTime, isValid, parse, parseISO } from 'date-fns';
import { CookieJar } from 'tough-cookie';
import { SFMLabModel } from '../entity/sfmlab_model';
import logger from '../logger';

export const sfmlabCookieJar = new tough.CookieJar();

export const sfmlabGotInstance = got.extend({
  prefixUrl: 'https://sfmlab.com',
  responseType: 'text'
});

export const smutbaseGotInstance = got.extend({
  prefixUrl: 'https://smutba.se',
  responseType: 'text'
});

export const open3dlabGotInstance = got.extend({
  prefixUrl: 'https://open3dlab.com',
  responseType: 'text'
});

export async function SFMLabAuthenticate(): Promise<void | Error> {
  try {
    if (!process.env.SFMLAB_LOGIN || !process.env.SFMLAB_PASSWORD) {
      throw Error('sfmlab credentials not set');
    }

    const loginPage = await sfmlabGotInstance('accounts/login');
    const formBody = cheerio.load(loginPage.body);

    const middlewareToken = formBody('form#signup_form input[name="csrfmiddlewaretoken"]').val();

    if (!middlewareToken) {
      throw Error('sfmlab token not found');
    }

    const loginPageCookies = loginPage.headers['set-cookie'];
    if (!loginPageCookies) {
      throw Error('set-cookie headers not sent');
    }
    const loginPageParsedCookies = loginPageCookies.map((v) => tough.parse(v)).filter((v) => v !== undefined);
    const csrftoken = loginPageParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'csrftoken');

    if (!csrftoken) {
      throw Error('csrftoken not found');
    }

    sfmlabCookieJar.setCookieSync(csrftoken, 'https://sfmlab.com');

    const form = new FormData();
    form.append('login', process.env.SFMLAB_LOGIN);
    form.append('password', process.env.SFMLAB_PASSWORD);
    form.append('remember', 'on');

    const authResponse = await sfmlabGotInstance.post('accounts/login/?next=/', {
      headers: {
        'X-CSRFToken': middlewareToken
      },
      body: form,
      followRedirect: false,
      cookieJar: sfmlabCookieJar
    });

    const authResponseCookies = authResponse.headers['set-cookie'];
    if (!authResponseCookies) {
      throw Error('set-cookie headers not sent');
    }
    const authResponseParsedCookies = authResponseCookies.map((v) => tough.parse(v)).filter((v) => v !== undefined);

    const session = authResponseParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'sessionid');
    const messages = authResponseParsedCookies.find((cookie) => cookie !== undefined && cookie.key === 'messages');

    if (!session || !messages) {
      throw Error('failed authentication');
    }

    sfmlabCookieJar.setCookieSync(session, 'https://sfmlab.com');
    sfmlabCookieJar.setCookieSync(messages, 'https://sfmlab.com');

    logger.info(`Authenticated on https://sfmlab.com as ${process.env.SFMLAB_LOGIN}`);
    return Promise.resolve();
  } catch (err: any) {
    logger.error(err.response);
    return Promise.reject(err);
  }
}

export async function getProjectsList(page: number, type = 'sfmlab'): Promise<any> {
  try {
    let instance = sfmlabGotInstance;
    switch (type) {
    case 'sfmlab': {
      instance = sfmlabGotInstance;
      break;
    }
    case 'smutbase': {
      instance = smutbaseGotInstance;
      break;
    }
    case 'open3dlab': {
      instance = open3dlabGotInstance;
      break;
    }
    }

    const offset = (page - 1) * 24;

    const response = await instance('api/projects/list/', {
      searchParams: {
        format: 'json',
        limit: 24,
        offset,
        order_by: '-last_file_date',
        adult_content: 'unknown',
        furry_content: 'unknown'
      },
      responseType: 'json'
    });

    return Promise.resolve(response.body);
  } catch (err: any) {
    logger.error(err.response);
    return Promise.reject(err);
  }
}

export async function sfmlabRequest(url: string, params: Options): Promise<any> {
  const siteCookies = await sfmlabCookieJar.getCookies('https://sfmlab.com');
  const sessionCookie = siteCookies.find((cookie) => cookie.key === 'sessionid');
  if (sessionCookie) {
    const currentDate = getUnixTime(new Date());
    const expiresDate = getUnixTime(new Date(sessionCookie.expires));

    const remainingDays = (expiresDate - currentDate) / 60 / 60 / 24;

    if (remainingDays <= 1) {
      await sfmlabCookieJar.removeAllCookies();
      await SFMLabAuthenticate();
    }
  }

  return sfmlabGotInstance(url, params);
}


export async function parseIndexPage(data: SFMLabV2SimpleModel[], type = 'sfmlab'): Promise<any> {
  try {
    let models: SFMLabModel[] = [];

    data.map((model) => {
      const createdAt = parseISO(model.published_date);
      const updatedAt = parseISO(model.modified);

      models.push({
        id: model.pk,
        title: model.title,
        author: model.author.profile_name || model.author.username,
        thumbnail: model.item_thumb,
        extension: '.sfm',
        description: model.description,
        mature_content: model.adult_content,
        created_at: Number(format(createdAt, 'T')),
        updated_at: Number(format(updatedAt, 'T')),
        images: [],
        links: [],
        tags: [],
        commentaries: [],
        file_size: ''
      });
    });

    models = await Promise.all(models.map(async(model) => {
      try {
        const response = await parseModelPage(model, type);
        return response as SFMLabModel;
      } catch (error) {
        return model;
      }
    }));

    return models;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function parseModelPage(model: SFMLabModel, type = 'sfmlab'): Promise<SFMLabModel | Error> {
  try {
    let root;
    if (type === 'sfmlab') {
      root = await sfmlabRequest(`project/${model.id}`, {
        cookieJar: sfmlabCookieJar
      });
    }

    if (type === 'smutbase') {
      root = await smutbaseGotInstance(`project/${model.id}`);
    }

    if (type === 'open3dlab') {
      root = await open3dlabGotInstance(`project/${model.id}`);
    }

    const parser = cheerio.load(root.body);

    const fileSize = parser('.content-container .main-upload table tbody tr:first-child td:last-child').text();
    const domImages = parser('.content-container .main-upload .text-center a picture.project-detail-image-main img');

    const category = parser('.content-container .side-upload .panel__footer dl:nth-child(5) dd').text();
    const tagsBlock = parser('.taglist .tag a');

    const images: string[] = [];
    const downloadLinks = await getDownloadLinks(parser, sfmlabRequest, sfmlabCookieJar);
    const commentaries = await parseComments(model, type);

    const tags: string[] = [];

    domImages.each((idx: number, element: cheerio.Element) => {
      images.push((element as any).attribs['src'] ?? '');
    });

    tagsBlock.each((idx: number, element: cheerio.Element) => {
      const title = (element as any).children[0].data.split('(')[0].trim();
      tags.push(title);
    });

    if (domImages.length === 0) {
      const thubmnail = parser('.content-container .side-upload .panel .panel__body img')?.attr('src') ?? '';
      images.push(thubmnail);
    }

    let extension = '.blend';

    if (category.toLowerCase().includes('blender')) {
      extension = '.blend';
    }

    if (category.toLowerCase().includes('3ds max')) {
      extension = '.max';
    }

    if (category.toLowerCase().includes('cinema 4d')) {
      extension = '.c4d';
    }

    if (category.toLowerCase().includes('maya')) {
      extension = '.ma';
    }

    if (category.toLowerCase().includes('fbx')) {
      extension = '.fbx';
    }

    if (category.toLowerCase().includes('xps')) {
      extension = '.xps';
    }

    const updatedModel: SFMLabModel = {
      ...model,
      images: JSON.stringify(images),
      extension: type !== 'sfmlab' ? extension : '.sfm',
      file_size: fileSize,
      links: JSON.stringify(downloadLinks as ModelLink[]),
      tags: JSON.stringify(tags),
      commentaries: JSON.stringify(commentaries)
    };

    return updatedModel;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function getDownloadLinks(parser: cheerio.Root, gotInstance: any, cookieJar?: CookieJar): Promise<ModelLink[] | Error> {
  const linksArray: ModelLink[] = [];

  const linkInfo = parser('.content-container .main-upload table tbody tr td[data-file-id]');
  const links = parser('.content-container .main-upload table tbody tr td[colspan="9"] ul.download-set li.download-container:first-child a');

  try {
    for (let i = 0; i < links.length; i++) {
      const linkRow = cheerio.load(linkInfo[i].parent);
      const link: string = (links.get()[i].attribs['href']).substr(1);
      const downloadPage = await gotInstance(link, {
        cookieJar
      });
      const dom = cheerio.load(downloadPage.body);

      const downloadLink = dom('.content-container .main-upload .project-description-div p:first-child a');

      const title = linkRow('td:first-child strong').text();
      const fileSize = linkRow('td:last-child').text() || '';

      if (downloadLink !== null) {
        linksArray.push({
          url: downloadLink.attr('href') ?? '',
          title,
          file_size: fileSize
        });
      }
    }
    return linksArray;
  } catch (err) {
    console.error(err);
    return new Error(String(err));
  }
}

function parseDate(timestamp: string): string {
  let ts = timestamp;
  let parsedDate = null;

  if (ts.includes('noon')) {
    ts = ts.replace('noon', '12:00 a.m.');
  }

  if (ts.includes('posted on')) {
    ts = ts.replace('posted on', '').trim();
  }

  // SFMLab is wrecked up timestamps
  parsedDate = parse(ts, 'LLLL d, yyyy, h:mm aaaa', new Date('February 15, 2021 19:23:00'));

  if (!isValid(parsedDate)) {
    parsedDate = parse(ts, 'LLLL d, yyyy, h aaaa', new Date('February 15, 2021 19:23:00'));
  }

  if (!isValid(parsedDate)) {
    parsedDate = parse(ts, 'LLL. d, yyyy, h:mm aaaa', new Date('February 15, 2021 19:23:00'));
  }

  if (!isValid(parsedDate)) {
    parsedDate = parse(ts, 'LLL. d, yyyy, h aaaa', new Date('February 15, 2021 19:23:00'));
  }

  if (!isValid(parsedDate)) {
    parsedDate = new Date(0);
  }

  const date = format(parsedDate, 'T');

  return date;
}

async function parseComments(model: SFMLabModel, type = 'sfmlab'): Promise<Comment[]|Error> {
  try {
    let instance = sfmlabGotInstance;
    switch (type) {
    case 'sfmlab': {
      instance = sfmlabGotInstance;
      break;
    }
    case 'smutbase': {
      instance = smutbaseGotInstance;
      break;
    }
    case 'open3dlab': {
      instance = open3dlabGotInstance;
      break;
    }
    }

    const comments: Comment[] = [];

    const response = await instance<any>(`comments/api/projectrepo-project/${model.id}/`, {
      searchParams: {
        format: 'json',
        limit: 1000,
        offset: 0,
        order_by: '-submit_date'
      },
      responseType: 'json'
    });

    response.body.results.map((result: any) => {
      comments.push({
        name: result.user_name,
        avatar: `https://${result.user_avatar}`,
        message: result.comment,
        date: Number(parseDate(result.submit_date))
      });
    });

    return comments;
  } catch (err) {
    logger.error(err.response);
    return Promise.reject(err);
  }
}
