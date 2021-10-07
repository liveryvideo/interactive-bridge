import { expect } from '@open-wc/testing';
import { logStringify } from '../../src/util/logStringify';

describe('logStringify', () => {
  it('handles string like JSON.stringify()', () => {
    expect(logStringify('foo')).to.equal('"foo"');
  });
  it('handles Error String()', () => {
    expect(logStringify(new Error('foo'))).to.equal('Error: foo');
  });
});
