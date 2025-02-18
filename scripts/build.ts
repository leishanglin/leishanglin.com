import * as path from 'path';
import { loadDir } from './utils/loadDir';
import * as marked from 'marked';
import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import { emptyDir } from 'fs-extra';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import dayjs from 'dayjs';
import { SitemapStream, streamToPromise } from 'sitemap';
import config from './build.config.json';
import { existsSync } from 'fs';

const { MODE } = process.env;
const isProd = MODE === 'production';
const NOTES_FOLDER_NAME = 'notes';
const NOTES_DIR = `../${NOTES_FOLDER_NAME}`;
const DIST_DIR = '../dist';
const AUTHOR = 'leishanglin';
const CHINESE_NAME = '雷尚林';
const DOMAIN_NAME = 'leishanglin.com';
const DOMAIN = isProd ? 'https://leishanglin.com' : 'http://127.0.0.1:8083';
const GITHUB_NAME = 'https://github.com/leishanglin';
const REPO_NAME = 'leishanglin.com';
const HTML_TEMPLATE_PATH = './templates/template.html.ejs';
const ROBOTS_TEMPLATE_PATH = './templates/robots.txt.ejs';

const notesPath = path.resolve(__dirname, NOTES_DIR);
const filesMap = await loadDir(notesPath);
const prefixPath = path.resolve(__dirname, DIST_DIR);

const dirCheckMap: Record<string, boolean> = {};

await emptyDir(prefixPath);

const changefreqPriorityMap = <const>{
  hourly: 1.0,
  daily: 1.0,
  weekly: 0.8,
  monthly: 0.6,
  yearly: 0.4,
  never: 0.2,
};
const changefreqKeys = Object.keys(changefreqPriorityMap);
const markdownMetaDataKeys = ['title', 'keywords', 'description', 'changefreq'];

type ChangefreqType = keyof typeof changefreqPriorityMap;
type PriorityType = (typeof changefreqPriorityMap)[ChangefreqType];
type FileDate = { create: string; update: string };

const fileDateMap: Record<string, FileDate> = {};
let originDateMap: Record<string, FileDate> = {};

// file-date-map.json 存在的原因，是为了解决 Vercel 容器化构建，丢失文件的创建和更新时间，这个问题
if (existsSync(path.join(notesPath, 'file-date-map.json'))) {
  const rawData = (
    await fs.readFile(path.join(notesPath, 'file-date-map.json'))
  ).toString();
  originDateMap = JSON.parse(rawData);
}

const sites: {
  url: string;
  changefreq: ChangefreqType;
  lastmod: string;
  priority: PriorityType;
}[] = [];
const usedFiles: string[] = [];

const renderer = new marked.Renderer();

const validateUrl = (url: string) => {
  // 校验资源链接格式
  if (
    !url.startsWith('http') &&
    !url.startsWith('/') &&
    !url.startsWith('mailto')
  ) {
    throw new Error(`validateUrl Error: \`${url}\` is invalid.`);
  }

  // 校验资源是否存在
  if (url.startsWith('/')) {
    const key = url.replace(/^\//, '');
    if (!(key in filesMap)) {
      throw new Error(`validateUrl Error: ${url} is not exist.`);
    }
    usedFiles.push(key);
  }
};

// 自定义图片渲染逻辑
renderer.image = (image: marked.Tokens.Image): string => {
  validateUrl(image.href);
  // 添加语义化标签：figure，并让图片进行懒加载（loading="lazy"）
  return `<figure><img src="${image.href}" alt="${image.text}" loading="lazy" /><figcaption>${image.text}</figcaption></figure>`;
};
let hasCodeBlock = false;
// 自定义代码块渲染逻辑
renderer.code = (config: marked.Tokens.Code): string => {
  hasCodeBlock = true;
  return marked.Renderer.prototype.code.call(this, config);
};

// 自定义链接渲染逻辑
renderer.link = (config: marked.Tokens.Link) => {
  validateUrl(config.href);

  let { href, text, title } = config;

  if (href.startsWith('/') || href.startsWith(DOMAIN)) {
    if (href.startsWith('/') && href.endsWith('.md')) {
      href = href.replace(/\.md$/, '.html');
    }

    return `<a href="${href}" ${
      title ? `title="${title}"` : ''
    } target="_self">${text}</a>`;
  }

  return `<a href="${href}" ${
    title ? `title="${title}"` : ''
  } target="_blank" ref="nofollow">${text}</a>`;
};

marked.setOptions({ renderer });

for (const [fileRelativePath, content] of Object.entries(filesMap)) {
  const fileOriginFullPath = path.resolve(
    process.cwd(),
    'notes',
    fileRelativePath,
  );
  const fileFullPath = path.resolve(prefixPath, fileRelativePath);
  const fileDir = path.dirname(fileFullPath);

  if (!dirCheckMap[fileDir]) {
    await fs.mkdir(fileDir, { recursive: true });
    dirCheckMap[fileDir] = true;
  }

  if (fileFullPath.endsWith('.md')) {
    const dataObj = matter(content);

    // 校验 markdown 中的元数据是否“完整”
    const isKeyValid = markdownMetaDataKeys.every((item) =>
      Object.keys(dataObj.data).includes(item),
    );
    if (!isKeyValid) {
      throw new Error(
        'Markdown 中必须含有这些元数据：title, keywords, description, changefreq',
      );
    }

    // 校验 changefreq 字段值是否“正确”
    const isChangefreqValid = changefreqKeys.includes(dataObj.data.changefreq);
    if (!isChangefreqValid) {
      throw new Error(
        `changefreq 字段不对，只能在这几个中选：${changefreqKeys.join(', ')}`,
      );
    }

    const rawHtml = marked.parse(dataObj.content, {}) as string;
    const fileStat = await fs.stat(fileOriginFullPath);
    const createdAt = fileStat.birthtime;
    const updatedAt = fileStat.mtime;
    let htmlPath = `/${fileRelativePath.replace(/\.md$/, '')}`;
    let createTime = dayjs(createdAt).format('YYYY-MM-DD');
    let updateTime = dayjs(updatedAt).format('YYYY-MM-DD');
    // 先存起来，供下次使用(Vercel Build)
    fileDateMap[fileRelativePath] = { create: createTime, update: updateTime };

    // 用于页面渲染
    createTime = originDateMap[fileRelativePath]?.create || createTime;
    updateTime = originDateMap[fileRelativePath]?.update || updateTime;

    const renderedRawHtml = await ejs.renderFile(
      path.resolve(__dirname, HTML_TEMPLATE_PATH),
      {
        content: rawHtml,
        author: AUTHOR,
        ...dataObj.data,
        domain: DOMAIN,
        domainName: DOMAIN_NAME,
        path: htmlPath,
        datePublished: createTime,
        dateModified: updateTime,
        // highlight.js 等资源比较大，且只用在代码块中，所以传入一个判断是否存在代码块的属性，这样就可以做到“只在文档中存在代码块时才加载 highlight.js 相关的资源文件
        hasCodeBlock,
        isProd,
        githubName: GITHUB_NAME,
        repoName: REPO_NAME,
        githubSourceFilePath: `blob/main/${NOTES_FOLDER_NAME}/${fileRelativePath}`,
        chineseName: CHINESE_NAME,
      },
    );

    const minifiedRawHtml = await minify(renderedRawHtml, {
      collapseWhitespace: true, // 删除多余空格
      removeComments: true, // 删除注释
      removeRedundantAttributes: true, // 移除冗余属性
      removeEmptyAttributes: true, // 删除空属性
      minifyCSS: true, // 压缩 CSS
      minifyJS: true, // 压缩 JS 代码
    });
    fs.writeFile(
      fileFullPath.replace(/\.md$/, '.html'),
      isProd ? minifiedRawHtml : renderedRawHtml,
      'utf-8',
    );
    sites.push({
      url: `${DOMAIN}${htmlPath}.html`,
      changefreq: dataObj.data.changefreq,
      lastmod: dayjs(updatedAt).format('YYYY-MM-DD hh:mm:ss'),
      priority:
        changefreqPriorityMap[dataObj.data.changefreq as ChangefreqType],
    });
  } else {
    fs.writeFile(fileFullPath, content);
  }
}

// 检测“孤岛资源”
const unusedResources = Object.keys(filesMap).filter((key) => {
  return (
    !usedFiles.includes(key) && !config.validate.ignoreFilePaths.includes(key)
  );
});
if (unusedResources.length > 0) {
  throw new Error(
    `The following resources are not being used：\n${unusedResources.join(
      '\n',
    )}`,
  );
}

// 生成 robots.txt
fs.writeFile(
  path.resolve(prefixPath, 'robots.txt'),
  await ejs.renderFile(path.resolve(__dirname, ROBOTS_TEMPLATE_PATH), {
    domain: DOMAIN,
  }),
);

// 生成 sitemap
// 平时偶尔在本地 build 一下，生成的 sitemap 会被推送到 github
// 进而被 Vercel 使用，打入 dist 中，而 Vercel 中 build 时，新生成的 sitemap 就不会被使用，以此解决“lastmod 不正确”的问题
if (isProd) {
  // 生成 sitemap.xml
  const sitemap = new SitemapStream({ hostname: DOMAIN });
  sites.forEach((site) => {
    sitemap.write(site);
  });
  sitemap.end();
  const sitemapXml = await streamToPromise(sitemap);
  fs.writeFile(path.join(notesPath, 'sitemap.xml'), sitemapXml);
}

// 生成 file-date-map.json
fs.writeFile(
  path.join(notesPath, 'file-date-map.json'),
  JSON.stringify(fileDateMap),
);

// 在首页中填入博客总数
const indexFilePath = `${prefixPath}/index.html`;
const fileContent = (await fs.readFile(indexFilePath)).toString('utf-8');
const newFileContent = fileContent.replace(
  '[[blogTotalNumber]]',
  sites.length.toString(),
);
await fs.writeFile(indexFilePath, newFileContent);
