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

const NOTES_DIR = '../notes';
const DIST_DIR = '../dist';
const AUTHOR = 'leishanglin(雷尚林)';
const DOMAIN_NAME = 'leishanglin.com';
// const DOMAIN = 'https://leishanglin.com';
const DOMAIN = 'http://127.0.0.1:8083';

const filesMap = await loadDir(path.resolve(__dirname, NOTES_DIR));
const prefixPath = path.resolve(__dirname, DIST_DIR);

const dirCheckMap: Record<string, boolean> = {};

await emptyDir(prefixPath);

const sites: {
  url: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  lastmod: string;
  priority: number;
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

    const renderer = new marked.Renderer();
    renderer.image = (image: marked.Tokens.Image): string => {
      // 添加语义化标签：figure，并让图片进行懒加载（loading="lazy"）
      return `<figure><img src="${image.href}" alt="${image.text}" loading="lazy" /><figcaption>${image.text}</figcaption></figure>`;
    };

    marked.setOptions({ renderer });

    const rawHtml = marked.parse(dataObj.content, {}) as string;
    const fileStat = await fs.stat(fileOriginFullPath);
    const createdAt = fileStat.birthtime;
    const updatedAt = fileStat.mtime;
    const renderedRawHtml = await ejs.renderFile(
      path.resolve(__dirname, './index.html.ejs'),
      {
        content: rawHtml,
        author: AUTHOR,
        ...dataObj.data,
        domain: DOMAIN,
        domainName: DOMAIN_NAME,
        path: `/${fileRelativePath.replace(/\.md$/, '')}`,
        datePublished: dayjs(createdAt).format('YYYY-MM-DD'),
        dateModified: dayjs(updatedAt).format('YYYY-MM-DD'),
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
      'utf-8',
    );
    sites.push({
      url: `${DOMAIN}/${fileRelativePath.replace(/\.md$/, '')}`,
      changefreq: 'daily',
      lastmod: dayjs(updatedAt).format('YYYY-MM-DD'),
      priority: 1.0,
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
