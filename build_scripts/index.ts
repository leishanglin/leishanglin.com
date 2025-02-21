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

for (const version of config.versions) {
  await build(version, isProd);

  // Retrieve the blogs.json file from the folder to generate the sitemap.xml.
  const rawBlogs = (
    await fs.readFile(
      path.resolve(__dirname, `../${version.dirName}/blogs.json`),
    )
  ).toString('utf-8');
  blogs.push(...JSON.parse(rawBlogs));

  if (existsSync(path.resolve(outDirPath, `${version.dirName}/blogs.json`))) {
    fs.rm(path.resolve(outDirPath, `${version.dirName}/blogs.json`));
  }
}

// Generate a sitemap.xml file.
const sitemap = new SitemapStream({ hostname: config.domain });
blogs.forEach((blog) => {
  sitemap.write(blog);
});
sitemap.end();
const sitemapXml = await streamToPromise(sitemap);
fs.writeFile(path.join(outDirPath, 'sitemap.xml'), sitemapXml);