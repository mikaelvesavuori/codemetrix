import { ResultEntry } from './interfaces.js';
export declare function getFiles(folderPath: string): string[];
export declare function maxBy(property: keyof ResultEntry, result: ResultEntry[]): string;
export declare function startsWithSpace(str: string): boolean;
export declare function flattenImport(importPath: string): string;
export declare function getCleanedDirectory(filePath: string, root: string): string;
export declare function countLinesOfCode(filePath: string): number;
export declare function resolveImportPath(currentModulePath: string, importPath: string): string;
