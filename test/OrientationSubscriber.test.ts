import { test } from 'vitest';
import { OrientationParser } from '../src/InteractiveBridge/OrientationParser';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribeOrientation',
  OrientationParser,
);

test('given value, command subscribeOrientation yields response', async () => {
  await tester.assertValueYieldsResult('landscape', 'landscape');
  await tester.assertValueYieldsResult('portrait', 'portrait');
});

test('given invalid value, command subscribeOrientation throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError(true);
  await tester.assertValueThrowsInvalidTypeError(false);
  await tester.assertValueThrowsInvalidTypeError('garbage');
  await tester.assertValueThrowsInvalidTypeError('LANDSCAPE');
  await tester.assertValueThrowsInvalidTypeError({});
  await tester.assertValueThrowsInvalidTypeError([]);
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument(
    'portrait',
    'landscape',
    'landscape',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    'landscape',
    'portrait',
    'portrait',
  );
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError('landscape', null);
  await tester.assertSetValueThrowsInvalidTypeError('landscape', undefined);
  await tester.assertSetValueThrowsInvalidTypeError('landscape', 0);
  await tester.assertSetValueThrowsInvalidTypeError('landscape', 1);
  await tester.assertSetValueThrowsInvalidTypeError('landscape', 'garbage');
  await tester.assertSetValueThrowsInvalidTypeError('landscape', {});
});
