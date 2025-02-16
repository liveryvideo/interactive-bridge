import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InteractiveBridge } from '../src/InteractiveBridge.ts';
import { MockPlayerBridge } from '../src/MockPlayerBridge.ts';

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
  // We can't test an abstract class so we'll just access the base class methods through MockPlayerBridge
  let playerBridge: MockPlayerBridge;
  let interactiveBridge: InteractiveBridge;

  beforeEach(() => {
    playerBridge = new MockPlayerBridge();
    interactiveBridge = new InteractiveBridge(playerBridge);
  });

  describe('getLiveryParams()', () => {
    let restoreSearch: () => void;

    afterEach(() => {
      restoreSearch();
    });

    it('returns query parameters as specified', async () => {
      restoreSearch = stubWindowLocationSearch(
        '?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2',
      );
      const result = await interactiveBridge.getLiveryParams();
      expect(result).to.deep.equal({
        'foo:bar': 'hey you',
        multi: '1',
        no_val: '',
      });
    });
  });
});
