import { test } from 'vitest';
import { PlaybackModeParser } from '../src/InteractiveBridge/PlaybackModeParser';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribePlaybackMode',
  PlaybackModeParser,
);

test('given value, command subscribePlaybackMode yields response', async () => {
  await tester.assertValueYieldsResult('CATCHUP', 'CATCHUP');
  await tester.assertValueYieldsResult('LIVE', 'LIVE');
  await tester.assertValueYieldsResult('UNKNOWN', 'UNKNOWN');
  await tester.assertValueYieldsResult('VOD', 'VOD');
});

test('given invalid value, command subscribePlaybackMode throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError('OTHER');
  await tester.assertValueThrowsInvalidTypeError('live');
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument(
    'LIVE',
    'CATCHUP',
    'CATCHUP',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    'UNKNOWN',
    'LIVE',
    'LIVE',
  );
  await tester.assertSetValueCallsListenerWithArgument('UNKNOWN', 'VOD', 'VOD');
  await tester.assertSetValueCallsListenerWithArgument(
    'LIVE',
    'UNKNOWN',
    'UNKNOWN',
  );
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', null);
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', undefined);
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', 0);
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', 1);
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', 'garbage');
  await tester.assertSetValueThrowsInvalidTypeError('UNKNOWN', {});
});
