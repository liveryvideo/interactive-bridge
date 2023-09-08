import { test } from 'vitest';
import { ChromecastSubscriber } from '../src/InteractiveBridge/ChromecastSubscriber';
import { SubscribeChromecastCommandHandler } from '../src/SubscribeChromecastCommandHandler';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  SubscribeChromecastCommandHandler,
  ChromecastSubscriber,
);

test('given value, command subscribeChromecast yields response', async () => {
  await tester.assertValueYieldsResult('', '');
  await tester.assertValueYieldsResult(undefined, undefined);
  await tester.assertValueYieldsResult('arbitrary string', 'arbitrary string');
  await tester.assertValueYieldsResult(
    'special\ncharacter',
    'special\ncharacter',
  );
});

test('given invalid value, command subscribeChromecast throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError(true);
  await tester.assertValueThrowsInvalidTypeError(false);
  await tester.assertValueThrowsInvalidTypeError({});
  await tester.assertValueThrowsInvalidTypeError([]);
});

test('given subscribed listener, set value calls listener with value', async () => {
  await tester.assertSetValueCallsListenerWithArgument(
    undefined,
    'arbitrary string',
    'arbitrary string',
  );
  await tester.assertSetValueCallsListenerWithArgument(
    'arbitrary string',
    undefined,
    undefined,
  );
  await tester.assertSetValueCallsListenerWithArgument(
    undefined,
    'special\ncharacter',
    'special\ncharacter',
  );
});

test('given invalid value, setValue throws InvalidTypeError', async () => {
  await tester.assertSetValueThrowsInvalidTypeError(undefined, null);
  await tester.assertSetValueThrowsInvalidTypeError(undefined, 0);
  await tester.assertSetValueThrowsInvalidTypeError(undefined, 1);
  await tester.assertSetValueThrowsInvalidTypeError(undefined, true);
  await tester.assertSetValueThrowsInvalidTypeError(undefined, {});
});
