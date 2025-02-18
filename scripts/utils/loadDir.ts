import * as path from 'node:path';
import * as fs from 'node:fs/promises';

const toUnixPath = (filePath: string) =>
  path.normalize(filePath).replace(/\\/g, '/');

/**
 * load dir in memory
 * @param dirPath string
 * @returns Record<string, string>, like: { "docs/about.md": "# About ...." }
 */
export const loadDir = async (dirPath: string) => {
  const filesMap: Record<string, Buffer> = {};

  const traverse = async (currentPath: string) => {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(dirPath, fullPath);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        // 不处理 MacOS 中的 .DS_Store 文件
        if (relativePath.endsWith('.DS_Store')) {
          continue;
        }
        const key = toUnixPath(relativePath);
        const value = await fs.readFile(fullPath);
        filesMap[key] = value;
      }
    }
  };

  await traverse(dirPath);

  return filesMap;
};
