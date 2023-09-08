import { describe, test } from 'vitest';
import type { Controls } from '../src/InteractiveBridge/ControlsParser';
import { ControlsSubscriber } from '../src/InteractiveBridge/ControlsSubscriber';
import { SubscribeControlsCommandHandler } from '../src/SubscribeControlsCommandHandler';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  SubscribeControlsCommandHandler,
  ControlsSubscriber,
);

const allFalse: Controls = {
  cast: false,
  contact: false,
  error: false,
  fullscreen: false,
  mute: false,
  pip: false,
  play: false,
  quality: false,
  scrubber: false,
};

const allTrue: Controls = {
  cast: true,
  contact: true,
  error: true,
  fullscreen: true,
  mute: true,
  pip: true,
  play: true,
  quality: true,
  scrubber: true,
};

describe('parser', () => {
  test('all false', async () => {
    await tester.assertValueYieldsResult({ ...allFalse }, { ...allFalse });
  });

  test('all true', async () => {
    await tester.assertValueYieldsResult({ ...allTrue }, { ...allTrue });
  });

  test('absent fields parse to false', async () => {
    await tester.assertValueYieldsResult({}, { ...allFalse });
    await tester.assertValueYieldsResult(
      { pip: true },
      { ...allFalse, pip: true },
    );
  });

  test('non true values parse to false', async () => {
    await tester.assertValueYieldsResult(
      { ...allTrue, play: 1 },
      { ...allTrue, play: false },
    );
    await tester.assertValueYieldsResult(
      { ...allTrue, play: 'unexpected' },
      { ...allTrue, play: false },
    );
    await tester.assertValueYieldsResult(
      { ...allTrue, mute: 1 },
      { ...allTrue, mute: false },
    );
    await tester.assertValueYieldsResult(
      { ...allTrue, mute: 'unexpected' },
      { ...allTrue, mute: false },
    );
  });

  test('unrecognized fields are stripped', async () => {
    await tester.assertValueYieldsResult(
      { ...allTrue, garbage: true },
      { ...allTrue },
    );
  });

  test('given invalid value, throws InvalidTypeError', async () => {
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, null);
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, undefined);
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, 0);
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, 1);
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, 'garbage');
    await tester.assertSetValueThrowsInvalidTypeError(allFalse, []);
  });
});
