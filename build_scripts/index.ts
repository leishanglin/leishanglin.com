import * as path from 'path';
import * as fs from 'fs/promises';
import { BlogInfo, build } from './build';
import config from './build.config.json';
import { emptyDir } from 'fs-extra';
import { copyFiles } from './utils/copyFiles';
import ejs from 'ejs';
import { SitemapStream, streamToPromise } from 'sitemap';
import { existsSync } from 'fs';

const outDirPath = path.resolve(__dirname, `../${config.outDir}`);
const { MODE } = process.env;
const isProd = MODE === 'production';

await emptyDir(outDirPath);

// Copy the static files to the output directory (default is dist).
for (const item of config.staticFiles) {
  copyFiles(
    path.resolve(__dirname, `../${item}`),
    path.resolve(__dirname, `../${config.outDir}/${item}`),
  );
}

// Generate a robots.txt file.
fs.writeFile(
  path.resolve(outDirPath, 'robots.txt'),
  await ejs.renderFile(path.resolve(__dirname, config.robotsTemplatePath), {
    domain: config.domain,
  }),
);

const blogs: BlogInfo[] = [];
const blogsMap: Record<string, BlogInfo[]> = {};

for (const version of config.versions) {
  await build(version, isProd);

  // Retrieve the blogs.json file from the folder to generate the sitemap.xml.
  const rawBlogs = (
    await fs.readFile(
      path.resolve(__dirname, `../${version.dirName}/blogs.json`),
    )
  ).toString('utf-8');
  const tempBlogs = JSON.parse(rawBlogs);
  blogs.push(...tempBlogs);
  blogsMap[version.dirName] = tempBlogs;

  if (existsSync(path.resolve(outDirPath, `${version.dirName}/blogs.json`))) {
    fs.rm(path.resolve(outDirPath, `${version.dirName}/blogs.json`));
  }
}

// Generate a root index.html
const enIndexContent = await fs.readFile(
  path.resolve(outDirPath, './en/index.html'),
);
await fs.writeFile(path.join(outDirPath, './index.html'), enIndexContent);

// Generate a sitemap.xml file.
const sitemap = new SitemapStream({ hostname: config.domain });
blogs.forEach((blog) => {
  sitemap.write(blog);
});
sitemap.write({
  url: `${config.domain}/index.html`,
  changefreq: 'monthly',
  lastmod: '2025-02-22',
  priority: 1.0,
});
sitemap.end();
const sitemapXml = await streamToPromise(sitemap);
fs.writeFile(path.join(outDirPath, 'sitemap.xml'), sitemapXml);

// Check if the documents in different language versions correspond to each other correctly.
const specialFiles: string[] = [];
for (const item of blogsMap['en']) {
  if (blogsMap['zh-CN'].every((record) => item.path !== record.path)) {
    specialFiles.push(`./en/${item.path}`);
  }
}
for (const item of blogsMap['zh-CN']) {
  if (blogsMap['en'].every((record) => item.path !== record.path)) {
    specialFiles.push(`./zh-CN/${item.path}`);
  }
}
if (specialFiles.length) {
  throw new Error(`Found Special files: \n${specialFiles.join('\n')}`);
}
