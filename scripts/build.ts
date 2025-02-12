import * as path from 'path';
import { loadDir } from './loadDir';
import * as marked from 'marked';
import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import { emptyDir } from 'fs-extra';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import dayjs from 'dayjs';
import { SitemapStream, streamToPromise } from 'sitemap';

const NOTES_FOLDER_NAME = 'notes';
const NOTES_DIR = `../${NOTES_FOLDER_NAME}`;
const DIST_DIR = '../dist';
const AUTHOR = 'leishanglin(雷尚林)';
const DOMAIN_NAME = 'leishanglin.com';
const DOMAIN = 'https://leishanglin.com';
// const DOMAIN = 'http://127.0.0.1:8083';
const GITHUB_NAME = 'https://github.com/leishanglin';
const REPO_NAME = 'leishanglin.com';

const filesMap = await loadDir(path.resolve(__dirname, NOTES_DIR));
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

const sites: {
  url: string;
  changefreq: ChangefreqType;
  lastmod: string;
  priority: PriorityType;
}[] = [];

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

    const renderer = new marked.Renderer();

    // 自定义图片渲染逻辑
    renderer.image = (image: marked.Tokens.Image): string => {
      // 添加语义化标签：figure，并让图片进行懒加载（loading="lazy"）
      return `<figure><img src="${image.href}" alt="${image.text}" loading="lazy" /><figcaption>${image.text}</figcaption></figure>`;
    };
    let hasCodeBlock = false;
    // 自定义代码块渲染逻辑
    renderer.code = (config: marked.Tokens.Code): string => {
      hasCodeBlock = true;
      return marked.Renderer.prototype.code.call(this, config);
    };

    marked.setOptions({ renderer });

    const rawHtml = marked.parse(dataObj.content, {}) as string;
    const fileStat = await fs.stat(fileOriginFullPath);
    const createdAt = fileStat.birthtime;
    const updatedAt = fileStat.mtime;
    let htmlPath = `/${fileRelativePath.replace(/\.md$/, '')}`;
    if (htmlPath.endsWith('/index')) {
      htmlPath = htmlPath.replace(/\/index$/, '/');
    }
    const renderedRawHtml = await ejs.renderFile(
      path.resolve(__dirname, './index.html.ejs'),
      {
        content: rawHtml,
        author: AUTHOR,
        ...dataObj.data,
        domain: DOMAIN,
        domainName: DOMAIN_NAME,
        path: htmlPath,
        datePublished: dayjs(createdAt).format('YYYY-MM-DD'),
        dateModified: dayjs(updatedAt).format('YYYY-MM-DD'),
        // highlight.js 等资源比较大，且只用在代码块中，所以传入一个判断是否存在代码块的属性，这样就可以做到“只在文档中存在代码块时才加载 highlight.js 相关的资源文件
        hasCodeBlock,
        githubName: GITHUB_NAME,
        repoName: REPO_NAME,
        fileRealPath: `blob/main/${NOTES_FOLDER_NAME}/${fileRelativePath}`,
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
      minifiedRawHtml,
      // renderedRawHtml,
      'utf-8',
    );
    sites.push({
      url: `${DOMAIN}${htmlPath}`,
      changefreq: dataObj.data.changefreq,
      lastmod: dayjs(updatedAt).format('YYYY-MM-DD'),
      priority:
        changefreqPriorityMap[dataObj.data.changefreq as ChangefreqType],
    });
  } else {
    fs.writeFile(fileFullPath, content);
  }
}

fs.writeFile(
  path.resolve(prefixPath, 'robots.txt'),
  await ejs.renderFile(
    path.resolve(process.cwd(), './scripts/robots.txt.ejs'),
    {
      domain: DOMAIN,
    },
  ),
);

const sitemap = new SitemapStream({ hostname: DOMAIN });
sites.forEach((site) => {
  sitemap.write(site);
});
sitemap.end();
const sitemapXml = await streamToPromise(sitemap);
fs.writeFile(path.resolve(prefixPath, 'sitemap.xml'), sitemapXml);
