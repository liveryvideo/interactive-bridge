import { afterEach, describe, expect, it } from 'vitest';
import { AbstractPlayerBridge } from '../src/AbstractPlayerBridge';

function stubWindowLocationSearch(search: string) {
  const originalSearch = window.location.search;
  window.location.search = search;
  // We used to use this for testing in actual browser
  // window.history.replaceState(null, '', search);
  return () => {
    // window.history.replaceState(null, '', originalSearch);
    window.location.search = originalSearch;
  };
}

describe('AbstractPlayerBridge', () => {
  describe('static getLiveryParams()', () => {
    let restoreSearch: () => void;

    afterEach(() => {
      restoreSearch();
    });

    it('returns query parameters as specified', () => {
      restoreSearch = stubWindowLocationSearch(
        '?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2',
      );
      const result = AbstractPlayerBridge.getLiveryParams();
      expect(result).to.deep.equal({
        'foo:bar': 'hey you',
        multi: '1',
        no_val: '',
      });
    });
  });
});
