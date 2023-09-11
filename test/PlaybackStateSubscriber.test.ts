import { test } from 'vitest';
import { PlaybackStateParser } from '../src/InteractiveBridge/PlaybackStateParser';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribePlaybackState',
  PlaybackStateParser,
);

test('given value, command subscribePlaybackState yields response', async () => {
  await tester.assertValueYieldsResult('BUFFERING', 'BUFFERING');
  await tester.assertValueYieldsResult('ENDED', 'ENDED');
  await tester.assertValueYieldsResult('FAST_FORWARD', 'FAST_FORWARD');
  await tester.assertValueYieldsResult('PAUSED', 'PAUSED');
  await tester.assertValueYieldsResult('PLAYING', 'PLAYING');
  await tester.assertValueYieldsResult('REWIND', 'REWIND');
  await tester.assertValueYieldsResult('SEEKING', 'SEEKING');
  await tester.assertValueYieldsResult('SLOW_MO', 'SLOW_MO');
});

test('given invalid value, command subscribePlaybackState throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError('OTHER');
  await tester.assertValueThrowsInvalidTypeError('playing');
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument(
    'BUFFERING',
    'PLAYING',
    'PLAYING',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    'BUFFERING',
    'ENDED',
    'ENDED',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    'PLAYING',
    'BUFFERING',
    'BUFFERING',
  );
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', null);
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', undefined);
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', 0);
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', 1);
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', 'garbage');
  await tester.assertSetValueThrowsInvalidTypeError('BUFFERING', {});
});
