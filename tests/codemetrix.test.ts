import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { codemetrix } from '../src/index';

describe('Codemetrix', () => {
  it('Should create code coupling metrics and directory metrics', () => {
    const expected = {
      results: {
        '/testdata/someUtility.ts': {
          afferent: 0,
          efferent: 0,
          abstractness: 0,
          instability: 0,
          distance: 0,
          imports: [],
          concretions: 1,
          abstractions: 0
        },
        '/testdata/something.ts': {
          afferent: 0,
          efferent: 1,
          abstractness: 0,
          instability: 0,
          distance: 0,
          imports: ['/testdata/someUtility.js.ts'],
          concretions: 0,
          abstractions: 1
        }
      },
      directoryMetrics: {
        results: [
          {
            directoryPath: '/testdata',
            afferent: 0,
            efferent: 1,
            abstractions: 1,
            concretions: 1,
            loc: 16,
            percent: 100
          }
        ],
        totalLinesOfCode: 16,
        loc: '/testdata',
        afferent: '/testdata',
        efferent: '/testdata',
        abstractions: '/testdata',
        concretions: '/testdata'
      }
    };

    const result = codemetrix('testdata');
    assert.deepEqual(result, expected);
  });
});
