import { describe, expect, test } from 'vitest';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { QualitiesSubscriber } from '../src/InteractiveBridge/QualitiesSubscriber';
import type { Quality } from '../src/InteractiveBridge/VideoCommands';
import { MockPlayerBridge } from '../src/MockPlayerBridge';
import { SubscribeQualitiesCommandHandler } from '../src/SubscribeQualitiesCommandHandler';
import { InvalidTypeError, SubscriptionError } from '../src/util/errors';
import { ArgumentStoringListener } from './doubles/ArgumentStoringListener';
import { createSendCommand } from './doubles/createSendCommand';

describe('InteractiveBridge.subscribeQualities', () => {
  const lowQuality = {
    audio: {
      bandwidth: 24000,
    },
    label: '270p',
    video: {
      bandwidth: 500000,
      height: 270,
      width: 480,
    },
  };

  const medQuality = {
    audio: {
      bandwidth: 96000,
    },
    label: '720p',
    video: {
      bandwidth: 3000000,
      height: 720,
      width: 1280,
    },
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-unsafe-argument */
  function arrangeWithInitialValue(qualities: any) {
    const subscribeQualitiesCommandHandler =
      new SubscribeQualitiesCommandHandler(qualities);
    const sendCommand = createSendCommand(subscribeQualitiesCommandHandler);
    const qualitiesSubscription = new QualitiesSubscriber(sendCommand);
    return { qualitiesSubscription, subscribeQualitiesCommandHandler };
  }
  /* eslint-enable @typescript-eslint/no-unsafe-argument */
  /* eslint-enable @typescript-eslint/no-explicit-any */

  describe('initial call', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    async function assertValueYieldsResult(
      qualities: any,
      expected: Quality[],
    ) {
      const { qualitiesSubscription } = arrangeWithInitialValue(qualities);
      const result = await qualitiesSubscription.subscribe(() => {});
      expect(result).toEqual(expected);
    }

    async function assertValueCausesInvalidTypeError(qualities: any) {
      const { qualitiesSubscription } = arrangeWithInitialValue(qualities);
      try {
        await qualitiesSubscription.subscribe(() => {});
      } catch (error) {
        expect(error instanceof InvalidTypeError);
        return;
      }
      expect.fail();
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    test('call returns promise resolving to quality list', async () => {
      await assertValueYieldsResult([], []);
      await assertValueYieldsResult(
        [lowQuality],
        [{ ...lowQuality, index: 0 }],
      );
      await assertValueYieldsResult(
        [lowQuality, medQuality],
        [
          { ...lowQuality, index: 0 },
          { ...medQuality, index: 1 },
        ],
      );
    });

    test('non array response throws InvalidType error', async () => {
      await assertValueCausesInvalidTypeError(null);
      await assertValueCausesInvalidTypeError(undefined);
      await assertValueCausesInvalidTypeError(720);
      await assertValueCausesInvalidTypeError('1080p');
      await assertValueCausesInvalidTypeError({});
    });

    test('after InvalidType error, listener is subscribed', async () => {
      const recorder = new ArgumentStoringListener();
      const { qualitiesSubscription, subscribeQualitiesCommandHandler } =
        arrangeWithInitialValue(null);
      try {
        await qualitiesSubscription.subscribe(recorder.listener);
      } catch {
        // noop
      }
      subscribeQualitiesCommandHandler.setValue([]);
      expect(recorder.calls.length).toBe(1);
      expect(recorder.calls.pop()).toEqual([]);
    });

    test('malformed entries are sanitized where possible', async () => {
      await assertValueYieldsResult(['garbage'], [{ label: '0', index: 0 }]);
      await assertValueYieldsResult([undefined], []);
      await assertValueYieldsResult([null], [{ label: '0', index: 0 }]);
    });

    test('sparse arrays are compacted', async () => {
      await assertValueYieldsResult(
        [undefined, lowQuality],
        [{ ...lowQuality, index: 1 }],
      );
      await assertValueYieldsResult(
        [undefined, 'garbage'],
        [{ label: '1', index: 1 }],
      );
      await assertValueYieldsResult(
        [undefined, 'garbage', undefined, lowQuality],
        [
          { label: '1', index: 1 },
          { ...lowQuality, index: 3 },
        ],
      );
    });

    test('index on response object is overwritten with actual index', async () => {
      await assertValueYieldsResult(
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
      await assertValueYieldsResult(
        [myQuality],
        [{ ...myQuality, index: 0, label: '0' } as Quality],
      );
    });
  });

  describe('calls to listener', () => {
    test('from other side of bridge', async () => {
      const recorder = new ArgumentStoringListener();
      const { qualitiesSubscription, subscribeQualitiesCommandHandler } =
        arrangeWithInitialValue([]);
      await qualitiesSubscription.subscribe(recorder.listener);
      subscribeQualitiesCommandHandler.setValue([
        { ...lowQuality, index: NaN },
      ]);
      expect(recorder.calls).toEqual([[{ ...lowQuality, index: 0 }]]);
    });

    test('listeners throw given non-array argument', async () => {
      const recorder = new ArgumentStoringListener();
      const { qualitiesSubscription, subscribeQualitiesCommandHandler } =
        arrangeWithInitialValue([]);
      await qualitiesSubscription.subscribe(recorder.listener);
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        subscribeQualitiesCommandHandler.setValue('garbage');
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
      const recorder = new ArgumentStoringListener();
      const playerBridge = new RejectingPlayerBridge();
      const interactiveBridge = new InteractiveBridge(playerBridge);
      try {
        await interactiveBridge.subscribeQualities(recorder.listener);
      } catch (error) {
        expect(error instanceof SubscriptionError);
        return;
      }
      expect.fail();
    });
  });
});
