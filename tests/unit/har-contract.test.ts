import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';
import {HarContract} from '../../src/support/HarContract';

const contract = (har: 'off' | 'record' | 'replay') =>
    new HarContract({har, harDir: 'resources/har'});

describe('HarContract.fileFor', () => {
    it('keys the recording by the scenario ID tag', () => {
        assert.equal(
            contract('replay').fileFor(['@positive', '@POS-04', '@P1', '@contract']),
            path.join('resources/har', 'POS-04.har.zip'),
        );
    });

    it('ignores scenarios without @contract, and every scenario when HAR is off', () => {
        assert.equal(contract('replay').fileFor(['@POS-04']), undefined);
        assert.equal(contract('off').fileFor(['@POS-04', '@contract']), undefined);
    });

    it('refuses a contract scenario with no ID or several IDs, which would share a recording', () => {
        assert.throws(() => contract('record').fileFor(['@contract']), /exactly one ID tag/);
        assert.throws(
            () => contract('record').fileFor(['@contract', '@POS-01', '@NEG-01']),
            /exactly one ID tag/,
        );
    });
});
