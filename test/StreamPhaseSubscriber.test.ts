import { test } from 'vitest';
import { StreamPhaseParser } from '../src/InteractiveBridge/StreamPhaseParser';
import { SubscribeStreamPhaseCommandHandler } from '../src/SubscribeStreamPhaseCommandHandler';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribeStreamPhase',
  StreamPhaseParser,
  SubscribeStreamPhaseCommandHandler,
);

test('given value, command subscribeStreamPhase yields response', async () => {
  await tester.assertValueYieldsResult('PRE', 'PRE');
  await tester.assertValueYieldsResult('LIVE', 'LIVE');
  await tester.assertValueYieldsResult('POST', 'POST');
});

test('given invalid value, command subscribeStreamPhase throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError('OTHER');
  await tester.assertValueThrowsInvalidTypeError('live');
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument('PRE', 'LIVE', 'LIVE');
  await tester.assertSetValueCallsListenerWithArgument('LIVE', 'POST', 'POST');
  await tester.assertSetValueCallsListenerWithArgument('POST', 'PRE', 'PRE');
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError('PRE', null);
  await tester.assertSetValueThrowsInvalidTypeError('PRE', undefined);
  await tester.assertSetValueThrowsInvalidTypeError('PRE', 0);
  await tester.assertSetValueThrowsInvalidTypeError('PRE', 1);
  await tester.assertSetValueThrowsInvalidTypeError('PRE', 'garbage');
  await tester.assertSetValueThrowsInvalidTypeError('PRE', {});
});
