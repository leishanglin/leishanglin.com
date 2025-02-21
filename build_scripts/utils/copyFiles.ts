import * as fs from 'fs';
import * as path from 'path';

/**
 * Copy file or dir to dest path.
 * @param src source path
 * @param dest destination path
 */
export const copyFiles = (src: string, dest: string) => {
  const stat = fs.statSync(src);

  if (stat.isFile()) {
    const destFolder = path.dirname(dest);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  } else if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    const items = fs.readdirSync(src);
    items.forEach((item) => {
      const srcItemPath = path.join(src, item);
      const destItemPath = path.join(dest, item);

      copyFiles(srcItemPath, destItemPath);
    });
  } else {
    console.log('The source path is neither a file nor a folder: ', src);
  }
};
