import * as path from 'path';
import { loadDir } from './loadDir';
import * as marked from 'marked';
import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import { emptyDir } from 'fs-extra';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';

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

    const renderer = new marked.Renderer();
    renderer.image = (image: marked.Tokens.Image): string => {
      // 添加语义化标签：figure，并让图片进行懒加载（loading="lazy"）
      return `<figure><img src="${image.href}" alt="${image.text}" loading="lazy" /><figcaption>${image.text}</figcaption></figure>`;
    };
    
    marked.setOptions({ renderer });

    const rawHtml = marked.parse(dataObj.content, {}) as string;
    const renderedRawHtml = await ejs.renderFile(
      path.resolve(__dirname, './index.html.ejs'),
      { content: rawHtml, author: 'leishanglin(雷尚林)', ...dataObj.data },
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
  } else {
    fs.writeFile(fileFullPath, content);
  }
}
