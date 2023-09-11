import { test } from 'vitest';
import { StreamPhaseTimelineParser } from '../src/InteractiveBridge/StreamPhaseTimelineParser';
import { SubscriberTestApparatus } from './utils/SubscriberTestApparatus';

const tester = new SubscriberTestApparatus(
  'subscribeStreamPhaseTimeline',
  StreamPhaseTimelineParser,
);

test('given value, command subscribeStreamPhaseTimeline yeilds response', async () => {
  await tester.assertValueYieldsResult({}, {});
  await tester.assertValueYieldsResult({ garbage: 'LIVE' }, {});
  await tester.assertValueYieldsResult(
    { 0: 'LIVE', 1: 'POST', 2: 'PRE' },
    { 0: 'LIVE', 1: 'POST', 2: 'PRE' },
  );
  await tester.assertValueYieldsResult(
    { 1.2121212121: 'PRE' },
    { 1.2121212121: 'PRE' },
  );
  await tester.assertValueYieldsResult(
    { 0: 'PRE', garbage: 'LIVE' },
    { 0: 'PRE' },
  );
  await tester.assertValueYieldsResult(
    { 0: 'PRE', 1: 'garbage' },
    { 0: 'PRE' },
  );
  await tester.assertValueYieldsResult(
    { 0: 'LIVE', 1: 'LIVE' },
    { 0: 'LIVE', 1: 'LIVE' },
  );
});

test('given invalid value, command subscribeStreamPhaseTimeline throws InvalidTypeError', async () => {
  await tester.assertValueThrowsInvalidTypeError(null);
  await tester.assertValueThrowsInvalidTypeError(undefined);
  await tester.assertValueThrowsInvalidTypeError(0);
  await tester.assertValueThrowsInvalidTypeError(1);
  await tester.assertValueThrowsInvalidTypeError('string');
  await tester.assertValueThrowsInvalidTypeError([]);
});
