import { test } from 'vitest';
import { QualitySubscriber } from '../src/InteractiveBridge/QualitySubscriber';
import { SubscribeQualityCommandHandler } from '../src/SubscribeQualityCommandHandler';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  SubscribeQualityCommandHandler,
  QualitySubscriber,
);

test('given value, command subscribeQuality yields response', async () => {
  await tester.assertValueYieldsResult('', '');
  await tester.assertValueYieldsResult('1080p', '1080p');
  await tester.assertValueYieldsResult('arbitrary string', 'arbitrary string');
  await tester.assertSetValueCallsListenerWithArgument(
    '',
    'special\ncharacter',
    'special\ncharacter',
  );
});

test('given invalid value, command subscribeQuality throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError(true);
  await tester.assertValueThrowsInvalidTypeError(false);
  await tester.assertValueThrowsInvalidTypeError({});
  await tester.assertValueThrowsInvalidTypeError([]);
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument('', '5Mb/s', '5Mb/s');
  await tester.assertSetValueCallsListenerWithArgument(
    '',
    '1280x720',
    '1280x720',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    '',
    'special\ncharacter',
    'special\ncharacter',
  );
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError('', null);
  await tester.assertSetValueThrowsInvalidTypeError('', undefined);
  await tester.assertSetValueThrowsInvalidTypeError('', 0);
  await tester.assertSetValueThrowsInvalidTypeError('', 1);
  await tester.assertSetValueThrowsInvalidTypeError('', true);
  await tester.assertSetValueThrowsInvalidTypeError('', {});
});
