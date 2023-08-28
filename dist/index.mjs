import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ // The require scope
/******/ var __nccwpck_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__nccwpck_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__nccwpck_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");
var external_path_default = /*#__PURE__*/__nccwpck_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: ./src/utils.ts


function getFiles(folderPath) {
    const tsFiles = [];
    function traverseDirectory(currentPath) {
        const files = (0,external_fs_namespaceObject.readdirSync)(currentPath);
        files.forEach((file) => {
            const filePath = external_path_default().join(currentPath, file);
            const stats = (0,external_fs_namespaceObject.statSync)(filePath);
            if (stats.isFile() && external_path_default().extname(file) === '.ts')
                tsFiles.push(filePath);
            else if (stats.isDirectory())
                traverseDirectory(filePath);
        });
    }
    traverseDirectory(folderPath);
    return tsFiles;
}
function maxBy(property, result) {
    return result.reduce((max, entry) => (entry[property] > max[property] ? entry : max), result[0]).directoryPath;
}
function startsWithSpace(str) {
    return str.startsWith(' ');
}
function flattenImport(importPath) {
    return importPath.replace('~src', `${process.cwd()}/src`);
}
function getCleanedDirectory(filePath, root) {
    return filePath.split(root)[1];
}
function countLinesOfCode(filePath) {
    const fullPath = `${process.cwd()}${filePath}`;
    const content = (0,external_fs_namespaceObject.readFileSync)(fullPath, 'utf-8');
    const lines = content.split('\n');
    return lines.length;
}
function resolveImportPath(currentModulePath, importPath) {
    if (importPath.startsWith('.') || importPath.startsWith('..'))
        return external_path_default().resolve(external_path_default().dirname(currentModulePath), importPath);
    return importPath;
}

;// CONCATENATED MODULE: ./src/index.ts



function codemetrix(srcPath) {
    const _path = external_path_default().resolve(srcPath || 'src');
    if (!(0,external_fs_namespaceObject.existsSync)(_path)) {
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
class Codemetrix {
    IMPORT_REGEX = /^\s*import\s+.*from\s+['"]([^'"]+)['"]/;
    ABSTRACTION_REGEX = /(abstract class \w* {|type \w* = {|interface \w* {)/;
    CONCRETION_REGEX = /const \w* = \(.*|function \w*\(.*\).* {|(?<!abstract\s)class \w* {/;
    couplingMetrics(files) {
        const root = external_path_default().basename(external_path_default().resolve());
        const results = {};
        files.forEach((filePath) => {
            const fixedFileName = getCleanedDirectory(filePath, root);
            results[fixedFileName] = this.createBaseResults(filePath);
        });
        files.forEach((filePath) => {
            const fixedFileName = getCleanedDirectory(filePath, root);
            const imports = results[fixedFileName].imports;
            if (imports.length > 0) {
                imports.forEach((importPath) => {
                    const fixedImportName = getCleanedDirectory(flattenImport(importPath), root);
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
        files.forEach((filePath) => {
            const fixedFileName = getCleanedDirectory(filePath, root);
            const imports = results[fixedFileName].imports;
            if (imports.length > 0)
                results[fixedFileName].imports = this.getFixedImports(imports, root);
        });
        return results;
    }
    getFixedImports(imports, root) {
        return imports
            .map((importPath) => getCleanedDirectory(importPath, root))
            .filter((importPath) => importPath);
    }
    createBaseResults(filePath) {
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
    calculateInstability(item) {
        return parseFloat((item.efferent / (item.efferent + item.afferent)).toFixed(2));
    }
    calculateAbstractness(item) {
        if (item.abstractions > 0 && item.concretions === 0)
            return 1;
        if (!item.abstractions && item.concretions === 0)
            return 0;
        return parseFloat((item.abstractions / item.concretions).toFixed(2));
    }
    calculateDistanceFromMainSequence(item) {
        return parseFloat(Math.abs(item.abstractness + item.instability - 1).toFixed(2));
    }
    extractData(filePath) {
        const lines = (0,external_fs_namespaceObject.readFileSync)(filePath, 'utf-8').split('\n');
        const imports = [];
        let abstractions = 0;
        let concretions = 0;
        lines.forEach((line) => {
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
    directoryMetrics(data) {
        const aggregatedMetrics = {};
        let totalLoc = 0;
        for (const filePath in data) {
            const directoryPath = filePath.split('/').slice(0, -1).join('/');
            const metrics = data[filePath];
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
        const result = Object.entries(aggregatedMetrics).map(([directoryPath, directoryData]) => {
            const { afferent, efferent, abstractions, concretions, loc } = directoryData;
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
        });
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
    createBaseMetricsObject() {
        return {
            afferent: 0,
            efferent: 0,
            abstractions: 0,
            concretions: 0,
            loc: 0
        };
    }
}
function outputCouplingMetrics(results) {
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

;// CONCATENATED MODULE: ./src/run.ts

const srcPath = process.argv[2];
codemetrix(srcPath);

