/* eslint-disable max-classes-per-file */
import { describe, expect, test } from 'vitest';
import type { Feature, PlaybackDetails } from '../src/InteractiveBridgeFacade';
import { InteractiveBridgeFacade } from '../src/InteractiveBridgeFacade';
import { MockPlayerBridge } from '../src/MockPlayerBridge';

export class StubPlayerBridge extends MockPlayerBridge {
  features: Feature[] = [];

  playback = { buffer: 0, duration: 0, position: 0 };

  protected override getFeatures(): Feature[] {
    return this.features;
  }

  protected override getPlayback() {
    return this.playback;
  }
}

describe.skip('InteractiveBridge.getAppName()');

describe.skip('InteractiveBridge.getCustomerId()');

describe.skip('InteractiveBridge.getEndpointId()');

describe('InteractiveBridge.getFeatures()', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  function arrangeWithStubGetFeaturesResponse(response: any) {
    const playerBridge = new StubPlayerBridge();
    playerBridge.features = response;
    return new InteractiveBridgeFacade(playerBridge);
  }

  async function assertGetFeaturesResponseYieldsResult(
    response: any,
    expected: Feature[],
  ) {
    const interactiveBridge = arrangeWithStubGetFeaturesResponse(response);
    const featureList = await interactiveBridge.getFeatures();
    expect(featureList.sort()).toEqual(expected.sort());
  }

  async function assertGetFeaturesResponseCausesError(response: any) {
    const interactiveBridge = arrangeWithStubGetFeaturesResponse(response);
    try {
      await interactiveBridge.getFeatures();
    } catch {
      expect(true);
      return;
    }
    expect.fail();
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
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

describe('InteractiveBridge.getPlayback()', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  function arrangeWithStubGetPlaybackResponse(response: any) {
    const playerBridge = new StubPlayerBridge();
    playerBridge.playback = response;
    return new InteractiveBridgeFacade(playerBridge);
  }

  async function assertGetPlaybackResponseYieldsResult(
    response: any,
    expected: PlaybackDetails,
  ) {
    const interactiveBridge = arrangeWithStubGetPlaybackResponse(response);
    const playbackDetails = await interactiveBridge.getPlayback();
    expect(playbackDetails).toEqual(expected);
  }

  async function assertGetPlaybackResponseYieldsSame(
    response: PlaybackDetails,
  ) {
    await assertGetPlaybackResponseYieldsResult(response, response);
  }

  async function assertGetPlaybackResponseCausesError(response: any) {
    const interactiveBridge = arrangeWithStubGetPlaybackResponse(response);
    try {
      await interactiveBridge.getPlayback();
    } catch (error) {
      expect(true);
      return;
    }
    expect.fail();
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  /* eslint-enable @typescript-eslint/no-explicit-any */

  test('response resolves to playback object', async () => {
    await assertGetPlaybackResponseYieldsSame({
      buffer: 0,
      duration: 0,
      position: 0,
    });
    await assertGetPlaybackResponseYieldsSame({
      buffer: 0,
      duration: 0,
      position: 1,
    });
    await assertGetPlaybackResponseYieldsSame({
      buffer: 1,
      duration: 1,
      position: 1,
    });
    await assertGetPlaybackResponseYieldsSame({
      buffer: 999,
      duration: 333,
      position: 111,
    });
  });

  test('non object response produces error', async () => {
    await assertGetPlaybackResponseCausesError(1);
    await assertGetPlaybackResponseCausesError({});
    await assertGetPlaybackResponseCausesError({ buffer: 1, duration: 1 });
    await assertGetPlaybackResponseCausesError({
      buffer: 1,
      duration: 1,
      position: 'a',
    });
    await assertGetPlaybackResponseCausesError({
      buffer: 1,
      duration: 'a',
      position: 1,
    });
    await assertGetPlaybackResponseCausesError({
      buffer: 'a',
      duration: 1,
      position: 1,
    });
  });

  test('additional fields are stripped from response', async () => {
    await assertGetPlaybackResponseYieldsResult(
      { buffer: 1, duration: 1, position: 1, sneaky: 1 },
      { buffer: 1, duration: 1, position: 1 },
    );
  });
});

describe.skip('InteractiveBridge.getLatency()');

describe.skip('InteractiveBridge.getLiveryParams()');

describe.skip('InteractiveBridge.getPlayerVersion()');

describe.skip('InteractiveBridge.getStreamId()');

describe.skip('InteractiveBridge.subscribeFullscreen', () => {});

describe.skip('InteractiveBridge.subscribeOrientation', () => {});

describe.skip('InteractiveBridge.subscribeQuality', () => {});

describe('InteractiveBridge.subscribeStreamPhase', () => {
  test('retrieves set stream phase');
  test(
    'with stream phase not valid string, invocation throws InvalidType error',
  );
  test('invocation registers listener');
  test('invocation does not call listener');
  test('when stream phase set listener is called');
  test('when stream phase set with non-valid argument listener throws');
});
