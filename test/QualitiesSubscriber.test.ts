import { describe, expect, test } from 'vitest';
import { InteractiveBridge } from '../src/InteractiveBridge';
import { QualitiesParser } from '../src/InteractiveBridge/QualitiesParser';
import type { Quality } from '../src/InteractiveBridge/VideoCommands';
import { MockPlayerBridge } from '../src/MockPlayerBridge';
import { SubscribeQualitiesCommandHandler } from '../src/SubscribeQualitiesCommandHandler';
import { Subscriber } from '../src/util/Subscriber';
import { SubscriptionError } from '../src/util/errors';
import { noop } from '../src/util/functions';
import { ArgumentStoringListener } from './doubles/ArgumentStoringListener';
import { createSendCommand } from './doubles/createSendCommand';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribeQualities',
  QualitiesParser,
  SubscribeQualitiesCommandHandler,
);

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
    const handler = new SubscribeQualitiesCommandHandler(qualities);
    const sendCommand = createSendCommand(handler);
    const subscriber = new Subscriber(
      'subscribeQualities',
      new QualitiesParser(),
      sendCommand,
    );
    return { subscriber, handler };
  }
  /* eslint-enable @typescript-eslint/no-unsafe-argument */
  /* eslint-enable @typescript-eslint/no-explicit-any */

  describe('abstraction tests', () => {
    test('after InvalidType error, listener is subscribed', async () => {
      const recorder = new ArgumentStoringListener();
      const {
        subscriber: qualitiesSubscription,
        handler: subscribeQualitiesCommandHandler,
      } = arrangeWithInitialValue(null);
      try {
        await qualitiesSubscription.subscribe(recorder.listener);
      } catch {
        noop();
      }
      subscribeQualitiesCommandHandler.setValue([]);
      expect(recorder.calls.length).toBe(1);
      expect(recorder.calls.pop()).toEqual([]);
    });

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

  describe('initial call', () => {
    test('call returns promise resolving to quality list', async () => {
      await tester.assertValueYieldsResult([], []);
      await tester.assertValueYieldsResult(
        [lowQuality],
        [{ ...lowQuality, index: 0 }],
      );
      await tester.assertValueYieldsResult(
        [lowQuality, medQuality],
        [
          { ...lowQuality, index: 0 },
          { ...medQuality, index: 1 },
        ],
      );
    });

    test('non array response throws InvalidType error', async () => {
      await tester.assertValueThrowsInvalidTypeError(null);
      await tester.assertValueThrowsInvalidTypeError(undefined);
      await tester.assertValueThrowsInvalidTypeError(720);
      await tester.assertValueThrowsInvalidTypeError('1080p');
      await tester.assertValueThrowsInvalidTypeError({});
    });

    test('malformed entries are sanitized where possible', async () => {
      await tester.assertValueYieldsResult(
        ['garbage'],
        [{ label: '0', index: 0 }],
      );
      await tester.assertValueYieldsResult([undefined], []);
      await tester.assertValueYieldsResult([null], [{ label: '0', index: 0 }]);
    });

    test('sparse arrays are compacted', async () => {
      await tester.assertValueYieldsResult(
        [undefined, lowQuality],
        [{ ...lowQuality, index: 1 }],
      );
      await tester.assertValueYieldsResult(
        [undefined, 'garbage'],
        [{ label: '1', index: 1 }],
      );
      await tester.assertValueYieldsResult(
        [undefined, 'garbage', undefined, lowQuality],
        [
          { label: '1', index: 1 },
          { ...lowQuality, index: 3 },
        ],
      );
    });

    test('index on response object is overwritten with actual index', async () => {
      await tester.assertValueYieldsResult(
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
      await tester.assertValueYieldsResult(
        [myQuality],
        [{ ...myQuality, index: 0, label: '0' } as Quality],
      );
    });
  });

  describe('calls to listener', () => {
    test('given subscribed listener, set value calls listener with value', async () => {
      await tester.assertSetValueCallsListenerWithArgument(
        [],
        [{ ...lowQuality, index: NaN }],
        [{ ...lowQuality, index: 0 }],
      );
    });

    test('listeners throw given non-array argument', async () => {
      await tester.assertSetValueThrowsInvalidTypeError([], 'garbage');
    });
  });
});
