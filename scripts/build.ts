import * as path from 'path';
import { loadDir } from './loadDir';
import * as marked from 'marked';
import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import { emptyDir } from 'fs-extra';
import ejs from 'ejs';

const filesMap = await loadDir(path.resolve(__dirname, '../notes'));
const prefixPath = path.resolve(__dirname, '../dist');

const dirCheckMap: Record<string, boolean> = {};

await emptyDir(prefixPath);

for (const [fileRelativePath, content] of Object.entries(filesMap)) {
  const fileFullPath = path.resolve(prefixPath, fileRelativePath);
  const fileDir = path.dirname(fileFullPath);

  if (!dirCheckMap[fileDir]) {
    await fs.mkdir(fileDir, { recursive: true });
    dirCheckMap[fileDir] = true;
  }

  if (fileFullPath.endsWith('.md')) {
    const dataObj = matter(content);
    const rawHtml = marked.marked(dataObj.content, {}) as string;
    const renderedRawHtml = await ejs.renderFile(
      path.resolve(__dirname, './index.html.ejs'),
      { noteHtml: rawHtml },
    );
    fs.writeFile(
      fileFullPath.replace(/\.md$/, '.html'),
      renderedRawHtml,
      'utf-8',
    );
  } else {
    fs.writeFile(fileFullPath, content);
  }
}
