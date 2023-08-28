import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

import { ResultEntry } from './interfaces.js';

export function getFiles(folderPath: string): string[] {
  const tsFiles: string[] = [];

  function traverseDirectory(currentPath: string): void {
    const files = readdirSync(currentPath);

    files.forEach((file: any) => {
      const filePath = path.join(currentPath, file);
      const stats = statSync(filePath);

      if (stats.isFile() && path.extname(file) === '.ts')
        tsFiles.push(filePath);
      else if (stats.isDirectory()) traverseDirectory(filePath);
    });
  }

  traverseDirectory(folderPath);
  return tsFiles;
}

export function maxBy(property: keyof ResultEntry, result: ResultEntry[]) {
  return result.reduce(
    (max, entry) => (entry[property] > max[property] ? entry : max),
    result[0]
  ).directoryPath;
}

export function startsWithSpace(str: string): boolean {
  return str.startsWith(' ');
}

export function flattenImport(importPath: string) {
  return importPath.replace('~src', `${process.cwd()}/src`);
}

export function getCleanedDirectory(filePath: string, root: string): string {
  return filePath.split(root)[1];
}

export function countLinesOfCode(filePath: string): number {
  const fullPath = `${process.cwd()}${filePath}`;
  const content = readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  return lines.length;
}

export function resolveImportPath(
  currentModulePath: string,
  importPath: string
): string {
  if (importPath.startsWith('.') || importPath.startsWith('..'))
    return path.resolve(path.dirname(currentModulePath), importPath);
  return importPath;
}
