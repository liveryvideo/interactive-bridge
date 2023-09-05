/* eslint-disable max-classes-per-file */
import { describe, expect, test } from 'vitest';
import type { Feature, PlaybackDetails } from '../src/InteractiveBridge';
import { InteractiveBridge } from '../src/InteractiveBridge';
import type { Quality } from '../src/InteractiveBridge/VideoCommands';
import { MockPlayerBridge } from '../src/MockPlayerBridge';
import { InvalidTypeError, SubscriptionError } from '../src/util/errors';

class StubPlayerBridge extends MockPlayerBridge {
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
    return new InteractiveBridge(playerBridge);
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
    return new InteractiveBridge(playerBridge);
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

/**
 * Subscribe commands:
 * On sending the command a Promise is created that will resolve or reject when a response is received
 * The resolution of a subscribe command indicates the completion of two actions:
 * - The listener sent as an argument to the subscribe command has been registered
 * - The current state of the data structure to which the listener subscribes has been retrieved and is being passed in the resolution to the Promise.
 *
 * Whenever the data structure subscribed to changes, the listener will be called synchronously, and the new state of the data structure will be passed in.
 *
 * There is no inverse command (i.e. there is no 'unsubscribe' command)
 *
 * Listeners should throw if the passed data is invalid. This is usually handled by decorating the listener
 * with a validate function. E.g.:
 * ```
 * subscribeExample( listener: (str: String) => void ) {
 *  const validatingListener = (possStr: unknown) => {
 *    // throw if not valid
 *    if (typeof possStr !== 'string') { throw Error() }
 *    // invoke original function, with definitely valid data
 *    return listener(possStr)
 *  }
 *  // ask the other side to invoke the validatingListener
 *  return this.sendCommand('subscribeExample', undefined, validatingListener);
 * }
 * ```
 *
 * Within validation, when the type of the object returned is not valid, the listener should throw
 * If the data structure is a collection and the type of any optional member is not valid, that member
 * should be fixed if possible and purged if not.
 */
describe('InteractiveBridge.subscribeQualities', () => {
  const lowQuality = {
    audio: {
      bandwidth: 24_000,
    },
    label: '270p',
    video: {
      bandwidth: 500_000,
      height: 270,
      width: 480,
    },
  };

  const medQuality = {
    audio: {
      bandwidth: 96_000,
    },
    label: '720p',
    video: {
      bandwidth: 3_000_000,
      height: 720,
      width: 1280,
    },
  };

  class ArgumentStoringListener {
    calls: unknown[] = [];

    listener = (qualities: Quality[]) => {
      this.calls.push(qualities);
    };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  function arrangeWithStubSubscribeQualitiesResponse(qualities: any) {
    const playerBridge = new StubPlayerBridge();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    playerBridge.setQualities(qualities);
    const interactiveBridge = new InteractiveBridge(playerBridge);
    return { interactiveBridge, playerBridge };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  describe('initial call', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async function assertSubscribeQualitiesResponseYieldsResult(
      qualities: any,
      expected: Quality[],
    ) {
      const { interactiveBridge } =
        arrangeWithStubSubscribeQualitiesResponse(qualities);
      const result = await interactiveBridge.subscribeQualities(() => {});
      expect(result).toEqual(expected);
    }

    async function assertSubscribeQualitiesResponseCausesInvalidTypeError(
      qualities: any,
    ) {
      const { interactiveBridge } =
        arrangeWithStubSubscribeQualitiesResponse(qualities);
      try {
        await interactiveBridge.subscribeQualities(() => {});
      } catch (error) {
        expect(error instanceof InvalidTypeError);
        return;
      }
      expect.fail();
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    test('call returns promise resolving to quality list', async () => {
      await assertSubscribeQualitiesResponseYieldsResult([], []);
      await assertSubscribeQualitiesResponseYieldsResult(
        [lowQuality],
        [{ ...lowQuality, index: 0 }],
      );
      await assertSubscribeQualitiesResponseYieldsResult(
        [lowQuality, medQuality],
        [
          { ...lowQuality, index: 0 },
          { ...medQuality, index: 1 },
        ],
      );
    });

    test('non array response throws InvalidType error', async () => {
      await assertSubscribeQualitiesResponseCausesInvalidTypeError(null);
      await assertSubscribeQualitiesResponseCausesInvalidTypeError(undefined);
      await assertSubscribeQualitiesResponseCausesInvalidTypeError(720);
      await assertSubscribeQualitiesResponseCausesInvalidTypeError('1080p');
      await assertSubscribeQualitiesResponseCausesInvalidTypeError({});
    });

    test('after InvalidType error, listener is subscribed', async () => {
      const argStoringListener = new ArgumentStoringListener();
      const { interactiveBridge, playerBridge } =
        arrangeWithStubSubscribeQualitiesResponse(null);
      try {
        await interactiveBridge.subscribeQualities(argStoringListener.listener);
      } catch {
        // noop
      }
      playerBridge.setQualities([]);
      expect(argStoringListener.calls.length).toBe(1);
      expect(argStoringListener.calls.pop()).toEqual([]);
    });

    test('malformed entries are sanitized where possible', async () => {
      await assertSubscribeQualitiesResponseYieldsResult(
        ['garbage'],
        [{ label: '0', index: 0 }],
      );
      await assertSubscribeQualitiesResponseYieldsResult([undefined], []);
      await assertSubscribeQualitiesResponseYieldsResult(
        [null],
        [{ label: '0', index: 0 }],
      );
    });

    test('sparse arrays are compacted', async () => {
      await assertSubscribeQualitiesResponseYieldsResult(
        [undefined, lowQuality],
        [{ ...lowQuality, index: 1 }],
      );
      await assertSubscribeQualitiesResponseYieldsResult(
        [undefined, 'garbage'],
        [{ label: '1', index: 1 }],
      );
      await assertSubscribeQualitiesResponseYieldsResult(
        [undefined, 'garbage', undefined, lowQuality],
        [
          { label: '1', index: 1 },
          { ...lowQuality, index: 3 },
        ],
      );
    });

    test('index on response object is overwritten with actual index', async () => {
      await assertSubscribeQualitiesResponseYieldsResult(
        [
          { ...lowQuality, index: 501 },
          { ...lowQuality, index: NaN },
        ],
        [
          { ...lowQuality, index: 0 },
          { ...lowQuality, index: 1 },
        ],
      );
    });

    test('if no label given, stringified index is used', async () => {
      const myQuality: Record<string, unknown> = { ...lowQuality };
      delete myQuality.label;
      await assertSubscribeQualitiesResponseYieldsResult(
        [myQuality],
        [{ ...myQuality, index: 0, label: '0' } as Quality],
      );
    });
  });

  describe('calls to listener', () => {
    test('from other side of bridge', async () => {
      const argStoringListener = new ArgumentStoringListener();
      const { interactiveBridge, playerBridge } =
        arrangeWithStubSubscribeQualitiesResponse([]);
      await interactiveBridge.subscribeQualities(argStoringListener.listener);
      playerBridge.setQualities([{ ...lowQuality, index: NaN }]);
      expect(argStoringListener.calls.length).toBe(1);
    });

    test('no call on first subscription', async () => {
      const argStoringListener = new ArgumentStoringListener();
      const { interactiveBridge } = arrangeWithStubSubscribeQualitiesResponse(
        [],
      );
      await interactiveBridge.subscribeQualities(argStoringListener.listener);
      expect(argStoringListener.calls.pop()).toBe(undefined);
    });

    test('listeners throw given non-array argument', async () => {
      const argStoringListener = new ArgumentStoringListener();
      const { interactiveBridge, playerBridge } =
        arrangeWithStubSubscribeQualitiesResponse([]);
      await interactiveBridge.subscribeQualities(argStoringListener.listener);
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        playerBridge.setQualities('garbage');
      } catch {
        expect(true);
        return;
      }
      expect.fail();
    });
  });

  describe('failing subscription', () => {
    class RejectingPlayerBridge extends MockPlayerBridge {
      protected override handleCommand() {
        throw Error();
      }
    }

    test('rejection response throws SubscriptionError', async () => {
      const argStoringListener = new ArgumentStoringListener();
      const playerBridge = new RejectingPlayerBridge();
      const interactiveBridge = new InteractiveBridge(playerBridge);
      try {
        await interactiveBridge.subscribeQualities(argStoringListener.listener);
      } catch (error) {
        expect(error instanceof SubscriptionError);
        return;
      }
      expect.fail();
    });
  });
});
