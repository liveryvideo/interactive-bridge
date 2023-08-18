import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { AbstractPlayerBridge } from '../src/AbstractPlayerBridge';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { MockPlayerBridge } from '../src/MockPlayerBridge';

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
  let playerBridge: AbstractPlayerBridge;
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

    test('returns query parameters as specified', async () => {
      restoreSearch = stubWindowLocationSearch(
        '?foo&livery_foo%3Abar=hey+you&livery_no_val&livery_multi=1&livery_multi=2',
      );
      const result = await interactiveBridge.getLiveryParams();
      expect(result).to.deep.equal({
        'foo:bar': 'hey you',
        no_val: '',
        multi: '1',
      });
    });
  });
});
