import { describe, expect, test } from 'vitest';
import type { Feature } from '../src/InteractiveBridge';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { MockPlayerBridge } from '../src/MockPlayerBridge';

class StubPlayerBridge extends MockPlayerBridge {
  features: Feature[] = [];

  protected override getFeatures(): Feature[] {
    return this.features;
  }
}

describe.skip('InteractiveBridge.getAppName()');

describe.skip('InteractiveBridge.getCustomerId()');

describe.skip('InteractiveBridge.getEndpointId()');

describe('InteractiveBridge.getFeatures()', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  function arrangeWithStubResponse(features: any): InteractiveBridge {
    const playerBridge = new StubPlayerBridge();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    playerBridge.features = features;
    return new InteractiveBridge(playerBridge);
  }

  async function assertGetFeaturesResponseYieldsResult(
    response: any,
    expected: Feature[],
  ) {
    const interactiveBridge = arrangeWithStubResponse(response);
    const featureList = await interactiveBridge.getFeatures();
    expect(featureList.sort()).toEqual(expected.sort());
  }

  async function assertGetFeaturesResponseCausesError(response: any) {
    const interactiveBridge = arrangeWithStubResponse(response);
    try {
      await interactiveBridge.getFeatures();
      expect.fail();
    } catch {
      expect(true);
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  test('getFeatures returns promise of list of features', async () => {
    await assertGetFeaturesResponseYieldsResult(
      ['AIRPLAY', 'CHROMECAST', 'CONTACT', 'FULLSCREEN', 'PIP', 'SCRUBBER'],
      ['AIRPLAY', 'CHROMECAST', 'CONTACT', 'FULLSCREEN', 'PIP', 'SCRUBBER'],
    );
  });

  test('getFeatures filters out duplicates', async () => {
    await assertGetFeaturesResponseYieldsResult(
      ['AIRPLAY', 'AIRPLAY'],
      ['AIRPLAY'],
    );
  });

  test('getFeatures filters out unrecognized features', async () => {
    await assertGetFeaturesResponseYieldsResult(
      ['DOES-NOT-EXIST', 'AIRPLAY', 1],
      ['AIRPLAY'],
    );
    await assertGetFeaturesResponseYieldsResult(
      ['DOES-NOT-EXIST', 'AIRPLAY', 1, 'PIP', 'GARBAGE'],
      ['AIRPLAY', 'PIP'],
    );
  });

  test('getFeatures rejects responses of the wrong type', async () => {
    await assertGetFeaturesResponseCausesError('wrong-type');
    await assertGetFeaturesResponseCausesError({});
    await assertGetFeaturesResponseCausesError(1);
  });
});

describe.skip('InteractiveBridge.getLatency()');

describe.skip('InteractiveBridge.getLiveryParams()');

describe.skip('InteractiveBridge.getPlayerVersion()');

describe.skip('InteractiveBridge.getStreamId()');
