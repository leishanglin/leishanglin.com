import * as path from 'path';
import * as fs from 'fs/promises';
import { build } from './build';
import config from './build.config.json';
import { emptyDir } from 'fs-extra';
import { copyFiles } from './utils/copyFiles';
import ejs from 'ejs';

const outDirPath = path.resolve(__dirname, `../${config.outDir}`);
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

for (const version of config.versions) {
  await build(version);
}

console.log('Done');
