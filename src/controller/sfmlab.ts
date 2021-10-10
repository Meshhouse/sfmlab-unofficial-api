import got, { Options } from 'got';
import cheerio from 'cheerio';
import tough from 'tough-cookie';
import FormData from 'form-data';
import { format, getUnixTime, isValid, parse } from 'date-fns';
import { CookieJar } from 'tough-cookie';
import SanitizeHTML from 'sanitize-html';
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
  } catch (err) {
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


export async function parseIndexPage(parser: cheerio.Root, type = 'sfmlab'): Promise<any> {
  try {
    const body = parser('.content-container .entry-content .entry-list .entry');
    let models: SFMLabModel[] = [];

    body.each((idx: number, element: cheerio.Element) => {
      const body = cheerio.load(element);
      const title = body('.entry__body .entry__title a')?.text() ?? '';
      const link = body('.entry__body .entry__title a')?.attr('href');
      const id = (link?.match(/\d+/) as string[])[0];
      const image = body('.entry__heading a img')?.attr('src') ?? '';

      models.push({
        id: Number(id),
        title,
        author: '',
        thumbnail: image,
        extension: '.sfm',
        description: '',
        mature_content: type === 'sfmlab' || type === 'open3dlab' ? false : true,
        created_at: 0,
        updated_at: 0,
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

    const author = parser('.panel .panel__avatar-title span.username').attr('title') ?? '';
    const description = parser('.content-container .main-upload .panel .panel__body').html() ?? '';
    const fileSize = parser('.content-container .main-upload table tbody tr:first-child td:last-child').text();
    const domImages = parser('.content-container .main-upload .text-center a picture.project-detail-image-main img');

    const category = parser('.content-container .side-upload .panel__footer dl:nth-child(5) dd').text();
    const tagsBlock = parser('.taglist .tag a');
    const matureContent = type === 'smutbase'
      ? true
      : parser('.content-container .main-upload .alert.alert-info strong').text() === 'Adult content';

    let createdAt = parser('.content-container .side-upload .panel__footer dl:nth-child(1) dd').text();
    createdAt = parseDate(createdAt);

    let updatedAt = parser('.content-container .side-upload .panel__footer dl:nth-child(3) dd').text();
    updatedAt = parseDate(updatedAt);

    let commentsRoot;

    if (type === 'sfmlab') {
      commentsRoot = cheerio.load((await sfmlabRequest(`project/${model.id}/comments`, {
        cookieJar: sfmlabCookieJar
      })).body);
    }

    if (type === 'smutbase') {
      commentsRoot = cheerio.load((await smutbaseGotInstance(`project/${model.id}/comments`)).body);
    }

    if (type === 'open3dlab') {
      commentsRoot = cheerio.load((await open3dlabGotInstance(`project/${model.id}/comments`)).body);
    }

    const images: string[] = [];
    const downloadLinks = await getDownloadLinks(parser, sfmlabRequest, sfmlabCookieJar);
    const commentaries = getComments(commentsRoot as cheerio.Root);

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
      author,
      extension: type !== 'sfmlab' ? extension : '.sfm',
      file_size: fileSize,
      mature_content: matureContent,
      created_at: Number(createdAt),
      updated_at: Number(updatedAt),
      description: SanitizeHTML(description, {
        exclusiveFilter: ((frame) => {
          return !frame.text.trim();
        })
      }),
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

export function calculateTotalPages(paginator: cheerio.Cheerio): number {
  const activeLink: string = paginator.find('li.active a').html() ?? '';
  const lastLink: string = paginator.find('li.last a').attr('href') ?? '';

  return lastLink !== ''
    ? Number(lastLink?.split('page=')[1])
    : Number(activeLink);
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

/**
 * Find all commentaries for model from custom elements root
 * @param container Custom element root
 */
export function getComments(parser: cheerio.Root): Comment[] {
  const comments = parser('.comments .comment');
  const commentsArray: Comment[] = [];

  for (let i = 0; i < comments.length; i++) {
    const comment = comments.get()[i];
    const commentBody = cheerio.load(comment);

    const message = commentBody('.comment__body .comment__content .content').text() || '';

    let postedDate = commentBody('.comment__meta .comment__meta-left').text();
    const startIdx = postedDate.indexOf('posted on');
    let endIdx = postedDate.lastIndexOf('m.');
    if (endIdx === -1) {
      endIdx = postedDate.lastIndexOf('noon');
      endIdx += 4;
    }
    postedDate = postedDate.substr(startIdx, endIdx + 1);
    postedDate = postedDate.trim();

    if (postedDate.length > 50) {
      postedDate = postedDate.substr(0, 50).trim();
    }
    const date = parseDate(postedDate);

    const avatarLink = commentBody('.comment__body .comment_avatar').get()[0].attribs['src'];
    let username = commentBody('.comment__meta .comment__meta-left .username').text()
    || commentBody('.comment__meta .comment__meta-left').text().split(' ')[0];

    username = username.replace('\n', '').trim();
    if (!username) {
      const text = commentBody('.comment__meta .comment__meta-left').text();
      const idx = text.indexOf('posted on');
      username = text.substr(0, idx).replace('\n', '').trim();
    }

    commentsArray.push({
      name: username,
      avatar: avatarLink,
      message: message,
      date: Number(date)
    });
  }

  return commentsArray;
}
