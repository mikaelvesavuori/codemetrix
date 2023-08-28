import { readFileSync, existsSync } from 'fs';
import path from 'path';

import {
  CouplingResult,
  AggregatedFolderMetrics,
  InputData,
  Results,
  ResultEntry,
  FileMetrics
} from './interfaces.js';

import {
  countLinesOfCode,
  flattenImport,
  getCleanedDirectory,
  getFiles,
  maxBy,
  resolveImportPath,
  startsWithSpace
} from './utils.js';

export function codemetrix(srcPath?: string): Record<string, any> {
  const _path = path.resolve(srcPath || 'src');
  if (!existsSync(_path)) {
    console.error(`❌ No such path! ---> "${_path}"`);
    process.exit();
  }

  const files = getFiles(_path);
  const codemetrix = new Codemetrix();
  const results = codemetrix.couplingMetrics(files);
  const directoryMetrics = codemetrix.directoryMetrics(results);

  console.log('--- Codemetrix: Coupling metrics ---');
  outputCouplingMetrics(results);

  console.log('--- Codemetrix: Directory metrics ---');
  console.log(directoryMetrics);

  return { results, directoryMetrics };
}

/**
 * @description Understand the level of coupling and changeability of your code in a second.
 */
class Codemetrix {
  IMPORT_REGEX = /^\s*import\s+.*from\s+['"]([^'"]+)['"]/;
  ABSTRACTION_REGEX = /(abstract class \w* {|type \w* = {|interface \w* {)/;
  CONCRETION_REGEX =
    /const \w* = \(.*|function \w*\(.*\).* {|(?<!abstract\s)class \w* {/;

  /**
   * @description Calculate coupling metrics.
   */
  public couplingMetrics(files: string[]): Record<string, CouplingResult> {
    const root = path.basename(path.resolve());
    const results: Record<string, CouplingResult> = {};

    // All files need a base object before the next step
    files.forEach((filePath) => {
      const fixedFileName = getCleanedDirectory(filePath, root);
      results[fixedFileName] = this.createBaseResults(filePath);
    });

    // Go through all imports, if any, and calculate values
    files.forEach((filePath) => {
      const fixedFileName = getCleanedDirectory(filePath, root);
      const imports = results[fixedFileName].imports;

      if (imports.length > 0) {
        imports.forEach((importPath) => {
          const fixedImportName = getCleanedDirectory(
            flattenImport(importPath),
            root
          );
          const importReference = results[fixedImportName];

          if (importReference) {
            importReference.afferent++;
            importReference.instability =
              this.calculateInstability(importReference);
            importReference.abstractness =
              this.calculateAbstractness(importReference);
            importReference.distance =
              this.calculateDistanceFromMainSequence(importReference);
          }
        });
      }
    });

    // Clean up import paths before presenting
    files.forEach((filePath) => {
      const fixedFileName = getCleanedDirectory(filePath, root);
      const imports = results[fixedFileName].imports;

      if (imports.length > 0)
        results[fixedFileName].imports = this.getFixedImports(imports, root);
    });

    return results;
  }

  private getFixedImports(imports: string[], root: string) {
    return imports
      .map((importPath) => getCleanedDirectory(importPath, root))
      .filter((importPath) => importPath);
  }

  private createBaseResults(filePath: string): CouplingResult {
    const { imports, concretions, abstractions } = this.extractData(filePath);

    return {
      afferent: 0,
      efferent: imports.length,
      abstractness: 0,
      instability: 0,
      distance: 0,
      imports,
      concretions,
      abstractions
    };
  }

  private calculateInstability(item: CouplingResult): number {
    return parseFloat(
      (item.efferent / (item.efferent + item.afferent)).toFixed(2)
    );
  }

  private calculateAbstractness(item: CouplingResult): number {
    if (item.abstractions > 0 && item.concretions === 0) return 1;
    if (!item.abstractions && item.concretions === 0) return 0;
    return parseFloat((item.abstractions / item.concretions).toFixed(2));
  }

  private calculateDistanceFromMainSequence(item: CouplingResult): number {
    return parseFloat(
      Math.abs(item.abstractness + item.instability - 1).toFixed(2)
    );
  }

  private extractData(filePath: string): Record<string, any> {
    const lines = readFileSync(filePath, 'utf-8').split('\n');

    const imports: string[] = [];
    let abstractions = 0;
    let concretions = 0;

    lines.forEach((line: any) => {
      const importMatch = line.match(this.IMPORT_REGEX);
      if (importMatch)
        imports.push(resolveImportPath(filePath, importMatch[1] + '.ts'));

      const abstractionMatch = line.match(this.ABSTRACTION_REGEX);
      if (abstractionMatch && !startsWithSpace(abstractionMatch.input || ''))
        abstractions++;

      const concretionMatch = line.match(this.CONCRETION_REGEX);
      if (concretionMatch && !startsWithSpace(concretionMatch.input || ''))
        concretions++;
    });

    return { imports, concretions, abstractions };
  }

  /**
   * @description Compile the directory metrics, based off of the coupling metrics.
   */
  public directoryMetrics(data: InputData): Results {
    const aggregatedMetrics: AggregatedFolderMetrics = {};

    let totalLoc = 0;

    for (const filePath in data) {
      const directoryPath = filePath.split('/').slice(0, -1).join('/');
      const metrics: FileMetrics = data[filePath];

      const base = this.createBaseMetricsObject();
      const fileLoc = countLinesOfCode(filePath);
      totalLoc += fileLoc;

      aggregatedMetrics[directoryPath] =
        aggregatedMetrics[directoryPath] || base;
      const directoryData = aggregatedMetrics[directoryPath];
      directoryData.afferent += metrics.afferent;
      directoryData.efferent += metrics.efferent;
      directoryData.abstractions += metrics.abstractions;
      directoryData.concretions += metrics.concretions;
      directoryData.loc += fileLoc;
    }

    const result: ResultEntry[] = Object.entries(aggregatedMetrics).map(
      ([directoryPath, directoryData]) => {
        const { afferent, efferent, abstractions, concretions, loc } =
          directoryData;
        const percent = parseFloat(((loc / totalLoc) * 100).toFixed(2));

        return {
          directoryPath,
          afferent,
          efferent,
          abstractions,
          concretions,
          loc,
          percent
        };
      }
    );

    return {
      results: result,
      totalLinesOfCode: totalLoc,
      loc: maxBy('loc', result),
      afferent: maxBy('afferent', result),
      efferent: maxBy('efferent', result),
      abstractions: maxBy('abstractions', result),
      concretions: maxBy('concretions', result)
    };
  }

  private createBaseMetricsObject() {
    return {
      afferent: 0,
      efferent: 0,
      abstractions: 0,
      concretions: 0,
      loc: 0
    };
  }
}

function outputCouplingMetrics(results: Record<string, CouplingResult>) {
  for (const module in results) {
    console.table([
      {
        Module: module,
        Afferent: results[module].afferent,
        Efferent: results[module].efferent,
        Instability: results[module].instability,
        Abstractness: results[module].abstractness,
        Distance: results[module].distance
      }
    ]);
  }
}
