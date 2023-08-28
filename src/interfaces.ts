export interface CouplingResult {
  abstractions: number;
  abstractness: number;
  afferent: number;
  concretions: number;
  distance: number;
  efferent: number;
  imports: string[];
  instability: number;
}

export interface FileMetrics {
  abstractions: number;
  abstractness: number;
  afferent: number;
  concretions: number;
  distance: number;
  efferent: number;
  imports: string[];
  instability: number;
}

export interface FolderMetrics {
  abstractions: number;
  afferent: number;
  concretions: number;
  efferent: number;
  loc: number;
}

export interface AggregatedFolderMetrics {
  [directoryPath: string]: FolderMetrics;
}

export interface InputData {
  [filePath: string]: FileMetrics;
}

export interface ResultEntry {
  abstractions: number;
  afferent: number;
  concretions: number;
  directoryPath: string;
  efferent: number;
  loc: number;
  percent: number;
}

export interface Results {
  abstractions: string;
  afferent: string;
  concretions: string;
  efferent: string;
  loc: string;
  results: ResultEntry[];
  totalLinesOfCode: number;
}
