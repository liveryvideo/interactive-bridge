import { test } from 'vitest';
import { MutedParser } from '../src/InteractiveBridge/MutedParser';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus('subscribeMuted', MutedParser);

test('given value, command subscribeMuted yields response', async () => {
  await tester.assertValueYieldsResult(true, true);
  await tester.assertValueYieldsResult(false, false);
});

test('given invalid value, command subscribeMuted throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError('garbage');
  await tester.assertValueThrowsInvalidTypeError({});
  await tester.assertValueThrowsInvalidTypeError([]);
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument(true, false, false);
  await tester.assertSetValueCallsListenerWithArgument(false, true, true);
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError(false, null);
  await tester.assertSetValueThrowsInvalidTypeError(false, undefined);
  await tester.assertSetValueThrowsInvalidTypeError(false, 0);
  await tester.assertSetValueThrowsInvalidTypeError(false, 1);
  await tester.assertSetValueThrowsInvalidTypeError(false, 'garbage');
  await tester.assertSetValueThrowsInvalidTypeError(false, {});
});
