import * as path from 'path';
import { loadDir } from './utils/loadDir';
import * as marked from 'marked';
import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import ejs from 'ejs';
import { minify } from 'html-minifier-terser';
import dayjs from 'dayjs';
import config from './build.config.json';
import { existsSync } from 'fs';

export type MetaConfigType = (typeof config.versions)[number];

const validateConfig = config.validate;

const changefreqPriorityMap = <const>{
  hourly: 1.0,
  daily: 1.0,
  weekly: 0.8,
  monthly: 0.6,
  yearly: 0.4,
  never: 0.2,
};

type ChangefreqType = keyof typeof changefreqPriorityMap;

type PriorityType = (typeof changefreqPriorityMap)[ChangefreqType];

export type BlogInfo = {
  path: string;
  url: string;
  changefreq: ChangefreqType;
  lastmod: string;
  priority: PriorityType;
  create: string;
};

export const build = async (metaConfig: MetaConfigType, isProd: boolean) => {
  const AUTHOR = metaConfig.author;
  const NOTES_DIR = `../${metaConfig.dirName}`;
  const DOMAIN = isProd ? config.domain : config.devDomain;

  const notesDirPath = path.resolve(__dirname, NOTES_DIR);
  const notePrefixPath = path.resolve(
    __dirname,
    `../${config.outDir}/${metaConfig.dirName}`,
  );

  const filesMap = await loadDir(notesDirPath);
  const dirCheckMap: Record<string, boolean> = {};

  const changefreqKeys = Object.keys(changefreqPriorityMap);
  const markdownMetaDataKeys = [
    'title',
    'keywords',
    'description',
    'changefreq',
  ];

  const tempBlogs: BlogInfo[] = [];
  let currentBlogs: BlogInfo[] = [];

  // The reason for the existence of blogs.json is to address the issue of missing file creation
  // and modification timestamps during Vercel’s containerized build process.
  if (existsSync(path.resolve(notesDirPath, 'blogs.json'))) {
    const rawData = (
      await fs.readFile(path.resolve(notesDirPath, 'blogs.json'))
    ).toString('utf-8');
    currentBlogs = JSON.parse(rawData);
  }

  const usedFiles: string[] = [];

  const renderer = new marked.Renderer();

  const validateUrl = (url: string) => {
    // Validate the resource link format.
    if (
      !url.startsWith('http') &&
      !url.startsWith('/') &&
      !url.startsWith('mailto')
    ) {
      throw new Error(`validateUrl Error: \`${url}\` is invalid.`);
    }

    // Check if the resource exists.
    if (url.startsWith('/')) {
      const key = url.replace(new RegExp(`^\/${metaConfig.dirName}\/`), '');
      if (!(key in filesMap)) {
        throw new Error(`validateUrl Error: ${url} is not exist.`);
      }
      usedFiles.push(key);
    }
  };

  // Custom image rendering logic
  renderer.image = (image: marked.Tokens.Image): string => {
    validateUrl(image.href);
    // Add the semantic <figure> tag and enable lazy loading for the image (loading="lazy").
    return `<figure><img src="${image.href}" alt="${image.text}" loading="lazy" /><figcaption>${image.text}</figcaption></figure>`;
  };
  let hasCodeBlock = false;
  // Custom code block rendering logic
  renderer.code = (config: marked.Tokens.Code): string => {
    hasCodeBlock = true;
    return marked.Renderer.prototype.code.call(this, config);
  };

  // Custom link rendering logic
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
      metaConfig.dirName,
      fileRelativePath,
    );
    const fileFullPath = path.resolve(notePrefixPath, fileRelativePath);
    const fileDir = path.dirname(fileFullPath);

    if (!dirCheckMap[fileDir]) {
      await fs.mkdir(fileDir, { recursive: true });
      dirCheckMap[fileDir] = true;
    }

    if (fileFullPath.endsWith('.md')) {
      const dataObj = matter(content);

      // Check if the metadata in the Markdown is “complete.”
      const isKeyValid = markdownMetaDataKeys.every((item) =>
        Object.keys(dataObj.data).includes(item),
      );
      if (!isKeyValid) {
        throw new Error(
          'The Markdown must include the following metadata: title, keywords, description, and changefreq.',
        );
      }

      // Verify if the value of the changefreq field is correct.
      const isChangefreqValid = changefreqKeys.includes(
        dataObj.data.changefreq,
      );
      if (!isChangefreqValid) {
        throw new Error(
          `The value of the changefreq field is incorrect; it must be one of the following：${changefreqKeys.join(
            ', ',
          )}`,
        );
      }

      const rawHtml = marked.parse(dataObj.content, {}) as string;
      const fileStat = await fs.stat(fileOriginFullPath);
      const createdAt = fileStat.birthtime;
      const updatedAt = fileStat.mtime;
      const htmlPath = `/${metaConfig.dirName}/${fileRelativePath.replace(
        /\.md$/,
        '',
      )}`;
      const nextHtmlPath = `/${metaConfig.nextLang}/${fileRelativePath.replace(
        /\.md$/,
        '',
      )}`;
      let createTime = dayjs(createdAt).format('YYYY-MM-DD');
      let updateTime = dayjs(updatedAt).format('YYYY-MM-DD');

      // For page rendering.
      const targetItem = currentBlogs.find(
        (blog) => blog.path === fileRelativePath,
      );
      createTime = targetItem?.create || createTime;
      updateTime = targetItem?.lastmod || updateTime;

      const renderedRawHtml = await ejs.renderFile(
        path.resolve(__dirname, config.htmlTemplatePath),
        {
          content: rawHtml,
          author: AUTHOR,
          ...dataObj.data,
          domain: DOMAIN,
          domainName: config.domainName,
          path: htmlPath,
          datePublished: createTime.split(' ')[0],
          dateModified: updateTime.split(' ')[0],
          // Resources like highlight.js are relatively large and are only used in code blocks. Therefore, by passing a property to check if code blocks exist, you can ensure that highlight.js and related resource files are loaded only when code blocks are present in the document.
          hasCodeBlock,
          isProd,
          githubName: config.githubName,
          repoName: config.repoName,
          githubSourceFilePath: `blob/main/${metaConfig.dirName}/${fileRelativePath}`,
          lang: metaConfig.lang,
          blogName: metaConfig.blogName,
          createdWords: metaConfig.createdWords,
          updatedWords: metaConfig.updatedWords,
          dirName: metaConfig.dirName,
          nextLang: metaConfig.nextLang,
          nextLangType: metaConfig.nextLangType,
          nextHtmlPath,
        },
      );

      const minifiedRawHtml = await minify(renderedRawHtml, {
        collapseWhitespace: true, // Remove extra spaces.
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
      });
      fs.writeFile(
        fileFullPath.replace(/\.md$/, '.html'),
        isProd ? minifiedRawHtml : renderedRawHtml,
        'utf-8',
      );
      tempBlogs.push({
        path: fileRelativePath,
        url: `${config.domain}${htmlPath}.html`,
        changefreq: dataObj.data.changefreq,
        lastmod: dayjs(updatedAt).format('YYYY-MM-DD hh:mm:ss'),
        create: dayjs(createdAt).format('YYYY-MM-DD hh:mm:ss'),
        priority:
          changefreqPriorityMap[dataObj.data.changefreq as ChangefreqType],
      });
    } else {
      fs.writeFile(fileFullPath, content);
    }
  }

  // Detect “orphaned resources.”
  const unusedResources = Object.keys(filesMap).filter((key) => {
    // Exclude files from specific folders, as they are directly used in the template(./templates/template.html.ejs).
    return (
      !usedFiles.includes(key) && !validateConfig.ignoreFilePaths.includes(key)
    );
  });
  if (unusedResources.length > 0) {
    throw new Error(
      `The following resources are not being used：\n${unusedResources
        .map((path) => `./${metaConfig.dirName}/${path}`)
        .join('\n')}`,
    );
  }

  // Generate a blogs.json file.
  const finalBlogs = tempBlogs.map((item) => {
    const targetBlog = currentBlogs.find((blog) => blog.path === item.path);
    if (targetBlog) {
      item.create = targetBlog.create;
    }
    return item;
  });
  fs.writeFile(
    path.join(notesDirPath, 'blogs.json'),
    JSON.stringify(finalBlogs),
  );

  // Display the total number of blog posts on the homepage.
  const indexFilePath = `${notePrefixPath}/index.html`;
  const fileContent = (await fs.readFile(indexFilePath)).toString('utf-8');
  const newFileContent = fileContent.replace(
    '[[blogTotalNumber]]',
    tempBlogs.length.toString(),
  );
  await fs.writeFile(indexFilePath, newFileContent);
};
